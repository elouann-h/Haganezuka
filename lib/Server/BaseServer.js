"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The player server.
 */
class BaseServer {
    /**
     * The client instance.
     */
    client;
    /**
     * The mongoose model.
     */
    mongooseModel;
    /**
     * The PlayerServer constructor.
     * @param client The client instance.
     * @param mongooseModel The mongoose model.
     */
    constructor(client, mongooseModel) {
        this.client = client;
        this.mongooseModel = mongooseModel;
    }
}
exports.default = BaseServer;
