import { Client, Guild, GuildBasedChannel, GuildMember, Snowflake, User } from 'discord.js';
import { ContextChannel } from './Context';

/**
 * Logs a message to the console.
 * @param args The message to log.
 * @returns Void.
 */
export function log(...args: any[]): void {
  console.log('⟦HAGANEZUKA LOG⟧', ...args);
}

/**
 * Logs a message to the console, with the "test" tag.
 * @param args The message to log.
 * @returns Void.
 */
export function test(...args: any[]): void {
  console.log('⟦HAGANEZUKA TEST⟧', ...args);
}

/**
 * Logs a message to the console, with the "error" tag.
 * @param args The message to log.
 * @returns Void.
 */
export function err(...args: any[]): void {
  console.error('⟦HAGANEZUKA ERROR⟧', ...args);
}

/**
 * Log a line to the console. Useful to separate logs.
 * @returns Void.
 */
export function split(): void {
  console.log('⟦-------------------------------------------------⟧');
}

/**
 * The equivalent of setTimeout, but asynchronous.
 * @param fn The function to call.
 * @param ms The time to wait before calling the function.
 * @returns Void.
 * @example
 * await timeout(() => console.log('Hello world !'), 1000);
 */
export async function timeout(fn: (...args: any[]) => any, ms: number): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return fn(...arguments);
}

/**
 * A function that get the GuildMember instance with the given ID.
 * @param client The client instance.
 * @param guildID The guild ID.
 * @param member The member ID or username.
 * @returns The GuildMember instance.
 */
export async function SFToMember(client: Client, guildID: Snowflake, member: string): Promise<GuildMember> {
  if (!client || !(client instanceof Client)) throw new Error('Invalid client provided.');

  const guild: Guild = await client.guilds.fetch(guildID);
  let memberInstance: GuildMember = await guild.members.resolve(member);
  if (!memberInstance) {
    memberInstance = await guild.members.cache.find((m: GuildMember): boolean => m.user.tag.startsWith(member));
  }
  return memberInstance;
}

/**
 * A function that get the User instance with the given ID.
 * @param client The client instance.
 * @param user The user ID or username.
 * @returns The User instance.
 */
export async function SFToUser(client: Client, user: string): Promise<User> {
  if (!client || !(client instanceof Client)) throw new Error('Invalid client provided.');

  let userInstance: User = await client.users.resolve(user);
  if (!userInstance) {
    userInstance = await client.users.cache.find((u: User): boolean => u.tag.startsWith(user));
  }
  return userInstance;
}

/**
 * A function that get the Channel instance with the given ID.
 * @param client The client instance.
 * @param guildID The guild ID.
 * @param channel The channel ID or name.
 * @returns The Channel instance.
 */
export async function SFToCtxChannel(client: Client, guildID: Snowflake, channel: string): Promise<ContextChannel> {
  if (!client || !(client instanceof Client)) throw new Error('Invalid client provided.');

  const guild: Guild = await client.guilds.fetch(guildID);
  let channelInstance: GuildBasedChannel = guild.channels.resolve(channel);
  if (!channelInstance)
    channelInstance = guild.channels.cache.find((c: GuildBasedChannel): boolean => c.name.startsWith(channel));

  return channelInstance as ContextChannel;
}

/**
 * The Colors enum. These are the colors used in the embeds.
 */
export const Colors = {
  RED: 0xff4848,
  ORANGE: 0xff7526,
  YELLOW: 0xffec80,
  GREEN: 0x36ff6d,
  BLUE: 0x454bff,
  WHITE: 0xebebeb,
} as const;
