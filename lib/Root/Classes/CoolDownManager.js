"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/**
 * The main class that manages the active cool downs for commands.
 */
class CoolDownManager {
    /**
     * The client instance.
     */
    client;
    /**
     * The collection of the current cool downs.
     */
    queue = new discord_js_1.Collection();
    /**
     * @param client The client instance.
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * Register a cool down when a command is triggered.
     * @param userID The user ID of the command's author.
     * @param commandName The name of the command.
     * @param coolDown The cool down amount (waiting time before executing it again).
     * @returns Void.
     */
    registerCoolDown(userID, commandName, coolDown) {
        const endTime = Date.now() + coolDown * 1000;
        const currentCoolDowns = this.coolDowns(userID);
        currentCoolDowns.push([commandName, endTime, coolDown]);
        this.queue.set(userID, currentCoolDowns);
    }
    /**
     * Returns all the cool downs for a specified user.
     * @param userID The user ID to search for.
     * @param commandName The name of the command to filter by.
     * @returns The full list of the user's cool downs.
     */
    coolDowns(userID, commandName) {
        let currentCoolDowns = this.queue.get(userID) || [];
        const currentTime = Date.now();
        currentCoolDowns = currentCoolDowns.filter((queueElement) => {
            return currentTime < queueElement[1];
        });
        this.queue.set(userID, currentCoolDowns);
        if (commandName) {
            return currentCoolDowns.filter((queueElement) => {
                return queueElement[0] === commandName;
            });
        }
        return currentCoolDowns;
    }
}
exports.default = CoolDownManager;
