"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Util_1 = require("../../Root/Util");
const data = {
    name: 'start',
    description: "Permet de démarrer votre aventure dans l'univers de Demon Slayer.",
    execute: async (client, interaction, ctx) => {
        let [wantToStart, message] = await ctx.validOrCancelDialog('[Texte de bienvenue à écrire]\n\nÊtes-vous certain de vouloir commencé votre aventure ?<:color:WHITE>', 30000, true);
        if (message instanceof discord_js_1.InteractionResponse)
            message = await message.fetch().catch(Util_1.err);
        if (wantToStart === null) {
            await ctx.send("Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>");
            await ctx.chosenButton(['autodefer_accept', 'autodefer_decline'], message);
            return ctx.command.end();
        }
        let userStarts = false;
        let raceChoice = null;
        let usernameChoice = null;
        let artChoice = null;
        let wayChoice = null;
        let raceMessage = null;
        switch (wantToStart) {
            case 'autodefer_accept':
                const acceptText = '*Vous avez accepté de commencer votre aventure. Procédons à la création de votre profil.*\n\n' +
                    "```  Vous voilà pourfendeur de démons depuis quelques semaines. Vous maîtrisez le Souffle de l'Eau après avoir suivi un entraînement polyvalent.\n\n" +
                    '  Cependant, vous vous trouvez face à un adversaire plus puissant, et le combat joue en votre défaveur. Il est sur le point de vous tuer, mais vous pose une dernière question.\n\n' +
                    "  « Je trouve que te tuer maintenant serait gâcher ton potentiel. Je te propose alors de devenir un démon afin que tu puisses atteindre ton maximum. Qu'en dis-tu ? »```\n" +
                    '- Si vous répondez oui, vous choisirez votre style de combat, votre nom de démon et également un potentiel accessoire.\n' +
                    '- Si vous répondez non, vous déterminerez votre Souffle et votre nom de pourfendeur.\n\n';
                [raceChoice, raceMessage] = await ctx.validOrCancelDialog(`${acceptText}<:color:WHITE>`, 30000, false, message);
                userStarts = true;
                break;
            case 'autodefer_decline':
                await ctx.edit("Vous n'avez pas accepté de commencer votre aventure.<:color:RED>", message);
                break;
            default:
                await ctx.send('Une erreur est survenue, la demande est annulée.<:color:RED>');
                await ctx.chosenButton(['autodefer_accept', 'autodefer_decline'], message);
                break;
        }
        if (!userStarts)
            return ctx.command.end();
        const player = await client.PlayerServer.create(interaction.user.id);
        await ctx.menuDialog('Quelle Voie souhaitez-vous emprunter ?\n\n<:color:WHITE>', {
            options: [
                ['warrior', 'Guerrier'],
                ['strategist', 'Stratège'],
                ['agile', 'Agile'],
                ['goliath', 'Goliath'],
                ['ninja', 'Ninja'],
            ],
        }, 30000, false, raceMessage);
    },
};
exports.default = data;
