"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    discordId: { type: String, required: true },
    username: { type: String, required: true },
});
exports.Player = (0, mongoose_1.model)('Player', schema);
