import { ApplicationCommandDataResolvable, Client, User } from 'discord.js';
import * as fs from 'fs';

import defaultData from '../../Res/ClientConfig';
import { CommandType } from './Command';
import CommandManager from './CommandManager';
import EventManager from './EventManager';
import * as Event from './Event';
import * as VoiceManager from './VoiceManager';
import { SFToUser } from './Util';
import Context from './Context';

/**
 * The pre-configured client class for the bot.
 */
export default class extends Client {
  /**
   * The directory to load the commands from.
   */
  public commandsDir: string = defaultData.commandsDir;
  /**
   * The command manager instance.
   */
  public readonly Commands: CommandManager = new CommandManager(this);
  /**
   * The event manager instance.
   */
  public readonly Events: EventManager = new EventManager(this);
  /**
   * The voice manager instance.
   */
  public readonly Voice: VoiceManager.default = new VoiceManager.default(this);

  /**
   * The constructor of the client.
   */
  constructor() {
    super({
      intents: defaultData.intents,
      failIfNotExists: defaultData.failIfNotExists,
      presence: defaultData.presence,
    });
  }

  /**
   * The function to load the commands.
   * @returns {Promise<void>}
   */
  public async loadCommands(): Promise<void> {
    const dir: string[] = fs.readdirSync(`./lib/${this.commandsDir}`);
    const commandsList: ApplicationCommandDataResolvable[] = [];

    for (const file of dir) {
      const command: CommandType = require(`../../${this.commandsDir}/${file}`).default as CommandType;
      commandsList.push(command);
      this.Commands.add(command);
    }

    await this.application.commands.set(commandsList);
  }

  /**
   * Launch the client after bounding events and sending commands to the API, if necessary.
   * Returns a simple string.
   * @param token The client token, if not specified before.
   * @returns A string constant "Logged in.".
   */
  public async login(token?: string): Promise<string> {
    this.Events.events.each((event: Event.default) => {
      if (event.name !== 'voiceStateUpdate') {
        const method: string = event.name === 'ready' ? 'once' : 'on';
        (this as { [index: string]: any })[method](event.name, (...args: any[]): void => {
          event.callback(this, ...args);
        });
      }
    });

    if (this.Voice.events.size > 0) {
      let event: Event.default = this.Events.events.find((evt: Event.default) => evt.name === 'voiceStateUpdate');
      if (!event) event = new Event.default(this, 'voiceStateUpdate');

      (this as { [index: string]: any }).on('voiceStateUpdate', async (oldState, newState): Promise<void> => {
        const changes: VoiceManager.VoiceEvent[] = VoiceManager.default.getChanges(oldState, newState);
        const user: User = await SFToUser(this, newState.id);
        const context: Context = new Context(newState.channel || oldState.channel, null, null, user);
        context.client = this;

        for (const voiceEvent of this.Voice.events.keys()) {
          if (!changes.includes(voiceEvent)) continue;
          this.Voice.events.get(voiceEvent)(changes, newState.member, context);
        }

        event.callback(this, oldState, newState);
      });
    }

    const logged: string = await super.login(token || this.token);
    if (defaultData.loadCommands) await this.loadCommands();

    return logged;
  }
}
