import { Collection, BaseInteraction, BaseMessageOptions, GuildMemberRoleManager } from 'discord.js';

import Command from './Command';
import Client from './Client';
import { err, extractString, log, readEmbeds } from './Util';
import Context from './Context';
import ClientConfig from '../Res/ClientConfig';
import Strings from '../Res/Strings';
import { CoolDownsQueueElement } from './CoolDownManager';
import { InterferingQueueElement } from './InterferingManager';

/**
 * The model of a callback function for an event.
 * @param args The command args.
 */
export type EventCallback = (...args: any[]) => void;

/**
 * A default callback function used when nothing is set.
 * @param args The command args.
 * @returns Void.
 */
export async function callbackDefault(...args: any[]): Promise<void> {
  return void args;
}

/**
 * Represents an Event on client service.
 */
export default class Event {
  /**
   * The client instance.
   */
  public readonly client: Client;
  /**
   * The event name.
   */
  public readonly name: string;
  /**
   * The callback function.
   */
  public callback: EventCallback;

  /**
   * @param client The client instance.
   * @param name The event name.
   */
  constructor(client: Client, name: string) {
    this.client = client;
    this.name = name;
    this.callback = callbackDefault;
  }
}

/**
 * The collection that includes the default callback functions for basic events.
 */
export const defaultEventsCb: Collection<string, EventCallback> = new Collection();

defaultEventsCb.set('ready', (client: Client): void => {
  log(`Logged in as ${client.user.tag}.`);
});

defaultEventsCb.set('interactionCreate', async (client: Client, interaction: BaseInteraction): Promise<void> => {
  if (interaction.isButton() || interaction.isAnySelectMenu()) {
    if ((interaction.customId as string).startsWith('autodefer')) {
      await interaction.deferUpdate().catch(err);
    }
  }
  if (interaction.isChatInputCommand()) {
    const command: Command | undefined = client.Commands.getCommand(interaction.commandName);
    if (!command) return;
    const ctx: Context = new Context(interaction.channel, command, interaction, interaction.user);

    const activeCoolDowns: CoolDownsQueueElement[] = client.Commands.CoolDowns.coolDowns(
      interaction.user.id,
      command.data.name,
    );
    const activeInterfering: InterferingQueueElement[] = client.Commands.Interfering.interfering(
      interaction.user.id,
      ...(command.data.interferingCommands || []),
    );

    if (activeCoolDowns.length > 0) {
      const finishTime: string = String(activeCoolDowns[0][1] / 1000).split('.')[0];
      return void (await ctx.reply(
        `Doucement! La commande **/${command.data.name}** ne peut pas être exécutée de nouveau,` +
          ` temps d'attente: <t:${finishTime}:R><:color:YELLOW>`,
      ));
    }
    if (activeInterfering.length > 0) {
      return void (await ctx.reply(
        `Vous ne pouvez pas exécuter cette commande tant que **/${
          activeInterfering.length > 1
            ? activeInterfering.map((i: InterferingQueueElement) => i[0]).join('**, **/')
            : activeInterfering[0][0]
        }** est en cours d'utilisation.<:color:YELLOW>`,
      ));
    }

    if (command.data.forbiddenChannels && interaction.inGuild() && interaction.channel.id) {
      if (command.data.forbiddenChannels.includes(interaction.channel.id))
        return void (await ctx.reply('Vous ne pouvez pas exécuter cette commande dans ce salon.'));
    }

    if (command.data.forbiddenUsers && command.data.forbiddenUsers.includes(interaction.user.id))
      return void (await ctx.reply("Vous n'êtes pas autorisé(e) à exécuter cette commande."));

    if (command.data.forbiddenRoles && interaction.inGuild() && interaction.member) {
      if (
        command.data.forbiddenRoles.some((role: string) =>
          (interaction.member?.roles as GuildMemberRoleManager).cache.has(role),
        )
      )
        return void (await ctx.reply("Vous n'êtes pas autorisé(e) à exécuter cette commande. Rôles non autorisés."));
    }

    client.Commands.Interfering.registerInterfering(interaction.user.id, command.data.name, interaction.id);
    client.Commands.CoolDowns.registerCoolDown(interaction.user.id, command.data.name, command.data.coolDown || 0);

    ctx.command = command;
    ctx.interaction = interaction;
    command.ctx = ctx;
    await command.execute(client, interaction, ctx);
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'startModal') {
      const currentValue: string = interaction.message
        ? extractString(Strings.startUsernameContent[1] as RegExp, readEmbeds(interaction.message))
        : 'Rien';

      const value: string = interaction.fields.getTextInputValue('username');
      const startModalContent: string = Strings.startUsernameContent[0].replace('{value}', value);

      const command: Command | undefined = client.Commands.getCommand('start');
      const ctx: Context = new Context(interaction.channel, command, interaction, interaction.user);

      if (!ClientConfig.usernameRegexp.test(value)) {
        await interaction
          .reply({
            ephemeral: true,
            content:
              `## Votre nom d'utilisateur n'est pas valide.\n> :x: \`${value}\`\nVotre choix doit respecter certaines conditions:` +
              "\n1. N'inclure que des lettres majuscules ou minuscules, des chiffres et un espace entre les mots." +
              '\n2. Les caractères spéciaux autorisés sont `\'`, `.` et `"`.' +
              '\n3. Les accents sont autorisés.' +
              '\n4. Avoir une longueur minimale de 2 caractères' +
              '\n5. Avoir une longueur maximale de 30 caractères' +
              '\n\n> :warning: Ce message peut apparaître de façon imprévue. Si votre entrée présente les critères valides, réessayez.',
          })
          .catch(err);
        return command.end();
      }
      interaction.deferUpdate().catch(err);

      const messageEmbedData: BaseMessageOptions = ctx.transformMessageData(startModalContent);
      if (value !== currentValue) await ctx.edit(messageEmbedData, interaction.message, true);
      return command.end();
    }
  }
});
