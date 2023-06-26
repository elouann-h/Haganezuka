"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEventsCb = exports.callbackDefault = void 0;
const discord_js_1 = require("discord.js");
const Util_1 = require("./Util");
const Context_1 = require("./Context");
const ClientConfig_1 = require("../Res/ClientConfig");
const Strings_1 = require("../Res/Strings");
/**
 * A default callback function used when nothing is set.
 * @param args The command args.
 * @returns Void.
 */
async function callbackDefault(...args) {
    return void args;
}
exports.callbackDefault = callbackDefault;
/**
 * Represents an Event on client service.
 */
class Event {
    /**
     * The client instance.
     */
    client;
    /**
     * The event name.
     */
    name;
    /**
     * The callback function.
     */
    callback;
    /**
     * @param client The client instance.
     * @param name The event name.
     */
    constructor(client, name) {
        this.client = client;
        this.name = name;
        this.callback = callbackDefault;
    }
}
exports.default = Event;
/**
 * The collection that includes the default callback functions for basic events.
 */
exports.defaultEventsCb = new discord_js_1.Collection();
exports.defaultEventsCb.set('ready', (client) => {
    (0, Util_1.log)(`Logged in as ${client.user.tag}.`);
});
exports.defaultEventsCb.set('interactionCreate', async (client, interaction) => {
    if (interaction.isButton() || interaction.isAnySelectMenu()) {
        if (interaction.customId.startsWith('autodefer')) {
            await interaction.deferUpdate().catch(Util_1.err);
        }
    }
    if (interaction.isChatInputCommand()) {
        const command = client.Commands.getCommand(interaction.commandName);
        if (!command)
            return;
        const ctx = new Context_1.default(interaction.channel, command, interaction, interaction.user);
        const activeCoolDowns = client.Commands.CoolDowns.coolDowns(interaction.user.id, command.data.name);
        const activeInterfering = client.Commands.Interfering.interfering(interaction.user.id, ...(command.data.interferingCommands || []));
        if (activeCoolDowns.length > 0) {
            const finishTime = String(activeCoolDowns[0][1] / 1000).split('.')[0];
            return void (await ctx.reply(`Doucement! La commande **/${command.data.name}** ne peut pas être exécutée de nouveau,` +
                ` temps d'attente: <t:${finishTime}:R><:color:YELLOW>`));
        }
        if (activeInterfering.length > 0) {
            return void (await ctx.reply(`Vous ne pouvez pas exécuter cette commande tant que **/${activeInterfering.length > 1
                ? activeInterfering.map((i) => i[0]).join('**, **/')
                : activeInterfering[0][0]}** est en cours d'utilisation.<:color:YELLOW>`));
        }
        if (command.data.forbiddenChannels && interaction.inGuild() && interaction.channel.id) {
            if (command.data.forbiddenChannels.includes(interaction.channel.id))
                return void (await ctx.reply('Vous ne pouvez pas exécuter cette commande dans ce salon.'));
        }
        if (command.data.forbiddenUsers && command.data.forbiddenUsers.includes(interaction.user.id))
            return void (await ctx.reply("Vous n'êtes pas autorisé(e) à exécuter cette commande."));
        if (command.data.forbiddenRoles && interaction.inGuild() && interaction.member) {
            if (command.data.forbiddenRoles.some((role) => (interaction.member?.roles).cache.has(role)))
                return void (await ctx.reply("Vous n'êtes pas autorisé(e) à exécuter cette commande. Rôles non autorisés."));
        }
        client.Commands.Interfering.registerInterfering(interaction.user.id, command.data.name, interaction.id);
        client.Commands.CoolDowns.registerCoolDown(interaction.user.id, command.data.name, command.data.coolDown || 0);
        ctx.command = command;
        ctx.interaction = interaction;
        command.ctx = ctx;
        await command.execute(client, interaction, ctx);
    }
    else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'startModal') {
            const currentValue = interaction.message
                ? (0, Util_1.extractString)(Strings_1.default.startUsernameContent[1], (0, Util_1.readEmbeds)(interaction.message))
                : 'Rien';
            const value = interaction.fields.getTextInputValue('username');
            const startModalContent = Strings_1.default.startUsernameContent[0].replace('{value}', value);
            const command = client.Commands.getCommand('start');
            const ctx = new Context_1.default(interaction.channel, command, interaction, interaction.user);
            if (!ClientConfig_1.default.usernameRegexp.test(value)) {
                await interaction
                    .reply({
                    ephemeral: true,
                    content: `## Votre nom d'utilisateur n'est pas valide.\n> :x: \`${value}\`\nVotre choix doit respecter certaines conditions:` +
                        "\n1. N'inclure que des lettres majuscules ou minuscules, des chiffres et un espace entre les mots." +
                        '\n2. Les caractères spéciaux autorisés sont `\'`, `.` et `"`.' +
                        '\n3. Les accents sont autorisés.' +
                        '\n4. Avoir une longueur minimale de 2 caractères' +
                        '\n5. Avoir une longueur maximale de 30 caractères' +
                        '\n\n> :warning: Ce message peut apparaître de façon imprévue. Si votre entrée présente les critères valides, réessayez.',
                })
                    .catch(Util_1.err);
                return command.end();
            }
            interaction.deferUpdate().catch(Util_1.err);
            const messageEmbedData = ctx.transformMessageData(startModalContent);
            if (value !== currentValue)
                await ctx.edit(messageEmbedData, interaction.message, true);
            return command.end();
        }
    }
});
