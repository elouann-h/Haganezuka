"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colors = exports.SFToCtxChannel = exports.SFToUser = exports.SFToMember = exports.timeout = exports.split = exports.err = exports.test = exports.log = void 0;
const discord_js_1 = require("discord.js");
/**
 * Logs a message to the console.
 * @param args The message to log.
 * @returns Void.
 */
function log(...args) {
    console.log('⟦HAGANEZUKA LOG⟧', ...args);
}
exports.log = log;
/**
 * Logs a message to the console, with the "test" tag.
 * @param args The message to log.
 * @returns Void.
 */
function test(...args) {
    console.log('⟦HAGANEZUKA TEST⟧', ...args);
}
exports.test = test;
/**
 * Logs a message to the console, with the "error" tag.
 * @param args The message to log.
 * @returns Void.
 */
function err(...args) {
    console.error('⟦HAGANEZUKA ERROR⟧', ...args);
}
exports.err = err;
/**
 * Log a line to the console. Useful to separate logs.
 * @returns Void.
 */
function split() {
    console.log('⟦-------------------------------------------------⟧');
}
exports.split = split;
/**
 * The equivalent of setTimeout, but asynchronous.
 * @param fn The function to call.
 * @param ms The time to wait before calling the function.
 * @returns Void.
 * @example
 * await timeout(() => console.log('Hello world !'), 1000);
 */
async function timeout(fn, ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return fn(...arguments);
}
exports.timeout = timeout;
/**
 * A function that get the GuildMember instance with the given ID.
 * @param client The client instance.
 * @param guildID The guild ID.
 * @param member The member ID or username.
 * @returns The GuildMember instance.
 */
async function SFToMember(client, guildID, member) {
    if (!client || !(client instanceof discord_js_1.Client))
        throw new Error('Invalid client provided.');
    const guild = await client.guilds.fetch(guildID);
    let memberInstance = await guild.members.resolve(member);
    if (!memberInstance) {
        memberInstance = await guild.members.cache.find((m) => m.user.tag.startsWith(member));
    }
    return memberInstance;
}
exports.SFToMember = SFToMember;
/**
 * A function that get the User instance with the given ID.
 * @param client The client instance.
 * @param user The user ID or username.
 * @returns The User instance.
 */
async function SFToUser(client, user) {
    if (!client || !(client instanceof discord_js_1.Client))
        throw new Error('Invalid client provided.');
    let userInstance = await client.users.resolve(user);
    if (!userInstance) {
        userInstance = await client.users.cache.find((u) => u.tag.startsWith(user));
    }
    return userInstance;
}
exports.SFToUser = SFToUser;
/**
 * A function that get the Channel instance with the given ID.
 * @param client The client instance.
 * @param guildID The guild ID.
 * @param channel The channel ID or name.
 * @returns The Channel instance.
 */
async function SFToCtxChannel(client, guildID, channel) {
    if (!client || !(client instanceof discord_js_1.Client))
        throw new Error('Invalid client provided.');
    const guild = await client.guilds.fetch(guildID);
    let channelInstance = guild.channels.resolve(channel);
    if (!channelInstance)
        channelInstance = guild.channels.cache.find((c) => c.name.startsWith(channel));
    return channelInstance;
}
exports.SFToCtxChannel = SFToCtxChannel;
/**
 * The Colors enum. These are the colors used in the embeds.
 */
exports.Colors = {
    RED: 0xff4848,
    ORANGE: 0xff7526,
    YELLOW: 0xffec80,
    GREEN: 0x36ff6d,
    BLUE: 0x454bff,
    WHITE: 0xebebeb,
};
