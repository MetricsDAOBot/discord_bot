import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('approve_request')
		.setDescription('Get pending regraded requests!')
		/* .addBooleanOption(option =>
			option.setName('self')
				.setDescription('Whether or not to show own requests only')) */,
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		await interaction.reply('approve approvals!');
	},
};