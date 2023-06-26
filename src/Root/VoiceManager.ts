// noinspection JSUnusedGlobalSymbols

import {
  Guild,
  Client,
  Snowflake,
  VoiceChannel,
  GuildMember,
  GuildBasedChannel,
  Collection,
  VoiceState,
} from 'discord.js';

import ClientOR from './Client';
import { SFToMember } from './Util';
import Context from './Context';

/**
 * The list of the different voice events.
 */
export const VoiceEvents = [
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
] as const;
/**
 * The literal type of the different voice events.
 */
export type VoiceEvent = (typeof VoiceEvents)[number];

/**
 * The function type for voice events callbacks. There is one event per member.
 * @param changes The different voice events (join, leave, mute, unmute, deafen, undeafen).
 * @param member The member that triggered the event.
 * @param oldState The old voice state of the member.
 * @param newState The new voice state of the member.
 */
export type VoiceEventCallback = (changes: VoiceEvent[], member: GuildMember, context: Context) => void | Promise<void>;

/**
 * Represents the class that contains different statistics about voice channels.
 */
export default class VoiceManager {
  /**
   * The Discord Client instance.
   */
  public readonly client: Client;
  /**
   * The guild to look on.
   */
  private _contextGuild: Snowflake;
  /**
   * The voice channel to look on.
   */
  private _contextChannel: Snowflake;
  /**
   * The different voice events configured by the user with their callbacks.
   */
  private readonly _voiceEvents: Collection<VoiceEvent, VoiceEventCallback>;

  /**
   * @param client The Discord Client instance.
   */
  constructor(client: Client<true> | ClientOR) {
    if (!client) throw new Error('Invalid client was provided.');
    if (client instanceof ClientOR) this.client = client;
    else if (client instanceof Client) this.client = client;
    else throw new Error('Invalid client was provided.');

    this._contextGuild = '';
    this._contextChannel = '';
    this._voiceEvents = new Collection();
  }

  /**
   * The guild to look on.
   * @returns The guild instance.
   */
  public get guild(): Guild {
    if (!this.client.isReady()) throw new Error('The client is not ready yet.');
    return this.client.guilds.resolve(this._contextGuild);
  }

  /**
   * The voice channel to look on.
   * @returns The voice channel instance.
   */
  public get channel(): VoiceChannel {
    if (!this.client.isReady()) throw new Error('The client is not ready yet.');

    if (!this._contextGuild) {
      if (!this.client.guilds.cache.size)
        throw new Error('The client is not in any guild, or the guild is not cached.');
      this._contextGuild = this.client.guilds.cache.first().id;
    }
    let resolved: GuildBasedChannel = this.guild.channels.resolve(this._contextChannel);
    if (!resolved)
      resolved = this.guild.channels.cache.find(
        (c: GuildBasedChannel): boolean => c.name.toLowerCase() === this._contextChannel.toLowerCase(),
      );
    return resolved as VoiceChannel;
  }

  /**
   * Set the guild to look on.
   */
  public set setGuild(guild: Snowflake) {
    if (typeof guild !== 'string') throw new Error('Invalid guild was provided.');
    this._contextGuild = guild;
  }

  /**
   * Set the voice channel to look on.
   */
  public set setChannel(channel: Snowflake) {
    if (typeof channel !== 'string') throw new Error('Invalid channel was provided.');
    this._contextChannel = channel;
  }

