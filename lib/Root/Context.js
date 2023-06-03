"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Util_1 = require("./Util");
/**
 * Represents a context. Includes a channel, an interaction, users.
 */
class Context {
    /**
     * The channel where the action occurs.
     */
    channel;
    /**
     * The command associated with the context.
     */
    command;
    /**
     * The interaction, if there is one.
     */
    interaction;
    /**
     * The users implicated in the context/action.
     */
    users;
    /**
     * The client instance.
     */
    client;
    /**
     * @param channel The channel where the action occurs.
     * @param command The command associated with the context.
     * @param interaction The interaction, if there is one.
     * @param users The users implicated in the context/action.
     */
    constructor(channel, command, interaction, ...users) {
        this.channel = channel;
        if (this.command) {
            this.command = command;
        }
        if (this.interaction)
            this.interaction = interaction;
        this.users = users;
    }
    /**
     * Send a message in a text based channel (text, thread, announcements...).
     * @param messagePayload The message data to send (Discord.<MessagePayload>).
     * @returns The message instance, or null if not sent.
     */
    async send(messagePayload) {
        if (!this.channel.isTextBased())
            return null;
        const message = await this.channel.send(messagePayload).catch((reason) => {
            (0, Util_1.log)(`Message could not be sent: ${reason}`);
        });
        if (!message)
            return null;
        return message;
    }
    /**
     * Send an alert in a text based channel. The alert is sent as an embed.
     * @param alertData The data of the alert.
     * @param style The style of the alert.
     * @returns The message instance, or null if not sent.
     */
    async alert(alertData, style = Object.keys(Util_1.Colors)[0]) {
        const embed = new discord_js_1.EmbedBuilder();
        if (alertData.author) {
            embed.setAuthor(alertData.author);
        }
        if (alertData.description) {
            embed.setDescription(alertData.description.substring(0, 4096));
        }
        if (alertData.image) {
            embed.setImage(alertData.image);
        }
        if (alertData.thumbnail) {
            embed.setThumbnail(alertData.thumbnail);
        }
        if (alertData.timestamp) {
            if (typeof alertData.timestamp === 'boolean') {
                if (alertData.timestamp)
                    embed.setTimestamp(Date.now());
            }
            else if (typeof alertData.timestamp === 'number') {
                embed.setTimestamp(alertData.timestamp);
            }
        }
        embed.setColor(Util_1.Colors[style]);
        embed.setTitle(alertData.title);
        embed.setDescription(alertData.description);
        if (!this.interaction) {
            return await this.send({ embeds: [embed.toJSON()] }).catch((reason) => {
                (0, Util_1.log)(`Message could not be sent: ${reason}`);
            });
        }
        if (this.interaction.isRepliable()) {
            // @ts-ignore
            return await this.interaction.reply({ embeds: [embed.toJSON()], ephemeral: true }).catch((reason) => {
                (0, Util_1.log)(`Interaction could not be replied to: ${reason}`);
            });
        }
        else {
            if (!this.interaction.isChatInputCommand())
                return null;
            await this.interaction.deferReply({ ephemeral: true }).catch((reason) => {
                (0, Util_1.log)(`Interaction could not be deferred: ${reason}`);
            });
            const followedUp = await this.interaction
                .followUp({ embeds: [embed.toJSON()], ephemeral: true })
                .catch((reason) => {
                (0, Util_1.log)(`Interaction could not be followed up: ${reason}`);
            });
            if (!followedUp)
                return null;
            return followedUp;
        }
    }
    /**
     * Set the context channel.
     * @param guildId The guild ID of the channel.
     * @param channel The channel to set.
     * @returns The context instance.
     */
    async setCtxChannel(guildId, channel) {
        const client = this?.command?.client || this.client || undefined;
        if (!client)
            throw new Error('No valid client provided.');
        if (typeof channel === 'string')
            channel = await (0, Util_1.SFToCtxChannel)(client, guildId, channel);
        this.channel = channel;
        return this;
    }
}
exports.default = Context;
