import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('review_request')
		.setDescription('Review someone else\'s request for a Golden Ticket'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		await interaction.reply('review requests!');
	},
};