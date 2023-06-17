import { ChatInputCommandInteraction, InteractionResponse, Message } from 'discord.js';

import { CommandType } from '../../Root/Command';
import Client from '../../Root/Client';
import Context from '../../Root/Context';
import { err } from '../../Root/Util'

const data: CommandType = {
  name: 'start',
  description: "Permet de démarrer votre aventure dans l'univers de Demon Slayer.",
  execute: async (client: Client, interaction: ChatInputCommandInteraction, ctx: Context): Promise<void> => {
    let [wantToStart, message]: [string, Message | InteractionResponse] | null = await ctx.choice(
      '[Texte de bienvenue à écrire]\n\nÊtes-vous certain de vouloir commencé votre aventure ?<:color:WHITE>',
      10000,
      true,
    );

    if (message instanceof InteractionResponse) {
      message = await message.fetch().catch(err as never);
    }

    if (wantToStart === null) {
      await ctx.send("Vous n'avez pas répondu à temps, la demande est annulée.<:color:WHITE>");
      await ctx.chosenButton(['autodefer_accept', 'autodefer_decline'], message as Message);
      return ctx.command.end();
    }

    switch (wantToStart) {
      case 'autodefer_accept':
        await ctx.edit('Vous avez accepté de commencer votre aventure.<:color:GREEN>', message as Message);
        // await ctx.chosenButton(['autodefer_accept'], message as Message);
        break;
      case 'autodefer_decline':
        await ctx.edit("Vous n'avez pas accepté de commencer votre aventure.<:color:RED>", message as Message);
        // await ctx.chosenButton(['autodefer_decline'], message as Message);
        break;
      default:
        await ctx.alert({ title: 'Oups...', description: 'Une erreur est survenue, la demande est annulée.' }, 'WHITE');
        await ctx.chosenButton(['autodefer_accept', 'autodefer_decline'], message as Message);
        break;
    }
  },
};

export default data;
