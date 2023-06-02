import { Collection, Snowflake } from 'discord.js';

import Client from './Client';

/**
 * Represents an element in the cool downs queue.
 */
export type CoolDownsQueueElement = [
  /**
   * The name of the command.
   */
  string,
  /**
   * The end time of the cool down.
   */
  number,
  /**
   * The cool down amount.
   */
  number,
];

/**
 * The main class that manages the active cool downs for commands.
 */
export default class CoolDownManager {
  /**
   * The client instance.
   */
  public readonly client: Client;
  /**
   * The collection of the current cool downs.
   */
  public readonly queue: Collection<Snowflake, CoolDownsQueueElement[]> = new Collection();

  /**
   * @param client The client instance.
   */
  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Register a cool down when a command is triggered.
   * @param userID The user ID of the command's author.
   * @param commandName The name of the command.
   * @param coolDown The cool down amount (waiting time before executing it again).
   * @returns Void.
   */
  public registerCoolDown(userID: Snowflake, commandName: string, coolDown: number): void {
    const endTime: number = Date.now() + coolDown * 1000;
    const currentCoolDowns: CoolDownsQueueElement[] = this.coolDowns(userID);

    currentCoolDowns.push([commandName, endTime, coolDown]);

    this.queue.set(userID, currentCoolDowns);
  }

  /**
   * Returns all the cool downs for a specified user.
   * @param userID The user ID to search for.
   * @param commandName The name of the command to filter by.
   * @returns The full list of the user's cool downs.
   */
  public coolDowns(userID: Snowflake, commandName?: string): CoolDownsQueueElement[] {
    let currentCoolDowns: CoolDownsQueueElement[] | [] = this.queue.get(userID) || [];

    const currentTime: number = Date.now();
    currentCoolDowns = currentCoolDowns.filter((queueElement: CoolDownsQueueElement): boolean => {
      return currentTime < queueElement[1];
    });
    this.queue.set(userID, currentCoolDowns);

    if (commandName) {
      return currentCoolDowns.filter((queueElement: CoolDownsQueueElement): boolean => {
        return queueElement[0] === commandName;
      });
    }
    return currentCoolDowns;
  }
}
