"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/*
  The default data for the client.
 */
const defaultData = {
    /**
     * Intents to enable for this connection.
     */
    intents: [discord_js_1.GatewayIntentBits.Guilds],
    /**
     * The default value for MessageReplyOptions#failIfNotExists.
     */
    failIfNotExists: false,
    /**
     * Presence data to use upon login.
     */
    presence: {
        status: 'online',
        activities: [
            {
                name: 'with TypeScript',
                type: discord_js_1.ActivityType.Playing,
            },
        ],
    },
    /**
     * The directory to load the commands from.
     */
    commandsDir: 'Res/Commands',
    /**
     * Whether the client should load commands or not. Load commands means sending commands to the API.
     * Don't activate this permanently, it's only on change.
     */
    loadCommands: true,
    /**
     * Represents the default timeout for any message component interaction.
     */
    defaultComponentTimeout: 120000,
    /**
     * Represents the default timeout for modal component interaction.
     */
    defaultModalTimeout: 300000,
    /**
     * The regular expression for username input.
     */
    usernameRegexp: /^[a-zA-Z0-9éèàçùòñõâêîôû'."]+(?:\s[a-zA-Z0-9]+)*$/gs,
};
exports.default = defaultData;
