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
     * @param messageToEdit The message to reply to if there is one.
     * @returns The choice of the user, or null if not sent.
     */
    async validOrCancelDialog(messageData, timeout, reply = false, messageToEdit) {
        const buttons = [
            new discord_js_1.ButtonBuilder().setCustomId('autodefer_accept').setStyle(v10_1.ButtonStyle.Secondary).setEmoji('✅'),
            new discord_js_1.ButtonBuilder().setCustomId('autodefer_decline').setStyle(v10_1.ButtonStyle.Secondary).setEmoji('❌'),
        ];
        const row = new discord_js_1.ActionRowBuilder().addComponents(buttons);
        let [response, message] = await this.messageComponentInteraction(messageData, row, timeout, reply, messageToEdit);
        if (!response)
            return null;
        // @ts-ignore
        return [response.customId, message];
    }
    /**
     * Create a selection between multiple choices.
     * @param messageData The message data to send (Discord.<BaseMessageOptions>).
     * @param menuData The choices to select from and other data like min and max.
     * @param timeout The time before the choice expires.
     * @param reply Whether to reply to the interaction or not.
     * @param messageToEdit The message to reply to if there is one.
     */
    async menuDialog(messageData, menuData, timeout, reply = false, messageToEdit) {
        const menu = new discord_js_1.SelectMenuBuilder().setCustomId('autodefer_menu');
        if ('placeholder' in menuData)
            menu.setPlaceholder(menuData.placeholder);
        if ('maxValues' in menuData)
            menu.setMaxValues(menuData.maxValues);
        if ('minValues' in menuData)
            menu.setMinValues(menuData.minValues);
        for (const option of menuData.options) {
            const optionBuilder = new discord_js_1.SelectMenuOptionBuilder();
            optionBuilder.setValue(option[0]);
            optionBuilder.setLabel(option[1]);
            if (option.length > 2)
                optionBuilder.setEmoji(option[2]);
            menu.addOptions(optionBuilder);
        }
        const row = new discord_js_1.ActionRowBuilder().addComponents(menu);
        let [response, message] = await this.messageComponentInteraction(messageData, row, timeout, reply, messageToEdit);
        if (!response)
            return null;
        // @ts-ignore
        return [response.values, message];
    }
    /**
     * Send/reply to a message and wait for a response.
     *
     */
    async messageComponentInteraction(messageData, row, timeout, reply = false, messageToEdit) {
        const finaleMessageData = Object.assign(this.transformData(messageData), {
            components: [row],
        });
        let message;
        if (reply)
            message = await this.reply(finaleMessageData);
        else if (!messageToEdit)
            message = await this.send(finaleMessageData);
        else {
            if (messageToEdit instanceof discord_js_1.Message)
                message = await this.edit(finaleMessageData, messageToEdit);
            else if (messageToEdit instanceof discord_js_1.InteractionResponse)
                message = await this.edit(finaleMessageData, await messageToEdit.fetch());
        }
        if (!message)
            return null;
        const filter = (interaction) => interaction.user.id === this.users[0].id;
        const response = await message.awaitMessageComponent({ filter, time: timeout }).catch(Util_1.log);
        if (!response)
            return null;
        return [response, message];
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
     * Edit the specified buttons from a message and applies a cool animation.
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
}
exports.default = Context;
