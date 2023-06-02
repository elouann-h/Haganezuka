"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data = {
    name: 'ping',
    description: 'Pong!',
    execute: async (client, interaction) => {
        await interaction.reply('Pong!');
    },
};
exports.default = data;
