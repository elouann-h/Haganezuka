"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command = require("./Command");
const CoolDownManager_1 = require("./CoolDownManager");
const InterferingManager_1 = require("./InterferingManager");
/**
 * Represents the command manager of the client.
 */
class CommandManager {
    /**
     * The client instance.
     */
    client;
    /**
     * The cool down manager instance, to have access to the different delays of the current commands.
     */
    CoolDowns;
    /**
     * The interfering manager instance, to have access to the different executing commands.
     */
    Interfering;
    /**
     * The collection of the commands.
     */
    commandsList = new discord_js_1.Collection();
    /**
     * @param client The client instance.
     */
    constructor(client) {
        this.client = client;
        this.CoolDowns = new CoolDownManager_1.default(this.client);
        this.Interfering = new InterferingManager_1.default(this.client);
    }
    /**
     * Create a command based on the name and/or some options, and returns it.
     * @param data The name and/or the options.
     * @returns The command instance.
     */
    create(data) {
        if (typeof data === 'string') {
            data = {
                name: data,
                description: 'No description provided.',
                execute: async () => { },
            };
        }
        if (!data.type)
            data.type = 1;
        const desc = data?.description;
        if (!desc) {
            data.description = 'No description provided.';
        }
        return new Command.default(this.client, data);
    }
    /**
     * Add a command to the client (the bot) using the name, options or the command itself.
     * If no command is passed, the function creates one based on the data passed.
     * @param commandData The options passed (name, command options, command instance).
     * @returns The command manager instance (this).
     */
    add(commandData) {
        if (commandData instanceof Command.default) {
            this.commandsList.set(commandData.data.name, commandData);
            return this;
        }
        const command = this.create(commandData);
        this.commandsList.set(command.data.name, command);
        return this;
    }
    /**
     * Get a command from the cache with the name.
     * @param name The command name.
     * @returns The found command instance, or undefined.
     */
    getCommand(name) {
        return this.commandsList.get(name);
    }
}
exports.default = CommandManager;
