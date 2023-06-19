"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models = require("../database.models");
const BaseServer_1 = require("./BaseServer");
/**
 * The player server.
 */
class PlayerServer extends BaseServer_1.default {
    /**
     * The PlayerServer constructor.
     * @param client The client instance.
     */
    constructor(client) {
        super(client, models.Player);
    }
    /**
     * Get the player, returns null if not found.
     * @param playerId The player id.
     * @returns The player.
     */
    async get(playerId) {
        return this.mongooseModel.findOne({ discordId: playerId });
    }
    /**
     * Create a new player.
     * @param playerId The player id.
     * @returns The created player.
     */
    async create(playerId) {
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
exports.default = PlayerServer;
