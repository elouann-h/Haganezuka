import { Collection, BaseInteraction } from 'discord.js';

import Command from './Command';
import Client from './Client';
import { err, log } from './Util';
import Context from './Context';

/**
 * The model of a callback function for an event.
 * @param args The command args.
 */
export type EventCallback = (...args: any[]) => void;

/**
 * A default callback function used when nothing is set.
 * @param args The command args.
 * @returns Void.
 */
export async function callbackDefault(...args: any[]): Promise<void> {
  return;
}

/**
 * Represents an Event on client service.
 */
export default class Event {
  /**
   * The client instance.
   */
  public readonly client: Client;
  /**
   * The event name.
   */
  public readonly name: string;
  /**
   * The callback function.
   */
  public callback: EventCallback;

  /**
   * @param client The client instance.
   * @param name The event name.
   */
  constructor(client: Client, name: string) {
    this.client = client;
    this.name = name;
    this.callback = callbackDefault;
  }

  /**
   * Call the callback function of an event.
   * @returns Void.
   */
  public async call(): Promise<void> {
    await this.callback(...arguments);
  }
}

/**
 * The collection that includes the default callback functions for basic events.
 */
export const defaultEventsCb: Collection<string, EventCallback> = new Collection();

defaultEventsCb.set('ready', (client: Client): void => {
  log(`Logged in as ${client.user.tag}.`);
});

defaultEventsCb.set('interactionCreate', async (client: Client, interaction: BaseInteraction): Promise<void> => {
  if (interaction.isButton() || interaction.isAnySelectMenu()) {
    if ((interaction.customId as string).startsWith('autodefer')) {
      await interaction.deferUpdate().catch(err);
    }
  }
  if (interaction.isChatInputCommand()) {
    const command: Command | undefined = client.Commands.getCommand(interaction.commandName);
    if (!command) return;
    const ctx: Context = new Context(interaction.channel, command, interaction, interaction.user);
    ctx.command = command;
    ctx.interaction = interaction;
    command.ctx = ctx;
    await command.execute(client, interaction, ctx);
  }
});
