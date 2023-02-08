import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('new_regrade')
		.setDescription('Adds a new regrade request!'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		await interaction.reply('new regrade request!');
	},
};