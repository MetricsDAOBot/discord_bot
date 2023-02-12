import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('regrade_requests')
		.setDescription('Assign you to someone else\'s regrade request!')
		/* .addBooleanOption(option =>
			option.setName('self')
				.setDescription('Whether or not to show own requests only')) */,
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		await interaction.reply('regrade requests!');
	},
};