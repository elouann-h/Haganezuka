// noinspection JSUnusedGlobalSymbols

import { ChatInputCommandInteraction, InteractionResponse, Message } from 'discord.js';

import { CommandType } from '../../Root/Command';
import Client from '../../Root/Client';
import Context from '../../Root/Context';
import { wayNames, waySkills, wayEmojis, wayDescriptions, skillNames } from '../../Game/Content';
import { Art, Vowels, Way } from '../../Game/Typings';
import BloodDemonArts from '../../Game/BloodDemonArts';
import BreathingStyles from '../../Game/BreathingStyles';
import ClientConfig from '../ClientConfig';
import Strings from '../Strings';

const data: CommandType = {
  name: 'start',
  description: "Permet de démarrer votre aventure dans l'univers de Demon Slayer.",
  interferingCommands: ['start'],
  coolDown: 60000,
  execute: async (client: Client, interaction: ChatInputCommandInteraction, ctx: Context): Promise<void> => {
    let startMessage: Message | InteractionResponse | null;
    let raceMessage: Message | InteractionResponse | null;
    let wayMessage: Message | InteractionResponse | null;
    let artMessage: Message | InteractionResponse | null;
    let usernameMessage: Message | InteractionResponse | null;

    let userStarts: boolean = false;
    let startsChoice: string | null;
    let raceChoice: string | null;
    let wayDecision: string;
    let wayChoice: string | null;
    let artDecision: string;
    let artChoice: string | null;
    let usernameDecision: string;
    let usernameChoice: string | null;

    // Dialog if the player wants to start
    [startsChoice, startMessage] = await ctx.validOrCancelDialog(
      `${Strings.beginText}<:color:WHITE>`,
      ['accept', 'decline'],
      ClientConfig.defaultComponentTimeout,
      true,
    );
    // If he voids the dialog
    if (startsChoice === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        startMessage as Message,
      );
      return ctx.command.end();
    }
    // We check the answer
    switch (startsChoice) {
      case 'autodefer_accept':
        // If it's yes, we dive onto the profil creation
        await ctx.addContent(
          '\n\n### → Vous allez désormais passer à la création de votre personnage fictif. Bienvenue !<:color:GREEN>',
          startMessage as Message,
        );
        userStarts = true;
        break;
      case 'autodefer_decline':
        // If it's no, we close the profil creation
        await ctx.addContent(
          "\n\n### → Vous n'avez pas accepté de commencer votre aventure.<:color:RED>",
          startMessage as Message,
        );
        break;
      default:
        // If there is an error
        await ctx.addContent(
          '\n\n### → Une erreur est survenue, la demande est annulée.<:color:RED>',
          startMessage as Message,
        );
        break;
    }
    if (!userStarts) return ctx.command.end();

    // We ask the player for his race
    [raceChoice, raceMessage] = await ctx.validOrCancelDialog(
      `${Strings.raceText}<:color:WHITE>`,
      ['accept', 'decline', 'leave'],
      ClientConfig.defaultComponentTimeout,
    );
    // If he voids the dialog
    if (raceChoice === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        raceMessage as Message,
      );
      return ctx.command.end();
    }
    // We check the answer
    switch (raceChoice) {
      case 'autodefer_accept':
        // If it's yes, we go to the next step and making the player a demon
        raceChoice = 'demon';
        await ctx.addContent(
          "\n\n### → Après quelques minutes d'agonie, il semblerait que votre corps supporte le sang de Kibutsuji Muzan." +
            `\n### Vous êtes désormais un **démon** !<:color:GREEN>`,
          raceMessage as Message,
        );
        break;
      case 'autodefer_decline':
        // If it's no, we go to the next step and making the player a human
        raceChoice = 'human';
        await ctx.addContent(
          "\n\n### → Après quelques minutes d'agonie, un mystérieux pourfendeur de démons vole à votre secours et vous sauve la vie." +
            `\n\n### Vous êtes donc un **humain (pourfendeur)** !<:color:GREEN>`,
          raceMessage as Message,
        );
        break;
      case 'autodefer_leave':
        // If it's leave, we close the profil creation
        await ctx.addContent(
          '\n\n### → Vous avez quitté la création de personnage.<:color:RED>',
          raceMessage as Message,
        );
        return ctx.command.end();
    }

    // We ask the player for his way
    // The way contents (description etc)
    const wayContents: Record<Way, string> = {
      warrior: '',
      strategist: '',
      agile: '',
      goliath: '',
      ninja: '',
    };
    // The loop for the way contents
    for (const way in wayNames) {
      wayContents[way as Way] = `## Voie ${Vowels.includes(wayNames[way].toLowerCase()[0]) ? "de l'" : 'du'} ${
        wayNames[way as Way]
      }\n\n${wayDescriptions[way as Way]}\n\n`;
      wayContents[way as Way] += `- Compétence principale : ${skillNames[waySkills[way as Way][0]]}\n`;
      wayContents[way as Way] += `- Bonus : ${skillNames[waySkills[way as Way][1]]}\n`;
      wayContents[way as Way] += `- Malus n°1 : ${skillNames[waySkills[way as Way][2]]}\n`;
      wayContents[way as Way] += `- Malus n°2 : ${skillNames[waySkills[way as Way][3]]}\n`;
    }
    // The way dialog, we ask the player to choose a way
    [wayDecision, wayChoice, wayMessage] = await ctx.panelDialog(
      '',
      {
        options: [
          ['warrior', 'Guerrier', wayEmojis.warrior],
          ['strategist', 'Stratège', wayEmojis.strategist],
          ['agile', 'Agile', wayEmojis.agile],
          ['goliath', 'Goliath', wayEmojis.goliath],
          ['ninja', 'Ninja', wayEmojis.ninja],
        ],
      },
      [
        ['warrior', wayContents.warrior],
        ['strategist', wayContents.strategist],
        ['agile', wayContents.agile],
        ['goliath', wayContents.goliath],
        ['ninja', wayContents.ninja],
      ],
      ['accept', 'leave'],
      ClientConfig.defaultComponentTimeout,
      false,
    );
    // If he voids the dialog
    if (wayDecision === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        wayMessage as Message,
      );
      return ctx.command.end();
    }
    // We check the answer, if it's leave, we close the profil creation
    if (wayDecision.includes('leave')) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas choisi de Voie, la demande est annulée.<:color:RED>",
        wayMessage as Message,
      );
      return ctx.command.end();
    }

    // We set the way choice and send a confirmation message
    await ctx.addContent(
      `\n\n### → Vous êtes désormais un adepte de la Voie **« ${wayNames[wayChoice]} »**\n\n` + `<:color:GREEN>\``,
      wayMessage as Message,
    );

    const artType: string = ['Style de Souffle : ', 'Pouvoir Sanguinaire : '][raceChoice === 'human' ? 0 : 1];
    // The art content (techniques etc)
    const artList: Art[] = (raceChoice === 'human' ? BreathingStyles : BloodDemonArts).filter(
      (art: Art) => !art.custom,
    );
    const artContents: Record<string, string> = {};
    // The loop for the art contents
    for (const art of artList) {
      artContents[art.id] = `## ${artType} ${art.name}\n\n`;
      artContents[art.id] += `### Techniques:\n${art.moves.map((tech: string): string => `- ${tech}`).join('\n')}\n\n`;
    }
    // The art dialog, we ask the player to choose an art
    [artDecision, artChoice, artMessage] = await ctx.panelDialog(
      '',
      {
        options: artList.map((art: (typeof BreathingStyles)[0]): [string, string] => [art.id, art.name]),
      },
      artList.map((art: (typeof BreathingStyles)[0]): [string, string] => [art.id, artContents[art.id]]),
      ['accept', 'leave'],
      ClientConfig.defaultComponentTimeout,
    );
    // If he voids the dialog
    if (artDecision === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        artMessage as Message,
      );
      return ctx.command.end();
    }
    // We check the answer, if it's leave, we close the profil creation
    if (artDecision.includes('leave')) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas choisi d'ensemble de techniques, la demande est annulée.<:color:RED>",
        artMessage as Message,
      );
      return ctx.command.end();
    }

    // We set the art choice and send a confirmation message
    const artInfos: (typeof BreathingStyles)[0] = artList.find(
      (art: (typeof artList)[0]): boolean => art.id === artChoice,
    );
    await ctx.addContent(
      `\n\n### → Vous êtes désormais un adepte l'ensemble de techniques **« ${artInfos.name} »**.<:color:GREEN>`,
      artMessage as Message,
    );

    // The username dialog, we ask the player to choose a username
    [usernameDecision, usernameChoice, usernameMessage] = await ctx.modalDialog(
      Strings.startUsernameContent as [string, RegExp],
      {
        title: "Nom d'utilisateur",
        fields: [
          {
            label: 'Entrée:',
            id: 'username',
            style: 1,
            maxLength: 20,
            minLength: 2,
          },
        ],
      },
      ClientConfig.defaultComponentTimeout,
      'startModal',
    );
    // If he voids the dialog
    if (usernameDecision === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        usernameMessage as Message,
      );
      return ctx.command.end();
    }
    // We check the answer, if it's leave, we close the profil creation (even if the username is undefined)
    if (usernameDecision.includes('leave') || usernameChoice === 'Rien') {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas choisi de nom d'utilisateur, la demande est annulée.<:color:RED>",
        usernameMessage as Message,
      );
      return ctx.command.end();
    }

    // We set the username choice and send a confirmation message
    await ctx.edit(
      `### → Ravi de vous connaître, **${usernameChoice}**.\n\nVotre profil est désormais construit.\n` +
        `Il est désormais tant pour vous de démarrer votre aventure. Passez un très bon moment sur Haganezuka !` +
        `<:color:GREEN>`,
      usernameMessage as Message,
    );

    // We create the player on the database
    const player: void = await client.PlayerServer.create(interaction.user.id);
    return ctx.command.end();
  },
};

export default data;
