import { CommandType } from '../../Root/Classes/Command';

const data: CommandType = {
  name: 'ping',
  description: 'Pong!',
  execute: async (client, interaction) => {
    await interaction.reply('Pong!');
  },
};

export default data;
