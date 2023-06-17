"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    discordId: { type: String, required: true },
    username: { type: String, required: true },
    experience: { type: Number, required: true },
    race: { type: String, required: true },
    premium: { type: Boolean, required: true },
    art: { type: String, required: true },
    way: { type: String, required: true },
    skills: {
        strength: { type: Number, required: true },
        durability: { type: Number, required: true },
        endurance: { type: Number, required: true },
        speed: { type: Number, required: true },
        collection: { type: Number, required: true },
        recovery: { type: Number, required: true },
        synergy: { type: Number, required: true },
        mental: { type: Number, required: true },
    },
    techniqueCategoryLevels: {
        basic: { type: Number, required: true },
        fineness: { type: Number, required: true },
        heavy: { type: Number, required: true },
        ultimate: { type: Number, required: true },
    },
});
exports.Player = (0, mongoose_1.model)('Player', schema);
