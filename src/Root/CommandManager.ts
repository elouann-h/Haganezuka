import { Collection } from 'discord.js';

import * as Command from './Command';
import CoolDownManager from './CoolDownManager';
import InterferingManager from './InterferingManager';
import Client from './Client';

/**
 * Represents the command manager of the client.
 */
export default class CommandManager {
  /**
   * The client instance.
   */
  public readonly client: Client;
  /**
   * The cool down manager instance, to have access to the different delays of the current commands.
   */
  public readonly CoolDowns: CoolDownManager;
  /**
   * The interfering manager instance, to have access to the different executing commands.
   */
  public readonly Interfering: InterferingManager;
  /**
   * The collection of the commands.
   */
  public readonly commandsList: Collection<string, Command.default> = new Collection();

  /**
   * @param client The client instance.
   */
  constructor(client: Client) {
    this.client = client;
    this.CoolDowns = new CoolDownManager(this.client);
    this.Interfering = new InterferingManager(this.client);
  }

  /**
   * Create a command based on the name and/or some options, and returns it.
   * @param data The name and/or the options.
   * @returns The command instance.
   */
  public create(data: string | Command.CommandType): Command.default {
    if (typeof data === 'string') {
      data = {
        name: data,
        description: 'No description provided.',
        execute: async (): Promise<void> => {},
      };
    }
    if (!data.type) data.type = 1;

    const desc: string = data?.description;
    if (!desc) {
      data.description = 'No description provided.';
    }

    return new Command.default(this.client, data);
  }

  /**
   * Add a command to the client (the bot) using the name, options or the command itself.
   * If no command is passed, the function creates one based on the data passed.
   * @param commandData The options passed (name, command options, command instance).
   * @returns The command manager instance (this).
   */
  public add(commandData: string | Command.CommandType | Command.default): CommandManager {
    if (commandData instanceof Command.default) {
      this.commandsList.set(commandData.data.name, commandData);
      return this;
    }
    const command: Command.default = this.create(commandData);
    this.commandsList.set(command.data.name, command);
    return this;
  }

  /**
   * Get a command from the cache with the name.
   * @param name The command name.
   * @returns The found command instance, or undefined.
   */
  public getCommand(name: string): Command.default | undefined {
    return this.commandsList.get(name);
  }
}
