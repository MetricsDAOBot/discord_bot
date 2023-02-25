import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove_admin')
		.setDescription('Removes an admin!')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Discord User')
                .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            let user = interaction.options.getUser('user');
            let res = await axios.post(
                '/remove_admin', 
                { 
                    discord_id: user?.id, 
                    discord_name: `${user?.username}#${user?.discriminator}`, 
                    removed_by_id: interaction.user.id 
                });

            await deleteReplyInteractionAfterSeconds(interaction, res.data, 5);
            // await interaction.reply({ content: res.data, ephemeral: true });
        }

        catch (e){
            console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Error removing admin!", 5);
            // await interaction.reply({ content: "Error removing admin!", ephemeral: true });
        }
	},
};