import { ChatInputCommandInteraction, InteractionResponse, Message } from 'discord.js';

import { CommandType } from '../../Root/Command';
import Client from '../../Root/Client';
import Context from '../../Root/Context';
import { wayNames, waySkills, wayEmojis, wayDescriptions, skillNames } from '../../Game/Content';
import { Vowels, Way } from '../../Game/Typings';
import BloodDemonArts from '../../Game/BloodDemonArts';
import BreathingStyles from '../../Game/BreathingStyles';
import ClientConfig from '../ClientConfig';
import Strings from '../Strings';

const data: CommandType = {
  name: 'start',
  description: "Permet de démarrer votre aventure dans l'univers de Demon Slayer.",
  interferingCommands: ['start'],
  execute: async (client: Client, interaction: ChatInputCommandInteraction, ctx: Context): Promise<void> => {
    // All variables
    let startMessage: Message | InteractionResponse | null;
    let raceMessage: Message | InteractionResponse | null;
    let wayMessage: Message | InteractionResponse | null;
    let artMessage: Message | InteractionResponse | null;
    let usernameMessage: Message | InteractionResponse | null;

    let startsChoice: string | null;
    let raceChoice: string | null;
    let wayChoice: string | null;
    let artChoice: string | null;
    let usernameChoice: string | null;
    // ############################################################################################################## //
    // ########## STARTING ########################################################################################## //
    // ############################################################################################################## //
    [startsChoice, startMessage] = await ctx.validOrCancelDialog(
      `${Strings.beginText}<:color:WHITE>`,
      ['accept', 'decline'],
      ClientConfig.defaultComponentTimeout,
      true,
    );
    if (startsChoice === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        startMessage as Message,
      );
      return ctx.command.end();
    }

    let userStarts: boolean = false;
    switch (startsChoice) {
      case 'autodefer_accept':
        await ctx.addContent(
          '\n\n### → Vous allez désormais passer à la création de votre personnage fictif. Bienvenue !<:color:GREEN>',
          startMessage as Message,
        );
        userStarts = true;
        break;
      case 'autodefer_decline':
        await ctx.addContent(
          "\n\n### → Vous n'avez pas accepté de commencer votre aventure.<:color:RED>",
          startMessage as Message,
        );
        break;
      default:
        await ctx.addContent(
          '\n\n### → Une erreur est survenue, la demande est annulée.<:color:RED>',
          startMessage as Message,
        );
        break;
    }
    if (!userStarts) return ctx.command.end();
    // ############################################################################################################## //
    // ########## CREATION DU PROFIL ################################################################################ //
    // ############################################################################################################## //

    // #### CHOIX DE LA RACE ######################################################################################## //
    [raceChoice, raceMessage] = await ctx.validOrCancelDialog(
      `${Strings.raceText}<:color:WHITE>`,
      ['accept', 'decline', 'leave'],
      ClientConfig.defaultComponentTimeout,
    );
    if (raceChoice === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        raceMessage as Message,
      );
      return ctx.command.end();
    }
    switch (raceChoice) {
      case 'autodefer_accept':
        raceChoice = 'demon';
        await ctx.addContent(
          "\n\n### → Après quelques minutes d'agonie, il semblerait que votre corps supporte le sang de Kibutsuji Muzan." +
            `\n### Vous êtes désormais un **démon** !<:color:GREEN>`,
          raceMessage as Message,
        );
        break;
      case 'autodefer_decline':
        raceChoice = 'human';
        await ctx.addContent(
          "\n\n### → Après quelques minutes d'agonie, un mystérieux pourfendeur de démons vole à votre secours et vous sauve la vie." +
            `\n\n### Vous êtes donc un **humain (pourfendeur)** !<:color:GREEN>`,
          raceMessage as Message,
        );
        break;
      case 'autodefer_leave':
        await ctx.addContent(
          '\n\n### → Vous avez quitté la création de personnage.<:color:RED>',
          raceMessage as Message,
        );
        return ctx.command.end();
    }

    // #### CHOIX DE LA VOIE ######################################################################################## //
    const wayContents: Record<Way, string> = {
      warrior: '',
      strategist: '',
      agile: '',
      goliath: '',
      ninja: '',
    };
    for (const way in wayNames) {
      wayContents[way as Way] = `## Voie ${Vowels.includes(wayNames[way].toLowerCase()[0]) ? "de l'" : 'du'} ${
        wayNames[way as Way]
      }\n\n${wayDescriptions[way as Way]}\n\n`;
      wayContents[way as Way] += `- Compétence principale : ${skillNames[waySkills[way as Way][0]]}\n`;
      wayContents[way as Way] += `- Bonus : ${skillNames[waySkills[way as Way][1]]}\n`;
      wayContents[way as Way] += `- Malus n°1 : ${skillNames[waySkills[way as Way][2]]}\n`;
      wayContents[way as Way] += `- Malus n°2 : ${skillNames[waySkills[way as Way][3]]}\n`;
    }
    let wayDecision: string;
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
    if (wayDecision === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        wayMessage as Message,
      );
      return ctx.command.end();
    }
    if (wayDecision.includes('leave')) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas choisi de Voie, la demande est annulée.<:color:RED>",
        wayMessage as Message,
      );
      return ctx.command.end();
    }

    await ctx.addContent(
      `\n\n### → Vous êtes désormais un adepte de la Voie **« ${wayNames[wayChoice]} »**\n\n` + `<:color:GREEN>\``,
      wayMessage as Message,
    );

    // #### CHOIX DE L'ART ########################################################################################## //
    const artType: string = ['Style de Souffle : ', 'Pouvoir Sanguinaire : '][raceChoice === 'human' ? 0 : 1];
    const artList: typeof BloodDemonArts | typeof BreathingStyles =
      raceChoice === 'human' ? BreathingStyles : BloodDemonArts;
    const artContents: Record<string, string> = {};
    for (const art of artList) {
      artContents[art.id] = `## ${artType} ${art.name}\n\n`;
      artContents[art.id] += `### Techniques:\n${art.moves.map((tech: string): string => `- ${tech}`).join('\n')}\n\n`;
    }
    let artDecision: string;
    [artDecision, artChoice, artMessage] = await ctx.panelDialog(
      '',
      {
        options: artList.map((art: (typeof BreathingStyles)[0]): [string, string] => [art.id, art.name]),
      },
      artList.map((art: (typeof BreathingStyles)[0]): [string, string] => [art.id, artContents[art.id]]),
      ['accept', 'leave'],
      ClientConfig.defaultComponentTimeout,
    );
    if (artDecision === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        artMessage as Message,
      );
      return ctx.command.end();
    }
    if (artDecision.includes('leave')) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas choisi d'ensemble de techniques, la demande est annulée.<:color:RED>",
        artMessage as Message,
      );
      return ctx.command.end();
    }

    const artInfos: (typeof BreathingStyles)[0] = artList.find(
      (art: (typeof artList)[0]): boolean => art.id === artChoice,
    );
    await ctx.addContent(
      `\n\n### → Vous êtes désormais un adepte l'ensemble de techniques **« ${artInfos.name} »**.<:color:GREEN>`,
      artMessage as Message,
    );

    // #### CHOIX DU NOM D'UTILISATEUR ############################################################################## //
    let usernameDecision: string;
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
    if (usernameDecision === null) {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>",
        usernameMessage as Message,
      );
      return ctx.command.end();
    }
    if (usernameDecision.includes('leave') || usernameChoice === 'Rien') {
      await ctx.addContent(
        "\n\n### → Vous n'avez pas choisi de nom d'utilisateur, la demande est annulée.<:color:RED>",
        usernameMessage as Message,
      );
      return ctx.command.end();
    }

    await ctx.edit(
      `### → Ravi de vous connaître, **${usernameChoice}**.\n\nVotre profil est désormais construit.\n` +
        `Il est désormais tant pour vous de démarrer votre aventure. Passez un très bon moment sur Haganezuka !` +
        `<:color:GREEN>`,
      usernameMessage as Message,
    );

    const player: void = await client.PlayerServer.create(interaction.user.id);
    return ctx.command.end();
  },
};

export default data;