  /**
   * Returns the full list of members connected in the voice channel.
   * @param channel The voice channel to look on.
   * @param guild The guild to look on. It's recommended to set it before calling this method for performance issues.
   * @returns The list of members.
   */
  public members(channel?: Snowflake, guild?: Snowflake): GuildMember[] {
    if (!this.client.isReady()) throw new Error('The client is not ready yet.');
    if (guild) {
      if (typeof guild !== 'string') throw new Error('Invalid guild was provided.');
      this.setGuild = guild;
    }
    if (channel) {
      if (typeof channel !== 'string') throw new Error('Invalid channel was provided.');
      this.setChannel = channel;
    }

    if (!this._contextChannel) throw new Error('The channel is not set.');

    const channelInstance: VoiceChannel = this.channel;
    if (!channelInstance) throw new Error('The channel was not found.');

    const members: GuildMember[] = [];
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
  public async move(member: Snowflake | GuildMember, channel: Snowflake): Promise<GuildMember> {
    const [memberInstance, channelInstance]: [GuildMember, VoiceChannel] = await this.contextualize(member, channel);
    return await memberInstance.voice.setChannel(channelInstance);
  }

  /**
   * Disconnects a member from the voice channel.
   * @param member The member to disconnect.
   * @param channel The channel to disconnect the member to.
   * @returns The promised member.
   */
  public async disconnect(member: Snowflake | GuildMember, channel?: Snowflake): Promise<GuildMember> {
    const memberInstance: GuildMember = (await this.contextualize(member, channel || this._contextChannel))[0];
    return await memberInstance.voice.setChannel(null);
  }

  /**
   * Contextualizes the voice channel.
   * @param member The voice channel to contextualize.
   * @param channel The contextualized voice channel.
   * @returns The contextualized voice channel.
   */
  private async contextualize(
    member: Snowflake | GuildMember,
    channel: Snowflake,
  ): Promise<[GuildMember, VoiceChannel]> {
    if (!this.client.isReady()) throw new Error('The client is not ready yet.');
    if (!member) throw new Error('Invalid member was provided.');
    if (!channel) throw new Error('Invalid channel was provided.');

    if (typeof channel !== 'string') throw new Error('Invalid channel was provided.');

    this.setChannel = channel;
    const channelInstance: VoiceChannel = this.channel;
    if (typeof member === 'string') member = await SFToMember(this.client, this._contextGuild, member);
    if (!(member instanceof GuildMember)) throw new Error('Invalid member was provided.');

    if (!channelInstance) throw new Error('The channel was not found.');
    return [member, channelInstance];
  }

  /**
   * Registers a voice event.
   * @param event The voice event to register.
   * @param callback The callback to call when the event is triggered.
   * @returns Void.
   */
  public register(event: VoiceEvent, callback: VoiceEventCallback): void {
    if (!event || typeof event !== 'string' || !VoiceEvents.includes(event))
      throw new Error('Invalid event was provided.');
    if (!callback || typeof callback !== 'function') throw new Error('Invalid callback was provided.');

    this._voiceEvents.set(event, callback);
  }

  /**
   * Unregisters a voice event.
   * @param event The voice event to unregister.
   * @returns Void.
   */
  public unregister(event: VoiceEvent): void {
    if (!event || typeof event !== 'string' || !VoiceEvents.includes(event))
      throw new Error('Invalid event was provided.');

    this._voiceEvents.delete(event);
  }

  /**
   * Get the list of registered voice events.
   * @returns The list of registered voice events.
   */
  public get events(): Map<VoiceEvent, VoiceEventCallback> {
    return this._voiceEvents;
  }

  /**
   * Returns the list of changes in the voice state.
   * @param oldState The old voice state.
   * @param newState The new voice state.
   * @returns The list of changes.
   */
  public static getChanges(oldState: VoiceState, newState: VoiceState): VoiceEvent[] {
    const events: VoiceEvent[] = [];
    if (!oldState.channelId && newState.channelId) events.push('join');
    if (oldState.channelId && !newState.channelId) events.push('leave');
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) events.push('switch');
    if (oldState.serverDeaf !== newState.serverDeaf) events.push(newState.serverDeaf ? 'serverDeaf' : 'serverUndeaf');
    if (oldState.serverMute !== newState.serverMute) events.push(newState.serverMute ? 'serverMute' : 'serverUnmute');
    if (oldState.selfDeaf !== newState.selfDeaf) events.push(newState.selfDeaf ? 'selfDeaf' : 'selfUndeaf');
    if (oldState.selfMute !== newState.selfMute) events.push(newState.selfMute ? 'selfMute' : 'selfUnmute');
    if (oldState.selfVideo !== newState.selfVideo) events.push(newState.selfVideo ? 'enableVideo' : 'disableVideo');
    if (oldState.streaming !== newState.streaming) events.push(newState.streaming ? 'startStreaming' : 'stopStreaming');
    if (oldState.suppress !== newState.suppress)
      events.push(newState.suppress ? 'stageSuppressedOn' : 'stageSuppressedOff');
    if (oldState.requestToSpeakTimestamp !== newState.requestToSpeakTimestamp)
      events.push(newState.requestToSpeakTimestamp ? 'askSpeakRequest' : 'cancelSpeakRequest');

    return events;
  }
}
