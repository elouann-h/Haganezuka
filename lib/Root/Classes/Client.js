"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs = require("fs");
const ClientConfig_1 = require("../../Res/ClientConfig");
const CommandManager_1 = require("./CommandManager");
const EventManager_1 = require("./EventManager");
const Event = require("./Event");
const VoiceManager = require("./VoiceManager");
const Util_1 = require("./Util");
const Context_1 = require("./Context");
/**
 * The pre-configured client class for the bot.
 */
class default_1 extends discord_js_1.Client {
    /**
     * The directory to load the commands from.
     */
    commandsDir = ClientConfig_1.default.commandsDir;
    /**
     * The directory to load the events from.
     */
    eventsDir = ClientConfig_1.default.eventsDir;
    /**
     * The command manager instance.
     */
    Commands = new CommandManager_1.default(this);
    /**
     * The event manager instance.
     */
    Events = new EventManager_1.default(this);
    /**
     * The voice manager instance.
     */
    Voice = new VoiceManager.default(this);
    /**
     * Whether the client should load commands or not. Load commands means sending commands to the API.
     * Don't activate this permanently, it's only on change.
     */
    load = false;
    /**
     * The constructor of the client.
     */
    constructor() {
        super({
            intents: ClientConfig_1.default.intents,
            failIfNotExists: ClientConfig_1.default.failIfNotExists,
            presence: ClientConfig_1.default.presence,
        });
    }
    /**
     * The function to load the commands.
     * @returns {Promise<void>}
     */
    async loadCommands() {
        const dir = fs.readdirSync(`./lib/${this.commandsDir}`);
        const commandsList = [];
        for (const file of dir) {
            const command = require(`../../${this.commandsDir}/${file}`).default;
            commandsList.push(command);
            this.Commands.add(command);
        }
        await this.application.commands.set(commandsList);
    }
    /**
     * Launch the client after bounding events and sending commands to the API, if necessary.
     * Returns a simple string.
     * @param token The client token, if not specified before.
     * @returns A string constant "Logged in.".
     */
    async login(token) {
        this.Events.events.each((event) => {
            if (event.name !== 'voiceStateUpdate') {
                const method = event.name === 'ready' ? 'once' : 'on';
                this[method](event.name, (...args) => {
                    event.callback(this, ...args);
                });
            }
        });
        if (this.Voice.events.size > 0) {
            let event = this.Events.events.find((evt) => evt.name === 'voiceStateUpdate');
            if (!event)
                event = new Event.default(this, 'voiceStateUpdate');
            this.on('voiceStateUpdate', async (oldState, newState) => {
                const changes = VoiceManager.default.getChanges(oldState, newState);
                const user = await (0, Util_1.SFToUser)(this, newState.id);
                const context = new Context_1.default(newState.channel || oldState.channel, null, null, user);
                context.client = this;
                for (const voiceEvent of this.Voice.events.keys()) {
                    if (!changes.includes(voiceEvent))
                        continue;
                    this.Voice.events.get(voiceEvent)(changes, newState.member, context);
                }
                event.callback(this, oldState, newState);
            });
        }
        const logged = await super.login(token || this.token);
        if (this.load)
            await this.loadCommands();
        return logged;
    }
}
exports.default = default_1;
