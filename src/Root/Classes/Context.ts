import {
  BaseGuildVoiceChannel,
  BaseGuildTextChannel,
  TextBasedChannel,
  VoiceBasedChannel,
  BaseInteraction,
  User,
  MessagePayload,
  EmbedBuilder,
  Message,
  Snowflake,
} from 'discord.js';

import { APIEmbedAuthor } from 'discord-api-types/v10';

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
  public readonly interaction: BaseInteraction | undefined;
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
    if (this.interaction) this.interaction = interaction;
    this.users = users;
  }

  /**
   * Send a message in a text based channel (text, thread, announcements...).
   * @param messagePayload The message data to send (Discord.<MessagePayload>).
   * @returns The message instance, or null if not sent.
   */
  public async send(messagePayload: MessagePayload | object): Promise<Message | null> {
    if (!this.channel.isTextBased()) return null;

    const message: void | Message = await this.channel.send(messagePayload).catch((reason: any): void => {
      log(`Message could not be sent: ${reason}`);
    });
    if (!message) return null;

    return message;
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
  ): Promise<Message<boolean> | void> {
    const embed: EmbedBuilder = new EmbedBuilder();

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
        if (alertData.timestamp) embed.setTimestamp(Date.now());
      } else if (typeof alertData.timestamp === 'number') {
        embed.setTimestamp(alertData.timestamp);
      }
    }

    embed.setColor(Colors[style]);
    embed.setTitle(alertData.title);
    embed.setDescription(alertData.description);

    if (!this.interaction) {
      return await this.send({ embeds: [embed.toJSON()] }).catch((reason: any): void => {
        log(`Message could not be sent: ${reason}`);
      });
    }
    if (this.interaction.isRepliable()) {
      // @ts-ignore
      return await this.interaction.reply({ embeds: [embed.toJSON()], ephemeral: true }).catch((reason: any): void => {
        log(`Interaction could not be replied to: ${reason}`);
      });
    } else {
      if (!this.interaction.isChatInputCommand()) return null;
      await this.interaction.deferReply({ ephemeral: true }).catch((reason: any): void => {
        log(`Interaction could not be deferred: ${reason}`);
      });
      const followedUp = await this.interaction
        .followUp({ embeds: [embed.toJSON()], ephemeral: true })
        .catch((reason: any): void => {
          log(`Interaction could not be followed up: ${reason}`);
        });

      if (!followedUp) return null;
      return followedUp;
    }
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
