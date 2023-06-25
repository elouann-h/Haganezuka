import {
  ActionRow,
  ActionRowBuilder,
  BaseGuildTextChannel,
  BaseGuildVoiceChannel,
  BaseInteraction,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
  MessageActionRowComponent,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextBasedChannel,
  TextInputBuilder,
  User,
  VoiceBasedChannel,
} from 'discord.js';

import { ButtonStyle, ComponentType, TextInputStyle } from 'discord-api-types/v10';

import { Colors, err, extractString, log, readEmbeds } from './Util';
import Command from './Command';
import Client from './Client';
import ClientConfig from '../Res/ClientConfig';

/**
 * Represents the type for a context possible channel type among Discord package.
 */
export type ContextChannel = TextBasedChannel | VoiceBasedChannel | BaseGuildTextChannel | BaseGuildVoiceChannel;

/**
 * Represents the interface for options/data of a menu.
 */
export interface MenuOptions {
  /**
   * The options list.
   */
  options: ([string, string] | [string, string, string])[];
  /**
   * The placeholder.
   */
  placeholder?: string;
  /**
   * The max values.
   */
  maxValues?: number;
  /**
   * The min values.
   */
  minValues?: number;
}

/**
 * Represents the interface for options/data of a modal.
 */
export interface ModalOptions {
  /**
   * The title.
   */
  title: string;
  /**
   * The list of components/text fields.
   */
  fields: {
    /**
     * The label of the field.
     */
    label: string;
    /**
     * The min length of the field.
     */
    minLength?: number;
    /**
     * The max length of the field.
     */
    maxLength?: number;
    /**
     * The placeholder of the field.
     */
    placeholder?: string;
    /**
     * The style of the field.
     */
    style: TextInputStyle;
    /**
     * The id of the field.
     */
    id: string;
    /**
     * If the field is required or not.
     */
    required?: boolean;
    /**
     * The default value for the field.
     */
    value?: string;
  }[];
}

/**
 * Represents a context. Includes a channel, an interaction, users.
 */
export default class Context {
  /**
   * The channel where the action occurs.
   */
  public channel: ContextChannel;
  /**
   * The command associated with the context.
   */
  public command: Command | undefined;
  /**
   * The interaction, if there is one.
   */
  public interaction: BaseInteraction | undefined;
  /**
   * The users implicated in the context/action.
   */
  public readonly users: User[] | [];
  /**
   * The client instance.
   */
  public client: Client | undefined;

  /**
   * @param channel The channel where the action occurs.
   * @param command The command associated with the context.
   * @param interaction The interaction, if there is one.
   * @param users The users implicated in the context/action.
   */
  constructor(channel: ContextChannel, command?: Command, interaction?: BaseInteraction, ...users: User[] | []) {
    this.channel = channel;
    if (this.command) {
      this.command = command;
    }
    if (this.interaction !== undefined) this.interaction = interaction;
    this.users = users;
  }

  /**
   * Transform a string or a BaseMessageOptions into a BaseMessageOptions with the specified color.
   * @param data The data to transform.
   * @returns The transformed data.
   */
  public transformMessageData(data: BaseMessageOptions | string): BaseMessageOptions {
    if (typeof data !== 'string') return data;
    let color: (typeof Colors)[keyof typeof Colors] = Colors.WHITE;
    if (data.includes('<:color:')) {
      color = Colors[data.split('<:color:')[1].split('>')[0]];
    }
    return Object.assign(
      {},
      {
        embeds: [
          new EmbedBuilder()
            .setDescription(data.split('<:color:')[0])
            .setColor(color)
            .setAuthor({ name: `@${this.users[0].username}`, iconURL: this.users[0].displayAvatarURL() }),
        ],
      },
    );
  }

  /**
   * Transform a MenuOptions into a full built StringSelectMenuBuilder.
   * @param menuData The data to transform.
   * @returns The transformed data.
   */
  public transformMenuData(menuData: MenuOptions): StringSelectMenuBuilder {
    const menu: StringSelectMenuBuilder = new StringSelectMenuBuilder().setCustomId('autodefer_menu');

    if ('placeholder' in menuData) menu.setPlaceholder(menuData.placeholder);
    if ('maxValues' in menuData) menu.setMaxValues(menuData.maxValues);
    if ('minValues' in menuData) menu.setMinValues(menuData.minValues);

    for (const option of menuData.options) {
      const optionBuilder: StringSelectMenuOptionBuilder = new StringSelectMenuOptionBuilder();
      optionBuilder.setValue(option[0]);
      optionBuilder.setLabel(option[1]);
      if (option.length > 2) optionBuilder.setEmoji(option[2]);
      menu.addOptions(optionBuilder);
    }

    return menu;
  }

