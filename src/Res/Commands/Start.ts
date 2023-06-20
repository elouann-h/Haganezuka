import { ChatInputCommandInteraction, InteractionResponse, Message } from 'discord.js';

import { CommandType } from '../../Root/Command';
import Client from '../../Root/Client';
import Context from '../../Root/Context';
import { err } from '../../Root/Util';
import { wayNames, waySkills, wayEmojis, wayDescriptions, skillNames } from '../../Game/Content';
import { Vowels, Way } from '../../Game/Typings';

const data: CommandType = {
  name: 'start',
  description: "Permet de démarrer votre aventure dans l'univers de Demon Slayer.",
  execute: async (client: Client, interaction: ChatInputCommandInteraction, ctx: Context): Promise<void> => {
    // ############################################################################################################## //
    // ########## STARTING ########################################################################################## //
    // ############################################################################################################## //
    const beginText: string =
      '## Haganezuka - Commencer\n\n' +
      "Haganezuka vous propose un jeu de rôle dans l'univers de **Demon Slayer: Kimetsu no Yaiba.** " +
      'Vous incarnerez un pourfendeur ou un démon, vous personnaliserez votre personnage et vous combattrez dans des scénarios épiques !\n\n' +
      "Le contenu du jeu est inspiré de l'oeuvre originale de **Koyoharu Gotōge**, tout en introduisant des créations originales.\n" +
      'Vous découvrirez par la suite les différentes mécaniques du jeu à travers des tutoriels.\n\n' +
      'Êtes-vous certain de vouloir commencer votre aventure ?';
    let [wantToStart, startMessage]: [string, Message | InteractionResponse] | null = await ctx.validOrCancelDialog(
      `${beginText}<:color:WHITE>`,
      ['accept', 'decline'],
      60000,
      true,
    );

    if (startMessage instanceof InteractionResponse) startMessage = await startMessage.fetch().catch(err as never);

    if (wantToStart === null) {
      await ctx.edit("Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>", startMessage as Message);
      return ctx.command.end();
    }
    // ############################################################################################################## //
    // ########## CREATION DU PROFIL ################################################################################ //
    // ############################################################################################################## //
    let userStarts: boolean = false;
    let raceChoice: string | null = null;
    let usernameChoice: string | null = null;
    let artChoice: string | null = null;
    let wayChoice: string | null = null;

    // #### CHOIX DE LA RACE ######################################################################################## //
    let raceMessage: Message | InteractionResponse | null = null;

    switch (wantToStart) {
      case 'autodefer_accept':
        await ctx.edit(
          'Vous allez désormais passer à la création de votre personnage fictif. Bienvenue !<:color:GREEN>',
          startMessage as Message,
        );
        userStarts = true;
        break;
      case 'autodefer_decline':
        await ctx.edit("Vous n'avez pas accepté de commencer votre aventure.<:color:RED>", startMessage as Message);
        break;
      default:
        await ctx.edit('Une erreur est survenue, la demande est annulée.<:color:RED>', startMessage as Message);
        break;
    }
    if (!userStarts) return ctx.command.end();

    const raceChoiceText: string =
      '## Parfait ! Avant de commencer...\n\n' +
      "```Vous voilà pourfendeur de démons depuis quelques semaines. Vous maîtrisez le Souffle de l'Eau après avoir suivi un entraînement polyvalent.\n\n" +
      ' Cependant, vous vous trouvez face à un adversaire plus puissant, et le combat joue en votre défaveur. Il est sur le point de vous tuer, mais vous pose une dernière question.\n\n' +
      "« Je trouve que te tuer maintenant serait gâcher ton potentiel. Je te propose alors de devenir un démon afin que tu puisses atteindre ton maximum. Qu'en dis-tu ? »```\n" +
      '- Si vous répondez oui, vous choisirez votre style de combat, votre nom de démon et également un potentiel accessoire.\n' +
      '- Si vous répondez non, vous déterminerez votre Souffle et votre nom de pourfendeur.\nPeu importe le choix que vous faites, vous devrez choisir une Voie.';
    [raceChoice, raceMessage] = await ctx.validOrCancelDialog(
      `${raceChoiceText}<:color:WHITE>`,
      ['accept', 'decline', 'leave'],
      60000,
    );

    const wayText: string =
      "## Votre Voie\nIl est temps de choisir votre Voie. Une Voie est une pré-sélection d'atouts et de malus parmi vos compétences. Sélectionnez celle qui vous ressemble le plus !";
    switch (raceChoice) {
      case 'autodefer_accept':
        raceChoice = 'demon';
        await ctx.edit(
          "Après quelques minutes d'agonie, il semblerait que votre corps supporte le sang de Kibutsuji Muzan." +
            `\n\nVous êtes désormais un **démon** !\n\n${wayText}<:color:GREEN>`,
          raceMessage as Message,
        );
        userStarts = true;
        break;
      case 'autodefer_decline':
        raceChoice = 'human';
        await ctx.edit(
          "Après quelques minutes d'agonie, un mystérieux pourfendeur de démons vole à votre secours et vous sauve la vie." +
            `\n\nVous êtes donc un **humain pourfendeur** !\n\n${wayText}<:color:GREEN>`,
          raceMessage as Message,
        );
        break;
      case 'autodefer_leave':
        await ctx.edit('Vous avez quitté la création de personnage.<:color:RED>', raceMessage as Message);
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

    const [wayDecision, wayPage, wayMessage]: [string, string, Message | InteractionResponse] = await ctx.panelDialog(
      'Quelle Voie souhaitez-vous emprunter ?\n\n<:color:WHITE>',
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
      60000,
      false,
    );

    if (wayDecision.includes('leave')) {
      await ctx.edit("Vous n'avez pas choisi de Voie, la demande est annulée.<:color:RED>", wayMessage as Message);
      return ctx.command.end();
    }
    wayChoice = wayPage;

    await ctx.edit(
      `Vous êtes désormais un adepte de la Voie **« ${wayNames[wayChoice]} »**.<:color:GREEN>`,
      wayMessage as Message,
    );

    const player: void = await client.PlayerServer.create(interaction.user.id);
  },
};

export default data;
