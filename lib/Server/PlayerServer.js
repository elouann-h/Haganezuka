"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models = require("../database.models");
/**
 * The player server.
 */
class PlayerServer {
    /**
     * The client instance.
     */
    client;
    /**
     * The PlayerServer constructor.
     * @param client The client instance.
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * Get the player, returns null if not found.
     * @param playerId The player id.
     */
    async get(playerId) {
        return models.Player.findOne({ discordId: playerId });
    }
}
exports.default = PlayerServer;
