import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_admin')
		.setDescription('Adds an admin!')
		/* .addBooleanOption(option =>
			option.setName('self')
				.setDescription('Whether or not to show own requests only')) */,
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		await interaction.reply('Add admin!');
	},
};