  /**
   * Transform a ModalOptions into a full built ActionRowBuilder.
   * @param modalData The data to transform.
   * @returns The transformed data.
   */
  public transformModalData(modalData: ModalOptions) {
    const modal: ModalBuilder = new ModalBuilder().setCustomId('modal').setTitle(modalData.title);

    for (const field of modalData.fields) {
      const textInput: TextInputBuilder = new TextInputBuilder();
      textInput.setCustomId(field.id);
      textInput.setLabel(field.label);
      textInput.setStyle(field.style);

      if ('minLength' in field) textInput.setMinLength(field.minLength);
      if ('maxLength' in field) textInput.setMaxLength(field.maxLength);
      if ('placeholder' in field) textInput.setPlaceholder(field.placeholder);
      if ('required' in field) textInput.setRequired(field.required);
      if ('value' in field) textInput.setValue(field.value);

      const inputRow: ActionRowBuilder<ModalActionRowComponentBuilder> =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().setComponents(textInput);

      modal.addComponents(inputRow);
    }

    return modal;
  }

  /**
   * Generate two buttons for a choice between accept or cancel.
   * @param buttonsToSet The buttons to set.
   * @returns The generated buttons.
   */
  public generateValidOrCancelButtons(
    buttonsToSet: ('accept' | 'decline' | 'leave')[] = ['accept', 'decline'],
  ): ButtonBuilder[] {
    const buttons: ButtonBuilder[] = [];
    if (buttonsToSet.includes('accept'))
      buttons.push(new ButtonBuilder().setCustomId('autodefer_accept').setStyle(ButtonStyle.Secondary).setEmoji('✅'));
    if (buttonsToSet.includes('decline'))
      buttons.push(new ButtonBuilder().setCustomId('autodefer_decline').setStyle(ButtonStyle.Secondary).setEmoji('❌'));
    if (buttonsToSet.includes('leave'))
      buttons.push(new ButtonBuilder().setCustomId('autodefer_leave').setStyle(ButtonStyle.Secondary).setEmoji('🚪'));
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
  public async validOrCancelDialog(
    messageData: BaseMessageOptions | string,
    buttonsToSet: ('accept' | 'decline' | 'leave')[] = ['accept', 'decline'],
    timeout: number,
    reply: boolean = false,
    messageToEdit?: Message | InteractionResponse | null,
  ): Promise<[string, Message | InteractionResponse] | [null, any]> {
    const buttons: ButtonBuilder[] = this.generateValidOrCancelButtons(buttonsToSet);
    const row: ActionRowBuilder = new ActionRowBuilder().addComponents(buttons);

    let [response, message] = await this.messageComponentInteraction(messageData, [row], timeout, reply, messageToEdit);
    if (!response) return [null, message || null];

    // @ts-ignore
    return [(response as ButtonInteraction).customId, message];
  }

  /**
   * Create a modal dialog based on an interaction.
   * @param contentToShow The content where will appear the current value.
   * @param modalData The data to show in the modal.
   * @param timeout The time before the choice expires.
   * @param customId The custom id if defined for the modal to show.
   * @param reply Whether to reply to the interaction or not.
   * @param messageToEdit The message to reply to if there is one.
   */
  public async modalDialog(
    contentToShow: [string, RegExp],
    modalData: ModalOptions,
    timeout: number,
    customId: string = 'modal',
    reply: boolean = false,
    messageToEdit?: Message | InteractionResponse | null,
  ): Promise<[string, string, Message | InteractionResponse]> {
    const buttons: ButtonBuilder[] = [
      new ButtonBuilder().setCustomId('modal').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
    ].concat(this.generateValidOrCancelButtons(['accept', 'leave']));

    const row: ActionRowBuilder = new ActionRowBuilder().addComponents(buttons);
    const modal: ModalBuilder = this.transformModalData(modalData);
    modal.setCustomId(customId);

    let message: Message | InteractionResponse | null;

    let loop: boolean = true;
    let response = null;
    let accept: string = 'leave';
    let value: string = 'Rien';

    while (loop) {
      message = message ? (await message.fetch().catch(err)) || message : message || null;
      value = message ? extractString(contentToShow[1], readEmbeds(message as Message)) : 'Rien';

      const messageEmbedData: BaseMessageOptions = this.transformMessageData(
        message
          ? contentToShow[0].replace(
              '{value}',
              extractString(
                contentToShow[1],
                (message instanceof InteractionResponse ? await message.fetch() : message).embeds[0].description,
              ),
            )
          : contentToShow[0].replace('{value}', value),
      );

      const answer: any[] = (await this.messageComponentInteraction(
        messageEmbedData,
        [row],
        timeout,
        reply,
        messageToEdit,
      )) || [null, null];

      if (!answer) loop = false;
      else [response, message] = answer;
      if (!messageToEdit) messageToEdit = message;

      if (!response || !response.customId) {
        loop = false;
        break;
      }
      if (response.customId.includes('leave')) loop = false;
      if (response.customId.includes('accept')) {
        message = await this.chosenButton(['autodefer_accept'], message as Message);
        accept = 'accept';
        loop = false;
        message = message ? (await message.fetch().catch(err)) || message : message || null;
        value = message ? extractString(contentToShow[1], readEmbeds(message as Message)) : 'Rien';
      }
      if (response.customId.includes('modal')) await (response as ButtonInteraction).showModal(modal).catch(err);
    }

    if (!response) return [null, null, message || null];

    return [accept, value, message];
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
  public async panelDialog(
    messageData: BaseMessageOptions | string,
    menuData: MenuOptions,
    pageData: [string, string][],
    buttonsToSet: ('accept' | 'decline' | 'leave')[] = ['accept', 'decline'],
    timeout: number,
    reply: boolean = false,
    messageToEdit?: Message | InteractionResponse | null,
  ): Promise<[string, string, Message | InteractionResponse] | [null, null, any]> {
    const menu: StringSelectMenuBuilder = this.transformMenuData(menuData);
    const buttons: ButtonBuilder[] = this.generateValidOrCancelButtons(buttonsToSet);

    const menuRow: ActionRowBuilder = new ActionRowBuilder().addComponents(menu);
    const buttonsRow: ActionRowBuilder = new ActionRowBuilder().addComponents(buttons);

    let pageFocusedOn: string = menuData.options[0][0];
    let loop: boolean = true;
    let [response, message] = [null, null];

    let accept: string = 'decline';

    while (loop) {
      const pageContent: string = pageData.find((page: [string, string]): boolean => page[0] === pageFocusedOn)![1];
      const messageEmbedData: BaseMessageOptions = this.transformMessageData(pageContent);

      const answer: any[] = (await this.messageComponentInteraction(
        Object.assign(messageData, messageEmbedData),
        [menuRow, buttonsRow],
        timeout,
        reply,
        messageToEdit,
      )) || [null, null];

      if (!answer) loop = false;
      else [response, message] = answer;
      if (!messageToEdit) messageToEdit = message;

      if (!response) loop = false;
      if (response.isAnySelectMenu()) pageFocusedOn = response.values[0];
      else if (response.customId) {
        loop = false;

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

    if (!response) return [null, null, message || null];

    return [accept, pageFocusedOn, message];
  }

  /**
   * Send/reply to a message and wait for a response.
   *
   */
  public async messageComponentInteraction(
    messageData: BaseMessageOptions | string,
    rows: ActionRowBuilder[],
    timeout: number,
    reply: boolean = false,
    messageToEdit?: Message | InteractionResponse | null,
  ) {
    const finaleMessageData: BaseMessageOptions = Object.assign(this.transformMessageData(messageData), {
      components: rows,
    });
    let message: InteractionResponse | Message | null;

    if (reply) message = await this.reply(finaleMessageData);
    else if (!messageToEdit) message = await this.send(finaleMessageData);
    else {
      if (messageToEdit instanceof Message) message = await this.edit(finaleMessageData, messageToEdit);
      else if (messageToEdit instanceof InteractionResponse)
        message = await this.edit(finaleMessageData, await messageToEdit.fetch());
    }
    if (!message) return [null, message || null];

    const filter = (interaction): boolean => interaction.user.id === this.users[0].id;
    const response = await message.awaitMessageComponent({ filter, time: timeout }).catch(log);
    if (!response) return [null, message || null];

    return [response, message];
  }

  /**
   * Send a message in a text based channel (text, thread, announcements...).
   * @param messageData The message data to send (Discord.<BaseMessageOptions>).
   * @returns The message instance, or null if not sent.
   */
  public async send(messageData: BaseMessageOptions | string): Promise<Message | null> {
    if (!this.channel.isTextBased()) return null;

    const message: void | Message = await this.channel.send(this.transformMessageData(messageData)).catch(log);
    if (!message) return null;

    return message;
  }

  /**
   * Reply to an interaction.
   * @param messageData The message data to send (Discord.<BaseMessageOptions>).
   * @param interaction The interaction to reply to.
   * @returns The message instance, or null if not sent.
   */
  public async reply(
    messageData: BaseMessageOptions | string,
    interaction: Context['interaction'] = this.interaction,
  ): Promise<Message | InteractionResponse | null> {
    if (!this.channel.isTextBased()) return null;
    let message: void | InteractionResponse | Message;

    if (interaction.isRepliable()) {
      if (!interaction.deferred) {
        message = await interaction.reply(this.transformMessageData(messageData)).catch(log);
      } else {
        message = await interaction.followUp(this.transformMessageData(messageData)).catch(log);
      }
    }
    if (!message) return null;

    return message;
  }

  /**
   * Edit a message in a text based channel (text, thread, announcements...).
   * @param messageData The message data to send (Discord.<BaseMessageOptions>).
   * @param message The message to edit.
   * @param ignorePresentFields A boolean that indicates if the components/files need to be removed if the object is not passed.
   * @returns The message instance, or null if not sent.
   */
  public async edit(
    messageData: BaseMessageOptions | string,
    message: Message,
    ignorePresentFields: boolean = false,
  ): Promise<Message | null> {
    if (!this.channel.isTextBased()) return null;

    messageData = this.transformMessageData(messageData);
    if (!('components' in messageData) && !ignorePresentFields) {
      messageData.components = [];
    }
    if ('files' in messageData && messageData.files.length > 0 && !ignorePresentFields) {
      await message.removeAttachments().catch(log);
    }

    if (!message) return null;
    const editedMessage: void | Message = await message.edit(messageData).catch(log);
    if (!editedMessage) return null;

    return editedMessage;
  }

  /**
   * Add some content to a message with a single embed OR a content.
   * @param contentToAdd The content to add to the content already written.
   * @param message The message to edit.
   * @param contentOrEmbed Specify which place edit if there is both.
   * @param ignorePresentFields A boolean that indicates if the components/files need to be removed if the object is not passed.
   * @returns The edit message.
   */
  public async addContent(
    contentToAdd: string,
    message: Message | InteractionResponse,
    contentOrEmbed: 'content' | 'embed' = 'content',
    ignorePresentFields: boolean = false,
  ): Promise<Message> {
    if (message instanceof InteractionResponse) message = await message.fetch();
    const hasBoth: boolean = message.content && (message.embeds.length > 0 ? !!message.embeds[0].description : false);

    const whatEdit: 'content' | 'embed' = message.content ? 'content' : 'embed';
    if ((!hasBoth && whatEdit === 'content') || (hasBoth && contentOrEmbed === 'content'))
      return await this.edit({ content: message.content + contentToAdd }, message, ignorePresentFields);
    if ((!hasBoth && whatEdit === 'embed') || (hasBoth && contentOrEmbed === 'embed'))
      return await this.edit(message.embeds[0].description + contentToAdd, message, ignorePresentFields);
  }

  /**
   * Edit the specified buttons from a message and applies a cool animation.
   * @param buttonsId The buttons chosen.
   * @param message The message to edit the buttons from.
   * @returns The message instance, or null if not sent.
   */
  public async chosenButton(buttonsId: string[], message: Message): Promise<Message | null> {
    const fullRows: ActionRowBuilder[] = [];
    const componentRows: ActionRow<MessageActionRowComponent>[] = message.components;

    for (const row of componentRows) {
      const components: MessageActionRowComponent[] = row.components;
      if (components.length === 0) continue;
      if (components[0].type !== ComponentType.Button) {
        // @ts-ignore
        const rowUpdated: ActionRowBuilder = new ActionRowBuilder().setComponents(components);
        fullRows.push(rowUpdated);
        continue;
      }

      const newButtons: ButtonBuilder[] = [];

      for (const button of components) {
        if (button.type !== ComponentType.Button) continue;

        const buttonUpdated: ButtonBuilder = new ButtonBuilder()
          .setCustomId(button.customId)
          .setStyle(button.style)
          .setDisabled(true);

        if (button.label) buttonUpdated.setLabel(button.label);
        if (button.emoji) buttonUpdated.setEmoji(button.emoji);

        if (buttonsId.includes(button.customId)) {
          if (button.customId.includes('accept')) buttonUpdated.setStyle(ButtonStyle.Success);
          if (button.customId.includes('decline')) {
            buttonUpdated.setStyle(ButtonStyle.Danger);
            buttonUpdated.setEmoji('✖️');
          }
          if (button.customId.includes('leave')) buttonUpdated.setStyle(ButtonStyle.Primary);
        }
        newButtons.push(buttonUpdated);
      }

      fullRows.push(new ActionRowBuilder().addComponents(newButtons));
    }

    // @ts-ignore
    return await this.edit({ components: fullRows }, message);
  }
}
