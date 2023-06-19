import { Snowflake } from 'discord.js';

import * as models from '../database.models';
import BaseServer from './BaseServer';
import Client from '../Root/Client';

/**
 * The player server.
 */
export default class PlayerServer extends BaseServer {
  /**
   * The PlayerServer constructor.
   * @param client The client instance.
   */
  constructor(client: Client) {
    super(client, models.Player);
  }

  /**
   * Get the player, returns null if not found.
   * @param playerId The player id.
   * @returns The player.
   */
  public async get(playerId: Snowflake): Promise<typeof models.Player | null> {
    return this.mongooseModel.findOne({ discordId: playerId });
  }

  /**
   * Create a new player.
   * @param playerId The player id.
   * @returns The created player.
   */
  public async create(playerId: Snowflake): Promise<void> {
    return new this.mongooseModel({
      discordId: playerId,
      username: 'Tanaka Ken',
      experience: 0,
      race: 'human',
      premium: false,
      art: 'water',
      way: 'warrior',
      techniqueCategoryLevels: {
        basic: 1,
        fineness: 1,
        heavy: 1,
        ultimate: 1,
      },
    });
  }
}
