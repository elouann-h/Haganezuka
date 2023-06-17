"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Util_1 = require("../../Root/Util");
const data = {
    name: 'start',
    description: "Permet de démarrer votre aventure dans l'univers de Demon Slayer.",
    execute: async (client, interaction, ctx) => {
        let [wantToStart, message] = await ctx.choice('[Texte de bienvenue à écrire]\n\nÊtes-vous certain de vouloir commencé votre aventure ?<:color:WHITE>', 10000, true);
        if (message instanceof discord_js_1.InteractionResponse) {
            message = await message.fetch().catch(Util_1.err);
        }
        if (wantToStart === null) {
            await ctx.send("Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>");
            await ctx.chosenButton(['autodefer_accept', 'autodefer_decline'], message);
            return ctx.command.end();
        }
        switch (wantToStart) {
            case 'autodefer_accept':
                await ctx.edit('Vous avez accepté de commencer votre aventure.<:color:GREEN>', message);
                // await ctx.chosenButton(['autodefer_accept'], message as Message);
                break;
            case 'autodefer_decline':
                await ctx.edit("Vous n'avez pas accepté de commencer votre aventure.<:color:RED>", message);
                // await ctx.chosenButton(['autodefer_decline'], message as Message);
                break;
            default:
                await ctx.alert({ title: 'Oups...', description: 'Une erreur est survenue, la demande est annulée.' }, 'WHITE');
                await ctx.chosenButton(['autodefer_accept', 'autodefer_decline'], message);
                break;
        }
    },
};
exports.default = data;
