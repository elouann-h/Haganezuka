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
    transformMessageData(data) {
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
     * Transform a MenuOptions into a full built StringSelectMenuBuilder.
     * @param menuData The data to transform.
     * @returns The transformed data.
     */
    transformMenuData(menuData) {
        const menu = new discord_js_1.StringSelectMenuBuilder().setCustomId('autodefer_menu');
        if ('placeholder' in menuData)
            menu.setPlaceholder(menuData.placeholder);
        if ('maxValues' in menuData)
            menu.setMaxValues(menuData.maxValues);
        if ('minValues' in menuData)
            menu.setMinValues(menuData.minValues);
        for (const option of menuData.options) {
            const optionBuilder = new discord_js_1.StringSelectMenuOptionBuilder();
            optionBuilder.setValue(option[0]);
            optionBuilder.setLabel(option[1]);
            if (option.length > 2)
                optionBuilder.setEmoji(option[2]);
            menu.addOptions(optionBuilder);
        }
        return menu;
    }
    /**
     * Generate two buttons for a choice between accept or cancel.
     * @param buttonsToSet The buttons to set.
     * @returns The generated buttons.
     */
    generateValidOrCancelButtons(buttonsToSet = ['accept', 'decline']) {
        const buttons = [];
        if (buttonsToSet.includes('accept'))
            buttons.push(new discord_js_1.ButtonBuilder().setCustomId('autodefer_accept').setStyle(v10_1.ButtonStyle.Secondary).setEmoji('✅'));
        if (buttonsToSet.includes('decline'))
            buttons.push(new discord_js_1.ButtonBuilder().setCustomId('autodefer_decline').setStyle(v10_1.ButtonStyle.Secondary).setEmoji('❌'));
        if (buttonsToSet.includes('leave'))
            buttons.push(new discord_js_1.ButtonBuilder().setCustomId('autodefer_leave').setStyle(v10_1.ButtonStyle.Secondary).setEmoji('🚪'));
        return buttons;
    }
    /**
     * Create a choice between accept or cancel.
     * @param messageData The message data to send (Discord.<BaseMessageOptions>).
     * @param buttonsToSet The buttons to set.
     * @param timeout The time before the choice expires.
     * @param reply Whether to reply to the interaction or not.
     * @param messageToEdit The message to reply to if there is one.
     * @returns The choice of the user, or null if not sent.
     */
    async validOrCancelDialog(messageData, buttonsToSet = ['accept', 'decline'], timeout, reply = false, messageToEdit) {
        const buttons = this.generateValidOrCancelButtons(buttonsToSet);
        const row = new discord_js_1.ActionRowBuilder().addComponents(buttons);
        let [response, message] = await this.messageComponentInteraction(messageData, [row], timeout, reply, messageToEdit);
        if (!response)
            return [null, message || null];
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
        const menu = this.transformMenuData(menuData);
        const row = new discord_js_1.ActionRowBuilder().addComponents(menu);
        let [response, message] = await this.messageComponentInteraction(messageData, [row], timeout, reply, messageToEdit);
        if (!response)
            return [null, message || null];
        // @ts-ignore
        return [response.values, message];
    }
    /**
     * Create a super panel with a select menu to switch pages, and a valid or cancel button.
     * Returns the last page selected, the button clicked and the message.
     * @param messageData The message data to send (Discord.<BaseMessageOptions>).
     * @param menuData The choices to select from and other data like min and max.
     * @param pageData The pages to switch between.
     * @param buttonsToSet The buttons to set.
     * @param timeout The time before the choice expires.
     * @param reply Whether to reply to the interaction or not.
     * @param messageToEdit The message to reply to if there is one.
     */
    async panelDialog(messageData, menuData, pageData, buttonsToSet = ['accept', 'decline'], timeout, reply = false, messageToEdit) {
        const menu = this.transformMenuData(menuData);
        const buttons = this.generateValidOrCancelButtons(buttonsToSet);
        const menuRow = new discord_js_1.ActionRowBuilder().addComponents(menu);
        const buttonsRow = new discord_js_1.ActionRowBuilder().addComponents(buttons);
        let pageFocusedOn = menuData.options[0][0];
        let continueLoop = true;
        let [response, message] = [null, null];
        let accept = 'decline';
        while (continueLoop) {
            const pageContent = pageData.find((page) => page[0] === pageFocusedOn)[1];
            const messageEmbedData = this.transformMessageData(pageContent);
            const answer = (await this.messageComponentInteraction(Object.assign(messageData, messageEmbedData), [menuRow, buttonsRow], timeout, reply, messageToEdit)) || [null, null];
            if (!answer)
                continueLoop = false;
            else
                [response, message] = answer;
            if (!messageToEdit)
                messageToEdit = message;
            if (!response)
                break;
            if (response.isAnySelectMenu())
                pageFocusedOn = response.values[0];
            else if (response.customId) {
                continueLoop = false;
                switch (response.customId) {
                    case 'autodefer_accept':
                        message = await this.edit(Object.assign(messageData, { components: [buttonsRow] }), message);
                        message = await this.chosenButton(['autodefer_accept'], message);
                        accept = 'accept';
                        break;
                    case 'autodefer_decline':
                        message = await this.edit(Object.assign(messageData, { components: [buttonsRow] }), message);
                        message = await this.chosenButton(['autodefer_decline'], message);
                        accept = 'decline';
                        break;
                    case 'autodefer_leave':
                        accept = 'leave';
                        break;
                    default:
                        accept = 'leave';
                        break;
                }
            }
        }
        if (!response)
            return [null, null, message || null];
        return [accept, pageFocusedOn, message];
    }
    /**
     * Send/reply to a message and wait for a response.
     *
     */
    async messageComponentInteraction(messageData, rows, timeout, reply = false, messageToEdit) {
        const finaleMessageData = Object.assign(this.transformMessageData(messageData), {
            components: rows,
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
            return [null, message || null];
        const filter = (interaction) => interaction.user.id === this.users[0].id;
        const response = await message.awaitMessageComponent({ filter, time: timeout }).catch(Util_1.log);
        if (!response)
            return [null, message || null];
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
        const message = await this.channel.send(this.transformMessageData(messageData)).catch(Util_1.log);
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
                message = await interaction.reply(this.transformMessageData(messageData)).catch(Util_1.log);
            }
            else {
                message = await interaction.followUp(this.transformMessageData(messageData)).catch(Util_1.log);
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
        messageData = this.transformMessageData(messageData);
        if (!('components' in messageData)) {
            messageData.components = [];
        }
        if ('files' in messageData && messageData.files.length > 0) {
            await message.removeAttachments().catch(Util_1.log);
        }
        if (!message)
            return null;
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
        const fullRows = [];
        const componentRows = message.components;
        for (const row of componentRows) {
            const components = row.components;
            if (components.length === 0)
                continue;
            if (components[0].type !== v10_1.ComponentType.Button) {
                // @ts-ignore
                const rowUpdated = new discord_js_1.ActionRowBuilder().setComponents(components);
                fullRows.push(rowUpdated);
                continue;
            }
            const newButtons = [];
            for (const button of components) {
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
                    if (button.customId.includes('leave'))
                        buttonUpdated.setStyle(v10_1.ButtonStyle.Primary);
                }
                newButtons.push(buttonUpdated);
            }
            fullRows.push(new discord_js_1.ActionRowBuilder().addComponents(newButtons));
        }
        // @ts-ignore
        return await this.edit({ components: fullRows }, message);
    }
}
exports.default = Context;
