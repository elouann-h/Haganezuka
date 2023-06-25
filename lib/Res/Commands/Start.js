"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Content_1 = require("../../Game/Content");
const Typings_1 = require("../../Game/Typings");
const BloodDemonArts_1 = require("../../Game/BloodDemonArts");
const BreathingStyles_1 = require("../../Game/BreathingStyles");
const ClientConfig_1 = require("../ClientConfig");
const Strings_1 = require("../Strings");
const data = {
    name: 'start',
    description: "Permet de démarrer votre aventure dans l'univers de Demon Slayer.",
    interferingCommands: ['start'],
    execute: async (client, interaction, ctx) => {
        // All variables
        let startMessage;
        let raceMessage;
        let wayMessage;
        let artMessage;
        let usernameMessage;
        let startsChoice;
        let raceChoice;
        let wayChoice;
        let artChoice;
        let usernameChoice;
        // ############################################################################################################## //
        // ########## STARTING ########################################################################################## //
        // ############################################################################################################## //
        [startsChoice, startMessage] = await ctx.validOrCancelDialog(`${Strings_1.default.beginText}<:color:WHITE>`, ['accept', 'decline'], ClientConfig_1.default.defaultComponentTimeout, true);
        if (startsChoice === null) {
            await ctx.addContent("\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>", startMessage);
            return ctx.command.end();
        }
        let userStarts = false;
        switch (startsChoice) {
            case 'autodefer_accept':
                await ctx.addContent('\n\n### → Vous allez désormais passer à la création de votre personnage fictif. Bienvenue !<:color:GREEN>', startMessage);
                userStarts = true;
                break;
            case 'autodefer_decline':
                await ctx.addContent("\n\n### → Vous n'avez pas accepté de commencer votre aventure.<:color:RED>", startMessage);
                break;
            default:
                await ctx.addContent('\n\n### → Une erreur est survenue, la demande est annulée.<:color:RED>', startMessage);
                break;
        }
        if (!userStarts)
            return ctx.command.end();
        // ############################################################################################################## //
        // ########## CREATION DU PROFIL ################################################################################ //
        // ############################################################################################################## //
        // #### CHOIX DE LA RACE ######################################################################################## //
        [raceChoice, raceMessage] = await ctx.validOrCancelDialog(`${Strings_1.default.raceText}<:color:WHITE>`, ['accept', 'decline', 'leave'], ClientConfig_1.default.defaultComponentTimeout);
        if (raceChoice === null) {
            await ctx.addContent("\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>", raceMessage);
            return ctx.command.end();
        }
        switch (raceChoice) {
            case 'autodefer_accept':
                raceChoice = 'demon';
                await ctx.addContent("\n\n### → Après quelques minutes d'agonie, il semblerait que votre corps supporte le sang de Kibutsuji Muzan." +
                    `\n### Vous êtes désormais un **démon** !<:color:GREEN>`, raceMessage);
                break;
            case 'autodefer_decline':
                raceChoice = 'human';
                await ctx.addContent("\n\n### → Après quelques minutes d'agonie, un mystérieux pourfendeur de démons vole à votre secours et vous sauve la vie." +
                    `\n\n### Vous êtes donc un **humain (pourfendeur)** !<:color:GREEN>`, raceMessage);
                break;
            case 'autodefer_leave':
                await ctx.addContent('\n\n### → Vous avez quitté la création de personnage.<:color:RED>', raceMessage);
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
        let wayDecision;
        [wayDecision, wayChoice, wayMessage] = await ctx.panelDialog('', {
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
        ], ['accept', 'leave'], ClientConfig_1.default.defaultComponentTimeout, false);
        if (wayDecision === null) {
            await ctx.addContent("\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>", wayMessage);
            return ctx.command.end();
        }
        if (wayDecision.includes('leave')) {
            await ctx.addContent("\n\n### → Vous n'avez pas choisi de Voie, la demande est annulée.<:color:RED>", wayMessage);
            return ctx.command.end();
        }
        await ctx.addContent(`\n\n### → Vous êtes désormais un adepte de la Voie **« ${Content_1.wayNames[wayChoice]} »**\n\n` + `<:color:GREEN>\``, wayMessage);
        // #### CHOIX DE L'ART ########################################################################################## //
        const artType = ['Style de Souffle : ', 'Pouvoir Sanguinaire : '][raceChoice === 'human' ? 0 : 1];
        const artList = raceChoice === 'human' ? BreathingStyles_1.default : BloodDemonArts_1.default;
        const artContents = {};
        for (const art of artList) {
            artContents[art.id] = `## ${artType} ${art.name}\n\n`;
            artContents[art.id] += `### Techniques:\n${art.moves.map((tech) => `- ${tech}`).join('\n')}\n\n`;
        }
        let artDecision;
        [artDecision, artChoice, artMessage] = await ctx.panelDialog('', {
            options: artList.map((art) => [art.id, art.name]),
        }, artList.map((art) => [art.id, artContents[art.id]]), ['accept', 'leave'], ClientConfig_1.default.defaultComponentTimeout);
        if (artDecision === null) {
            await ctx.addContent("\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>", artMessage);
            return ctx.command.end();
        }
        if (artDecision.includes('leave')) {
            await ctx.addContent("\n\n### → Vous n'avez pas choisi d'ensemble de techniques, la demande est annulée.<:color:RED>", artMessage);
            return ctx.command.end();
        }
        const artInfos = artList.find((art) => art.id === artChoice);
        await ctx.addContent(`\n\n### → Vous êtes désormais un adepte l'ensemble de techniques **« ${artInfos.name} »**.<:color:GREEN>`, artMessage);
        // #### CHOIX DU NOM D'UTILISATEUR ############################################################################## //
        let usernameDecision;
        [usernameDecision, usernameChoice, usernameMessage] = await ctx.modalDialog(Strings_1.default.startUsernameContent, {
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
        }, ClientConfig_1.default.defaultComponentTimeout, 'startModal');
        if (usernameDecision === null) {
            await ctx.addContent("\n\n### → Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>", usernameMessage);
            return ctx.command.end();
        }
        if (usernameDecision.includes('leave') || usernameChoice === 'Rien') {
            await ctx.addContent("\n\n### → Vous n'avez pas choisi de nom d'utilisateur, la demande est annulée.<:color:RED>", usernameMessage);
            return ctx.command.end();
        }
        await ctx.edit(`### → Ravi de vous connaître, **${usernameChoice}**.\n\nVotre profil est désormais construit.\n` +
            `Il est désormais tant pour vous de démarrer votre aventure. Passez un très bon moment sur Haganezuka !` +
            `<:color:GREEN>`, usernameMessage);
        const player = await client.PlayerServer.create(interaction.user.id);
        return ctx.command.end();
    },
};
exports.default = data;
