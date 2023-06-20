"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Util_1 = require("../../Root/Util");
const Content_1 = require("../../Game/Content");
const Typings_1 = require("../../Game/Typings");
const data = {
    name: 'start',
    description: "Permet de démarrer votre aventure dans l'univers de Demon Slayer.",
    execute: async (client, interaction, ctx) => {
        // ############################################################################################################## //
        // ########## STARTING ########################################################################################## //
        // ############################################################################################################## //
        const beginText = '## Haganezuka - Commencer\n\n' +
            "Haganezuka vous propose un jeu de rôle dans l'univers de **Demon Slayer: Kimetsu no Yaiba.** " +
            'Vous incarnerez un pourfendeur ou un démon, vous personnaliserez votre personnage et vous combattrez dans des scénarios épiques !\n\n' +
            "Le contenu du jeu est inspiré de l'oeuvre originale de **Koyoharu Gotōge**, tout en introduisant des créations originales.\n" +
            'Vous découvrirez par la suite les différentes mécaniques du jeu à travers des tutoriels.\n\n' +
            'Êtes-vous certain de vouloir commencer votre aventure ?';
        let [wantToStart, startMessage] = await ctx.validOrCancelDialog(`${beginText}<:color:WHITE>`, ['accept', 'decline'], 60000, true);
        if (startMessage instanceof discord_js_1.InteractionResponse)
            startMessage = await startMessage.fetch().catch(Util_1.err);
        if (wantToStart === null) {
            await ctx.edit("Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>", startMessage);
            return ctx.command.end();
        }
        // ############################################################################################################## //
        // ########## CREATION DU PROFIL ################################################################################ //
        // ############################################################################################################## //
        let userStarts = false;
        let raceChoice = null;
        let usernameChoice = null;
        let artChoice = null;
        let wayChoice = null;
        // #### CHOIX DE LA RACE ######################################################################################## //
        let raceMessage = null;
        switch (wantToStart) {
            case 'autodefer_accept':
                await ctx.edit('Vous allez désormais passer à la création de votre personnage fictif. Bienvenue !<:color:GREEN>', startMessage);
                userStarts = true;
                break;
            case 'autodefer_decline':
                await ctx.edit("Vous n'avez pas accepté de commencer votre aventure.<:color:RED>", startMessage);
                break;
            default:
                await ctx.edit('Une erreur est survenue, la demande est annulée.<:color:RED>', startMessage);
                break;
        }
        if (!userStarts)
            return ctx.command.end();
        const raceChoiceText = '## Parfait ! Avant de commencer...\n\n' +
            "```Vous voilà pourfendeur de démons depuis quelques semaines. Vous maîtrisez le Souffle de l'Eau après avoir suivi un entraînement polyvalent.\n\n" +
            ' Cependant, vous vous trouvez face à un adversaire plus puissant, et le combat joue en votre défaveur. Il est sur le point de vous tuer, mais vous pose une dernière question.\n\n' +
            "« Je trouve que te tuer maintenant serait gâcher ton potentiel. Je te propose alors de devenir un démon afin que tu puisses atteindre ton maximum. Qu'en dis-tu ? »```\n" +
            '- Si vous répondez oui, vous choisirez votre style de combat, votre nom de démon et également un potentiel accessoire.\n' +
            '- Si vous répondez non, vous déterminerez votre Souffle et votre nom de pourfendeur.\nPeu importe le choix que vous faites, vous devrez choisir une Voie.';
        [raceChoice, raceMessage] = await ctx.validOrCancelDialog(`${raceChoiceText}<:color:WHITE>`, ['accept', 'decline', 'leave'], 60000);
        const wayText = "## Votre Voie\nIl est temps de choisir votre Voie. Une Voie est une pré-sélection d'atouts et de malus parmi vos compétences. Sélectionnez celle qui vous ressemble le plus !";
        switch (raceChoice) {
            case 'autodefer_accept':
                raceChoice = 'demon';
                await ctx.edit("Après quelques minutes d'agonie, il semblerait que votre corps supporte le sang de Kibutsuji Muzan." +
                    `\n\nVous êtes désormais un **démon** !\n\n${wayText}<:color:GREEN>`, raceMessage);
                userStarts = true;
                break;
            case 'autodefer_decline':
                raceChoice = 'human';
                await ctx.edit("Après quelques minutes d'agonie, un mystérieux pourfendeur de démons vole à votre secours et vous sauve la vie." +
                    `\n\nVous êtes donc un **humain pourfendeur** !\n\n${wayText}<:color:GREEN>`, raceMessage);
                break;
            case 'autodefer_leave':
                await ctx.edit('Vous avez quitté la création de personnage.<:color:RED>', raceMessage);
                return ctx.command.end();
        }
        // #### CHOIX DE LA VOIE ######################################################################################## //
        const wayContents = {
            warrior: '',
            strategist: '',
            agile: '',
            goliath: '',
            ninja: '',
        };
        for (const way in Content_1.wayNames) {
            wayContents[way] = `## Voie ${Typings_1.Vowels.includes(Content_1.wayNames[way].toLowerCase()[0]) ? "de l'" : 'du'} ${Content_1.wayNames[way]}\n\n${Content_1.wayDescriptions[way]}\n\n`;
            wayContents[way] += `- Compétence principale : ${Content_1.skillNames[Content_1.waySkills[way][0]]}\n`;
            wayContents[way] += `- Bonus : ${Content_1.skillNames[Content_1.waySkills[way][1]]}\n`;
            wayContents[way] += `- Malus n°1 : ${Content_1.skillNames[Content_1.waySkills[way][2]]}\n`;
            wayContents[way] += `- Malus n°2 : ${Content_1.skillNames[Content_1.waySkills[way][3]]}\n`;
        }
        const [wayDecision, wayPage, wayMessage] = await ctx.panelDialog('Quelle Voie souhaitez-vous emprunter ?\n\n<:color:WHITE>', {
            options: [
                ['warrior', 'Guerrier', Content_1.wayEmojis.warrior],
                ['strategist', 'Stratège', Content_1.wayEmojis.strategist],
                ['agile', 'Agile', Content_1.wayEmojis.agile],
                ['goliath', 'Goliath', Content_1.wayEmojis.goliath],
                ['ninja', 'Ninja', Content_1.wayEmojis.ninja],
            ],
        }, [
            ['warrior', wayContents.warrior],
            ['strategist', wayContents.strategist],
            ['agile', wayContents.agile],
            ['goliath', wayContents.goliath],
            ['ninja', wayContents.ninja],
        ], ['accept', 'leave'], 60000, false);
        if (wayDecision.includes('leave')) {
            await ctx.edit("Vous n'avez pas choisi de Voie, la demande est annulée.<:color:RED>", wayMessage);
            return ctx.command.end();
        }
        wayChoice = wayPage;
        await ctx.edit(`Vous êtes désormais un adepte de la Voie **« ${Content_1.wayNames[wayChoice]} »**.<:color:GREEN>`, wayMessage);
        const player = await client.PlayerServer.create(interaction.user.id);
    },
};
exports.default = data;
