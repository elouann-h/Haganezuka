import { Collection, Snowflake } from 'discord.js';

import Client from './Client';

/**
 * Represents an element in the interfering commands queue.
 * Interfering commands are commands that are currently executing.
 */
export type InterferingQueueElement = [
  /**
   * The name of the command.
   */
  string,
  /**
   * The date when the command began.
   */
  number,
  /**
   * The ID of the interaction.
   */
  Snowflake,
];

/**
 * The main class that manages the active cool downs for commands.
 */
export default class InterferingManager {
  /**
   * The client instance.
   */
  public readonly client: Client;
  /**
   * The collection of the current cool downs.
   */
  public readonly queue: Collection<Snowflake, InterferingQueueElement[]> = new Collection();

  /**
   * @param client The client instance.
   */
  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Register an interfering command when this command is triggered.
   * @param userID The user ID of the command's author.
   * @param commandName The name of the command.
   * @param interactionID The ID of the interaction.
   * @returns Void.
   */
  public registerInterfering(userID: Snowflake, commandName: string, interactionID: Snowflake): void {
    if (!userID || typeof userID !== 'string') throw new Error('Invalid user ID provided.');
    if (!commandName || typeof commandName !== 'string') throw new Error('Invalid command name provided.');
    if (!interactionID || typeof interactionID !== 'string') throw new Error('Invalid interaction ID provided.');

    const startTime: number = Date.now();
    const currentCoolDowns: InterferingQueueElement[] = this.interfering(userID);

    currentCoolDowns.push([commandName, startTime, interactionID]);

    this.queue.set(userID, currentCoolDowns);
  }

  /**
   * Returns all the interfering commands for a specified user.
   * @param userID The user ID to search for.
   * @param commands The names of the commands to filter by.
   * @returns The full list of the user's cool downs.
   */
  public interfering(userID: Snowflake, ...commands: string[]): InterferingQueueElement[] {
    if (!userID || typeof userID !== 'string') throw new Error('Invalid user ID provided.');
    if (commands.length > 0 && commands.some((command: string): boolean => typeof command !== 'string')) {
      throw new Error('Invalid commands names provided (list of strings).');
    }

    const currentInterfering: InterferingQueueElement[] | [] = this.queue.get(userID) || [];

    if (commands.length > 0) {
      return currentInterfering.filter((queueElement: InterferingQueueElement): boolean => {
        return commands.includes(queueElement[0]);
      });
    }
    return currentInterfering;
  }

  /**
   * Removes an interfering commands. If a name is passed, remove all the commands with that name.
   * If an ID is passed, remove the command with the same interaction ID.
   * @param userID The user ID to search for.
   * @param key The value to search for; either the name of the command or the interaction ID.
   * @returns Void.
   */
  public removeInterfering(userID: Snowflake, key: string | Snowflake): void {
    if (!userID || typeof userID !== 'string') throw new Error('Invalid user ID provided.');
    if (!key || typeof key !== 'string') throw new Error('Invalid key provided.');

    const currentInterfering: InterferingQueueElement[] = this.interfering(userID);
    const interferingNames: string[] = currentInterfering.map((queueElement: InterferingQueueElement): string => {
      return queueElement[0];
    });

    if (interferingNames.includes(key as string)) {
      this.queue.set(
        userID,
        currentInterfering.filter((queueElement: InterferingQueueElement): boolean => {
          return queueElement[0] !== key;
        }),
      );
    } else {
      this.queue.set(
        userID,
        currentInterfering.filter((queueElement: InterferingQueueElement): boolean => {
          return queueElement[2] !== key;
        }),
      );
    }
  }
}
