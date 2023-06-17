"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const v10_1 = require("discord-api-types/v10");
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
        if (this.interaction !== undefined)
            this.interaction = interaction;
        this.users = users;
    }
    /**
     * Transform a string or a BaseMessageOptions into a BaseMessageOptions with the specified color.
     * @param data The data to transform.
     * @returns The transformed data.
     */
    transformData(data) {
        if (typeof data !== 'string')
            return data;
        let color = Util_1.Colors.WHITE;
        if (data.includes('<:color:')) {
            color = Util_1.Colors[data.split('<:color:')[1].split('>')[0]];
        }
        return Object.assign({}, {
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setDescription(data.split('<:color:')[0])
                    .setColor(color)
                    .setAuthor({ name: `@${this.users[0].username}`, iconURL: this.users[0].displayAvatarURL() }),
            ],
        });
    }
    /**
     * Create a choice between accept or cancel.
     * @param messageData The message data to send (Discord.<BaseMessageOptions>).
     * @param timeout The time before the choice expires.
     * @param reply Whether to reply to the interaction or not.
     * @returns The choice of the user, or null if not sent.
     */
    async choice(messageData, timeout, reply = false) {
        const buttons = [
            new discord_js_1.ButtonBuilder().setCustomId('autodefer_accept').setStyle(v10_1.ButtonStyle.Secondary).setEmoji('✅'),
            new discord_js_1.ButtonBuilder().setCustomId('autodefer_decline').setStyle(v10_1.ButtonStyle.Secondary).setEmoji('❌'),
        ];
        const row = new discord_js_1.ActionRowBuilder().addComponents(buttons);
        const finaleMessageData = Object.assign(this.transformData(messageData), {
            components: [row],
        });
        let message;
        if (reply)
            message = await this.reply(finaleMessageData);
        else
            message = await this.send(finaleMessageData);
        if (!message)
            return null;
        const filter = (interaction) => interaction.user.id === this.users[0].id;
        const response = await message.awaitMessageComponent({ filter, time: timeout }).catch(Util_1.log);
        if (!response)
            return null;
        return [response.customId, message];
    }
    /**
     * Send a message in a text based channel (text, thread, announcements...).
     * @param messageData The message data to send (Discord.<BaseMessageOptions>).
     * @returns The message instance, or null if not sent.
     */
    async send(messageData) {
        if (!this.channel.isTextBased())
            return null;
        const message = await this.channel.send(this.transformData(messageData)).catch(Util_1.log);
        if (!message)
            return null;
        return message;
    }
    /**
     * Reply to an interaction.
     * @param messageData The message data to send (Discord.<BaseMessageOptions>).
     * @param interaction The interaction to reply to.
     * @returns The message instance, or null if not sent.
     */
    async reply(messageData, interaction = this.interaction) {
        if (!this.channel.isTextBased())
            return null;
        let message;
        if (interaction.isRepliable()) {
            if (!interaction.deferred) {
                message = await interaction.reply(this.transformData(messageData)).catch(Util_1.log);
            }
            else {
                message = await interaction.followUp(this.transformData(messageData)).catch(Util_1.log);
            }
        }
        if (!message)
            return null;
        return message;
    }
    /**
     * Edit a message in a text based channel (text, thread, announcements...).
     * @param messageData The message data to send (Discord.<BaseMessageOptions>).
     * @param message The message to edit.
     * @returns The message instance, or null if not sent.
     */
    async edit(messageData, message) {
        if (!this.channel.isTextBased())
            return null;
        messageData = this.transformData(messageData);
        if (!('components' in messageData)) {
            messageData.components = [];
        }
        if ('files' in messageData && messageData.files.length > 0) {
            await message.removeAttachments().catch(Util_1.log);
        }
        const editedMessage = await message.edit(messageData).catch(Util_1.log);
        if (!editedMessage)
            return null;
        return editedMessage;
    }
    /**
     * Send an alert in a text based channel. The alert is sent as an embed.
     * @param alertData The data of the alert.
     * @param style The style of the alert.
     * @returns The message instance, or null if not sent.
     */
    async alert(alertData, style = Object.keys(Util_1.Colors)[0]) {
        const embed = new discord_js_1.EmbedBuilder();
        if (alertData.author)
            embed.setAuthor(alertData.author);
        if (alertData.description)
            embed.setDescription(alertData.description.substring(0, 4096));
        if (alertData.image)
            embed.setImage(alertData.image);
        if (alertData.thumbnail)
            embed.setThumbnail(alertData.thumbnail);
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
        embed.setAuthor({ name: `@${this.users[0].username}`, iconURL: this.users[0].displayAvatarURL() });
        if (!this.interaction) {
            return await this.send({ embeds: [embed.toJSON()] }).catch(Util_1.log);
        }
        if (this.interaction.isRepliable() && !this.interaction.replied) {
            return await this.interaction.reply({ embeds: [embed.toJSON()], ephemeral: true }).catch(Util_1.log);
        }
        if (!this.interaction.isChatInputCommand())
            return null;
        const message = await this.channel.send({ embeds: [embed.toJSON()] }).catch(Util_1.log);
        if (!message)
            return null;
        return message;
    }
    /**
     * Edit the specified buttons from a message.
     * @param buttonsId The buttons chosen.
     * @param message The message to edit the buttons from.
     * @returns The message instance, or null if not sent.
     */
    async chosenButton(buttonsId, message) {
        const buttons = message.components[0].components;
        const newButtons = [];
        for (const button of buttons) {
            if (button.type !== v10_1.ComponentType.Button)
                continue;
            const buttonUpdated = new discord_js_1.ButtonBuilder()
                .setCustomId(button.customId)
                .setStyle(button.style)
                .setDisabled(true);
            if (button.label)
                buttonUpdated.setLabel(button.label);
            if (button.emoji)
                buttonUpdated.setEmoji(button.emoji);
            if (buttonsId.includes(button.customId)) {
                if (button.customId.includes('accept'))
                    buttonUpdated.setStyle(v10_1.ButtonStyle.Success);
                if (button.customId.includes('decline')) {
                    buttonUpdated.setStyle(v10_1.ButtonStyle.Danger);
                    buttonUpdated.setEmoji('✖️');
                }
            }
            newButtons.push(buttonUpdated);
        }
        const row = new discord_js_1.ActionRowBuilder().addComponents(newButtons);
        // @ts-ignore
        return await this.edit({ components: [row] }, message);
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
