import {
  BaseGuildVoiceChannel,
  BaseGuildTextChannel,
  TextBasedChannel,
  VoiceBasedChannel,
  BaseInteraction,
  User,
  BaseMessageOptions,
  EmbedBuilder,
  Message,
  Snowflake,
  ActionRowBuilder,
  ButtonBuilder,
  InteractionResponse,
  MessageActionRowComponent,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  SelectMenuInteraction,
  ButtonInteraction,
} from 'discord.js';

import { APIEmbedAuthor, ButtonStyle, ComponentType } from 'discord-api-types/v10';

import { log, Colors, SFToCtxChannel } from './Util';
import Command from './Command';
import Client from './Client';

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
  public readonly command: Command | undefined;
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
  public transformData(data: BaseMessageOptions | string): BaseMessageOptions {
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
   * Create a choice between accept or cancel.
   * @param messageData The message data to send (Discord.<BaseMessageOptions>).
   * @param timeout The time before the choice expires.
   * @param reply Whether to reply to the interaction or not.
   * @param messageToEdit The message to reply to if there is one.
   * @returns The choice of the user, or null if not sent.
   */
  public async validOrCancelDialog(
    messageData: BaseMessageOptions | string,
    timeout: number,
    reply: boolean = false,
    messageToEdit?: Message | InteractionResponse | null,
  ): Promise<[string, Message | InteractionResponse] | null> {
    const buttons: ButtonBuilder[] = [
      new ButtonBuilder().setCustomId('autodefer_accept').setStyle(ButtonStyle.Secondary).setEmoji('✅'),
      new ButtonBuilder().setCustomId('autodefer_decline').setStyle(ButtonStyle.Secondary).setEmoji('❌'),
    ];
    const row: ActionRowBuilder = new ActionRowBuilder().addComponents(buttons);

    let [response, message] = await this.messageComponentInteraction(messageData, row, timeout, reply, messageToEdit);
    if (!response) return null;

    // @ts-ignore
    return [(response as ButtonInteraction).customId, message];
  }

  /**
   * Create a selection between multiple choices.
   * @param messageData The message data to send (Discord.<BaseMessageOptions>).
   * @param menuData The choices to select from and other data like min and max.
   * @param timeout The time before the choice expires.
   * @param reply Whether to reply to the interaction or not.
   * @param messageToEdit The message to reply to if there is one.
   */
  public async menuDialog(
    messageData: BaseMessageOptions | string,
    menuData: MenuOptions,
    timeout: number,
    reply: boolean = false,
    messageToEdit?: Message | InteractionResponse | null,
  ): Promise<[string[], Message | InteractionResponse] | null> {
    const menu: SelectMenuBuilder = new SelectMenuBuilder().setCustomId('autodefer_menu');

    if ('placeholder' in menuData) menu.setPlaceholder(menuData.placeholder);
    if ('maxValues' in menuData) menu.setMaxValues(menuData.maxValues);
    if ('minValues' in menuData) menu.setMinValues(menuData.minValues);

    for (const option of menuData.options) {
      const optionBuilder: SelectMenuOptionBuilder = new SelectMenuOptionBuilder();
      optionBuilder.setValue(option[0]);
      optionBuilder.setLabel(option[1]);
      if (option.length > 2) optionBuilder.setEmoji(option[2]);
      menu.addOptions(optionBuilder);
    }

    const row: ActionRowBuilder = new ActionRowBuilder().addComponents(menu);

    let [response, message] = await this.messageComponentInteraction(messageData, row, timeout, reply, messageToEdit);
    if (!response) return null;

    // @ts-ignore
    return [(response as SelectMenuInteraction).values, message];
  }

  /**
   * Send/reply to a message and wait for a response.
   *
   */
  public async messageComponentInteraction(
    messageData: BaseMessageOptions | string,
    row: ActionRowBuilder,
    timeout: number,
    reply: boolean = false,
    messageToEdit?: Message | InteractionResponse | null,
  ) {
    const finaleMessageData: BaseMessageOptions = Object.assign(this.transformData(messageData), {
      components: [row],
    });
    let message: InteractionResponse | Message | null;

    if (reply) message = await this.reply(finaleMessageData);
    else if (!messageToEdit) message = await this.send(finaleMessageData);
    else {
      if (messageToEdit instanceof Message) message = await this.edit(finaleMessageData, messageToEdit);
      else if (messageToEdit instanceof InteractionResponse)
        message = await this.edit(finaleMessageData, await messageToEdit.fetch());
    }
    if (!message) return null;

    const filter = (interaction): boolean => interaction.user.id === this.users[0].id;
    const response = await message.awaitMessageComponent({ filter, time: timeout }).catch(log);

    if (!response) return null;

    return [response, message];
  }

  /**
   * Send a message in a text based channel (text, thread, announcements...).
   * @param messageData The message data to send (Discord.<BaseMessageOptions>).
   * @returns The message instance, or null if not sent.
   */
  public async send(messageData: BaseMessageOptions | string): Promise<Message | null> {
    if (!this.channel.isTextBased()) return null;

    const message: void | Message = await this.channel.send(this.transformData(messageData)).catch(log);
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
        message = await interaction.reply(this.transformData(messageData)).catch(log);
      } else {
        message = await interaction.followUp(this.transformData(messageData)).catch(log);
      }
    }
    if (!message) return null;

    return message;
  }

  /**
   * Edit a message in a text based channel (text, thread, announcements...).
   * @param messageData The message data to send (Discord.<BaseMessageOptions>).
   * @param message The message to edit.
   * @returns The message instance, or null if not sent.
   */
  public async edit(messageData: BaseMessageOptions | string, message: Message): Promise<Message | null> {
    if (!this.channel.isTextBased()) return null;

    messageData = this.transformData(messageData);
    if (!('components' in messageData)) {
      messageData.components = [];
    }
    if ('files' in messageData && messageData.files.length > 0) {
      await message.removeAttachments().catch(log);
    }

    const editedMessage: void | Message = await message.edit(messageData).catch(log);
    if (!editedMessage) return null;

    return editedMessage;
  }

  /**
   * Edit the specified buttons from a message and applies a cool animation.
   * @param buttonsId The buttons chosen.
   * @param message The message to edit the buttons from.
   * @returns The message instance, or null if not sent.
   */
  public async chosenButton(buttonsId: string[], message: Message): Promise<Message | null> {
    const buttons: MessageActionRowComponent[] = message.components[0].components;
    const newButtons: ButtonBuilder[] = [];

    for (const button of buttons) {
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
      }
      newButtons.push(buttonUpdated);
    }

    const row: ActionRowBuilder = new ActionRowBuilder().addComponents(newButtons);
    // @ts-ignore
    return await this.edit({ components: [row] }, message);
  }
}
