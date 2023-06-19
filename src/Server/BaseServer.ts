import { Model } from 'mongoose';

import Client from '../Root/Client';

/**
 * The player server.
 */
export default class BaseServer {
  /**
   * The client instance.
   */
  public readonly client: Client;
  /**
   * The mongoose model.
   */
  public readonly mongooseModel: typeof Model;

  /**
   * The PlayerServer constructor.
   * @param client The client instance.
   * @param mongooseModel The mongoose model.
   */
  constructor(client: Client, mongooseModel: typeof Model) {
    this.client = client;
    this.mongooseModel = mongooseModel;
  }
}
