"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEventsCb = exports.callbackDefault = void 0;
const discord_js_1 = require("discord.js");
/**
 * A default callback function used when nothing is set.
 * @param args The command args.
 * @returns Void.
 */
async function callbackDefault(...args) {
    return;
}
exports.callbackDefault = callbackDefault;
/**
 * Represents an Event on client service.
 */
class Event {
    /**
     * The client instance.
     */
    client;
    /**
     * The event name.
     */
    name;
    /**
     * The callback function.
     */
    callback;
    /**
     * @param client The client instance.
     * @param name The event name.
     */
    constructor(client, name) {
        this.client = client;
        this.name = name;
        this.callback = callbackDefault;
    }
    /**
     * Call the callback function of an event.
     * @returns Void.
     */
    async call() {
        await this.callback(...arguments);
    }
}
exports.default = Event;
/**
 * The collection that includes the default callback functions for basic events.
 */
exports.defaultEventsCb = new discord_js_1.Collection();
exports.defaultEventsCb.set('ready', (client) => {
    console.log(`Logged in as ${client.user.tag}.`);
});
exports.defaultEventsCb.set('interactionCreate', async (client, interaction) => {
    console.log('test 0');
    if (interaction.isChatInputCommand()) {
        console.log('test 1');
        const command = client.Commands.getCommand(interaction.commandName);
        console.log(command);
        if (!command)
            return;
        await command.execute(client, interaction);
    }
});
