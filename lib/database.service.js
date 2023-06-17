"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Connects to the database.
 * @returns Void.
 */
async function default_1() {
    await (0, mongoose_1.connect)(process.env.DB_CONN_STRING, { dbName: 'game' });
}
exports.default = default_1;
