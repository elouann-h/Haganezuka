import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js';

import Client from './Client';
import Context from './Context';

/**
 * The type that represents a command with an additional function.
 */
export type CommandType = ChatInputApplicationCommandData & {
  /**
   * The function that will be executed when the command is called.
   */
  execute: (client: Client, interaction: ChatInputCommandInteraction, ctx: Context) => Promise<void>;
  /**
   * The commands that must be executed before this one.
   * If one of the interfering commands are currently running, this command will be ignored.
   */
  interferingCommands?: ChatInputApplicationCommandData['name'][];
  /**
   * The amount of time before running the command again. Must be between 0 and 300 seconds.
   */
  coolDown?: number;
  /**
   * Where the command should be executed.
   */
  guildOnly?: 'GUILD_ONLY' | 'GLOBAL' | 'BOTH';
  /**
   * If the previous field ('guildOnly') is set on GUILD_ONLY or BOTH.
   * List the guilds where the command should be executed.
   */
  guilds?: string[];
  /**
   * If the command is forbidden in some specific channels (use it for private bots).
   */
  forbiddenChannels?: string[];
  /**
   * If the command is forbidden for some specific users.
   */
  forbiddenUsers?: string[];
  /**
   * If the command is forbidden for some specific roles (use it for private bots).
   */
  forbiddenRoles?: string[];
};

/**
 * The class that represents a command.
 */
export default class Command {
  /**
   * The client instance.
   */
  public readonly client: Client;
  /**
   * The data of the command.
   */
  public readonly data: CommandType;
  /**
   * The function that will be executed when the command is called.
   */
  public execute: CommandType['execute'];
  /**
   * The context of the command.
   */
  public ctx: Context | undefined;

  /**
   * The constructor of the command.
   */
  constructor(client: Client, data: CommandType) {
    this.client = client;
    this.data = data;
    this.execute = data.execute;
  }

  /**
   * End the command. Call it when you want the command to be considered as finished and remove it from the interfering queue.
   * @returns Void.
   */
  public end(): void {
    if (!this.ctx) return;
    if (!this.ctx.interaction) return;

    this.client.Commands.Interfering.removeInterfering(this.ctx.interaction.user.id, this.ctx.interaction.id);
  }
}
