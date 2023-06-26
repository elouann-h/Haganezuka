"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const mongoose_1 = require("mongoose");
/**
 * The mongo schema for the player interface.
 */
const schema = new mongoose_1.Schema({
    discordId: { type: String, required: true },
    username: { type: String, required: true },
    experience: { type: Number, required: true },
    race: { type: String, required: true },
    premium: { type: Boolean, required: true },
    art: { type: String, required: true },
    way: { type: String, required: true },
    techniqueCategoryLevels: {
        basic: { type: Number, required: true },
        fineness: { type: Number, required: true },
        heavy: { type: Number, required: true },
        ultimate: { type: Number, required: true },
    },
});
/**
 * The generated model for the player schema.
 */
exports.Player = (0, mongoose_1.model)('Player', schema);
