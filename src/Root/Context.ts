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
 * Represents the data for an alert.
 */
export interface AlertData {
  /**
   * The author of the APIEmbed. See the Discord API documentation for more information.
   * @link https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure
   */
  author?: APIEmbedAuthor;
  /**
   * The color of the APIEmbed. One of the Colors enum.
   */
  color?: (typeof Colors)[keyof typeof Colors];
  /**
   * The description of the APIEmbed.
   */
  description: string;
  /**
   * The footer of the APIEmbed. A URL is expected.
   */
  image?: string;
  /**
   * The thumbnail of the APIEmbed. A URL is expected.
   */
  thumbnail?: string;
  /**
   * The timestamp of the APIEmbed. Can be a number, a Date instance or a boolean.
   */
  timestamp?: number | Date | null | boolean;
  /**
   * The title of the APIEmbed.
   */
  title: string;
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
   * @returns The choice of the user, or null if not sent.
   */
  public async choice(
    messageData: BaseMessageOptions | string,
    timeout: number,
    reply: boolean = false,
  ): Promise<[string, Message | InteractionResponse] | null> {
    const buttons: ButtonBuilder[] = [
      new ButtonBuilder().setCustomId('autodefer_accept').setStyle(ButtonStyle.Secondary).setEmoji('✅'),
      new ButtonBuilder().setCustomId('autodefer_decline').setStyle(ButtonStyle.Secondary).setEmoji('❌'),
    ];
    const row: ActionRowBuilder = new ActionRowBuilder().addComponents(buttons);

    const finaleMessageData: BaseMessageOptions = Object.assign(this.transformData(messageData), {
      components: [row],
    });
    let message: InteractionResponse | Message | null;
    if (reply) message = await this.reply(finaleMessageData);
    else message = await this.send(finaleMessageData);
    if (!message) return null;

    const filter = (interaction): boolean => interaction.user.id === this.users[0].id;
    const response = await message.awaitMessageComponent({ filter, time: timeout }).catch(log);

    if (!response) return null;

    return [response.customId, message];
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
   * Send an alert in a text based channel. The alert is sent as an embed.
   * @param alertData The data of the alert.
   * @param style The style of the alert.
   * @returns The message instance, or null if not sent.
   */
  public async alert(
    alertData: AlertData,
    style: keyof typeof Colors = Object.keys(Colors)[0] as keyof typeof Colors,
  ): Promise<Message | InteractionResponse | void> {
    const embed: EmbedBuilder = new EmbedBuilder();

    if (alertData.author) embed.setAuthor(alertData.author);
    if (alertData.description) embed.setDescription(alertData.description.substring(0, 4096));
    if (alertData.image) embed.setImage(alertData.image);
    if (alertData.thumbnail) embed.setThumbnail(alertData.thumbnail);

    if (alertData.timestamp) {
      if (typeof alertData.timestamp === 'boolean') {
        if (alertData.timestamp) embed.setTimestamp(Date.now());
      } else if (typeof alertData.timestamp === 'number') {
        embed.setTimestamp(alertData.timestamp);
      }
    }

    embed.setColor(Colors[style]);
    embed.setTitle(alertData.title);
    embed.setDescription(alertData.description);
    embed.setAuthor({ name: `@${this.users[0].username}`, iconURL: this.users[0].displayAvatarURL() });

    if (!this.interaction) {
      return await this.send({ embeds: [embed.toJSON()] }).catch(log);
    }
    if (this.interaction.isRepliable() && !this.interaction.replied) {
      return await this.interaction.reply({ embeds: [embed.toJSON()], ephemeral: true }).catch(log);
    }
    if (!this.interaction.isChatInputCommand()) return null;

    const message: void | Message = await this.channel.send({ embeds: [embed.toJSON()] }).catch(log);

    if (!message) return null;
    return message;
  }

  /**
   * Edit the specified buttons from a message.
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

  /**
   * Set the context channel.
   * @param guildId The guild ID of the channel.
   * @param channel The channel to set.
   * @returns The context instance.
   */
  public async setCtxChannel(guildId: Snowflake, channel: ContextChannel | Snowflake): Promise<this> {
    const client: Client = this?.command?.client || this.client || undefined;
    if (!client) throw new Error('No valid client provided.');

    if (typeof channel === 'string') channel = await SFToCtxChannel(client, guildId, channel);

    this.channel = channel as ContextChannel;
    return this;
  }
}
