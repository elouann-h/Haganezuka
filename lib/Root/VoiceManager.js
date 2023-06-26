"use strict";
// noinspection JSUnusedGlobalSymbols
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceEvents = void 0;
const discord_js_1 = require("discord.js");
const Client_1 = require("./Client");
const Util_1 = require("./Util");
/**
 * The list of the different voice events.
 */
exports.VoiceEvents = [
    'join',
    'leave',
    'switch',
    'serverMute',
    'serverUnmute',
    'serverDeaf',
    'serverUndeaf',
    'selfMute',
    'selfUnmute',
    'selfDeaf',
    'selfUndeaf',
    'enableVideo',
    'disableVideo',
    'startStreaming',
    'stopStreaming',
    'stageSuppressedOn',
    'stageSuppressedOff',
    'askSpeakRequest',
    'cancelSpeakRequest',
];
/**
 * Represents the class that contains different statistics about voice channels.
 */
class VoiceManager {
    /**
     * The Discord Client instance.
     */
    client;
    /**
     * The guild to look on.
     */
    _contextGuild;
    /**
     * The voice channel to look on.
     */
    _contextChannel;
    /**
     * The different voice events configured by the user with their callbacks.
     */
    _voiceEvents;
    /**
     * @param client The Discord Client instance.
     */
    constructor(client) {
        if (!client)
            throw new Error('Invalid client was provided.');
        if (client instanceof Client_1.default)
            this.client = client;
        else if (client instanceof discord_js_1.Client)
            this.client = client;
        else
            throw new Error('Invalid client was provided.');
        this._contextGuild = '';
        this._contextChannel = '';
        this._voiceEvents = new discord_js_1.Collection();
    }
    /**
     * The guild to look on.
     * @returns The guild instance.
     */
    get guild() {
        if (!this.client.isReady())
            throw new Error('The client is not ready yet.');
        return this.client.guilds.resolve(this._contextGuild);
    }
    /**
     * The voice channel to look on.
     * @returns The voice channel instance.
     */
    get channel() {
        if (!this.client.isReady())
            throw new Error('The client is not ready yet.');
        if (!this._contextGuild) {
            if (!this.client.guilds.cache.size)
                throw new Error('The client is not in any guild, or the guild is not cached.');
            this._contextGuild = this.client.guilds.cache.first().id;
        }
        let resolved = this.guild.channels.resolve(this._contextChannel);
        if (!resolved)
            resolved = this.guild.channels.cache.find((c) => c.name.toLowerCase() === this._contextChannel.toLowerCase());
        return resolved;
    }
    /**
     * Set the guild to look on.
     */
    set setGuild(guild) {
        if (typeof guild !== 'string')
            throw new Error('Invalid guild was provided.');
        this._contextGuild = guild;
    }
    /**
     * Set the voice channel to look on.
     */
    set setChannel(channel) {
        if (typeof channel !== 'string')
            throw new Error('Invalid channel was provided.');
        this._contextChannel = channel;
    }
    /**
     * Returns the full list of members connected in the voice channel.
     * @param channel The voice channel to look on.
     * @param guild The guild to look on. It's recommended to set it before calling this method for performance issues.
     * @returns The list of members.
     */
    members(channel, guild) {
        if (!this.client.isReady())
            throw new Error('The client is not ready yet.');
        if (guild) {
            if (typeof guild !== 'string')
                throw new Error('Invalid guild was provided.');
            this.setGuild = guild;
        }
        if (channel) {
            if (typeof channel !== 'string')
                throw new Error('Invalid channel was provided.');
            this.setChannel = channel;
        }
        if (!this._contextChannel)
            throw new Error('The channel is not set.');
        const channelInstance = this.channel;
        if (!channelInstance)
            throw new Error('The channel was not found.');
        const members = [];
        for (const member of channelInstance.members.values()) {
            members.push(member);
        }
        return members;
    }
    /**
     * Moves a member to another voice channel.
     * @param member The member to move.
     * @param channel The channel to move the member to.
     * @returns The promised member.
     */
    async move(member, channel) {
        const [memberInstance, channelInstance] = await this.contextualize(member, channel);
        return await memberInstance.voice.setChannel(channelInstance);
    }
    /**
     * Disconnects a member from the voice channel.
     * @param member The member to disconnect.
     * @param channel The channel to disconnect the member to.
     * @returns The promised member.
     */
    async disconnect(member, channel) {
        const memberInstance = (await this.contextualize(member, channel || this._contextChannel))[0];
        return await memberInstance.voice.setChannel(null);
    }
    /**
     * Contextualizes the voice channel.
     * @param member The voice channel to contextualize.
     * @param channel The contextualized voice channel.
     * @returns The contextualized voice channel.
     */
    async contextualize(member, channel) {
        if (!this.client.isReady())
            throw new Error('The client is not ready yet.');
        if (!member)
            throw new Error('Invalid member was provided.');
        if (!channel)
            throw new Error('Invalid channel was provided.');
        if (typeof channel !== 'string')
            throw new Error('Invalid channel was provided.');
        this.setChannel = channel;
        const channelInstance = this.channel;
        if (typeof member === 'string')
            member = await (0, Util_1.SFToMember)(this.client, this._contextGuild, member);
        if (!(member instanceof discord_js_1.GuildMember))
            throw new Error('Invalid member was provided.');
        if (!channelInstance)
            throw new Error('The channel was not found.');
        return [member, channelInstance];
    }
    /**
     * Registers a voice event.
     * @param event The voice event to register.
     * @param callback The callback to call when the event is triggered.
     * @returns Void.
     */
    register(event, callback) {
        if (!event || typeof event !== 'string' || !exports.VoiceEvents.includes(event))
            throw new Error('Invalid event was provided.');
        if (!callback || typeof callback !== 'function')
            throw new Error('Invalid callback was provided.');
        this._voiceEvents.set(event, callback);
    }
    /**
     * Unregisters a voice event.
     * @param event The voice event to unregister.
     * @returns Void.
     */
    unregister(event) {
        if (!event || typeof event !== 'string' || !exports.VoiceEvents.includes(event))
            throw new Error('Invalid event was provided.');
        this._voiceEvents.delete(event);
    }
    /**
     * Get the list of registered voice events.
     * @returns The list of registered voice events.
     */
    get events() {
        return this._voiceEvents;
    }
    /**
     * Returns the list of changes in the voice state.
     * @param oldState The old voice state.
     * @param newState The new voice state.
     * @returns The list of changes.
     */
    static getChanges(oldState, newState) {
        const events = [];
        if (!oldState.channelId && newState.channelId)
            events.push('join');
        if (oldState.channelId && !newState.channelId)
            events.push('leave');
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId)
            events.push('switch');
        if (oldState.serverDeaf !== newState.serverDeaf)
            events.push(newState.serverDeaf ? 'serverDeaf' : 'serverUndeaf');
        if (oldState.serverMute !== newState.serverMute)
            events.push(newState.serverMute ? 'serverMute' : 'serverUnmute');
        if (oldState.selfDeaf !== newState.selfDeaf)
            events.push(newState.selfDeaf ? 'selfDeaf' : 'selfUndeaf');
        if (oldState.selfMute !== newState.selfMute)
            events.push(newState.selfMute ? 'selfMute' : 'selfUnmute');
        if (oldState.selfVideo !== newState.selfVideo)
            events.push(newState.selfVideo ? 'enableVideo' : 'disableVideo');
        if (oldState.streaming !== newState.streaming)
            events.push(newState.streaming ? 'startStreaming' : 'stopStreaming');
        if (oldState.suppress !== newState.suppress)
            events.push(newState.suppress ? 'stageSuppressedOn' : 'stageSuppressedOff');
        if (oldState.requestToSpeakTimestamp !== newState.requestToSpeakTimestamp)
            events.push(newState.requestToSpeakTimestamp ? 'askSpeakRequest' : 'cancelSpeakRequest');
        return events;
    }
}
exports.default = VoiceManager;
