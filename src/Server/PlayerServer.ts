import { Snowflake } from 'discord.js';

import * as models from '../database.models';
import Client from '../Root/Client';

/**
 * The player server.
 */
export default class PlayerServer {
  /**
   * The client instance.
   */
  public readonly client: Client;

  /**
   * The PlayerServer constructor.
   * @param client The client instance.
   */
  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Get the player, returns null if not found.
   * @param playerId The player id.
   */
  public async get(playerId: Snowflake): Promise<typeof models.Player | null> {
    return models.Player.findOne({ discordId: playerId });
  }
}
