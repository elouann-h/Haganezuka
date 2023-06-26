"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/**
 * The main class that manages the active cool downs for commands.
 */
class InterferingManager {
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
     * Register an interfering command when this command is triggered.
     * @param userID The user ID of the command's author.
     * @param commandName The name of the command.
     * @param interactionID The ID of the interaction.
     * @returns Void.
     */
    registerInterfering(userID, commandName, interactionID) {
        if (!userID || typeof userID !== 'string')
            throw new Error('Invalid user ID provided.');
        if (!commandName || typeof commandName !== 'string')
            throw new Error('Invalid command name provided.');
        if (!interactionID || typeof interactionID !== 'string')
            throw new Error('Invalid interaction ID provided.');
        const startTime = Date.now();
        const currentCoolDowns = this.interfering(userID);
        currentCoolDowns.push([commandName, startTime, interactionID]);
        this.queue.set(userID, currentCoolDowns);
    }
    /**
     * Returns all the interfering commands for a specified user.
     * @param userID The user ID to search for.
     * @param commands The names of the commands to filter by.
     * @returns The full list of the user's cool downs.
     */
    interfering(userID, ...commands) {
        if (!userID || typeof userID !== 'string')
            throw new Error('Invalid user ID provided.');
        if (commands.length > 0 && commands.some((command) => typeof command !== 'string')) {
            throw new Error('Invalid commands names provided (list of strings).');
        }
        const currentInterfering = this.queue.get(userID) || [];
        if (commands.length > 0) {
            return currentInterfering.filter((queueElement) => {
                return commands.includes(queueElement[0]);
            });
        }
        return currentInterfering;
    }
    /**
     * Removes an interfering commands. If a name is passed, remove all the commands with that name.
     * If an ID is passed, remove the command with the same interaction ID.
     * @param userID The user ID to search for.
     * @param key The value to search for; either the name of the command or the interaction ID.
     * @returns Void.
     */
    removeInterfering(userID, key) {
        if (!userID || typeof userID !== 'string')
            throw new Error('Invalid user ID provided.');
        if (!key || typeof key !== 'string')
            throw new Error('Invalid key provided.');
        const currentInterfering = this.interfering(userID);
        const interferingNames = currentInterfering.map((queueElement) => {
            return queueElement[0];
        });
        if (interferingNames.includes(key)) {
            this.queue.set(userID, currentInterfering.filter((queueElement) => {
                return queueElement[0] !== key;
            }));
        }
        else {
            this.queue.set(userID, currentInterfering.filter((queueElement) => {
                return queueElement[2] !== key;
            }));
        }
    }
}
exports.default = InterferingManager;
