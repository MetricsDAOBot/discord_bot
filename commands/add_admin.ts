import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_admin')
		.setDescription('Adds an admin!')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Discord User')
                .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            let user = interaction.options.getUser('user');
            let res = await axios.post(
                '/add_admin', 
                { 
                    discord_id: user?.id, 
                    discord_name: `${user?.username}#${user?.discriminator}`, 
                    added_by: `${interaction.user.username}#${interaction.user.discriminator}`, 
                    added_by_id: interaction.user.id 
                });

            await deleteReplyInteractionAfterSeconds(interaction, res.data, 5);
            // await interaction.reply({ content: res.data, ephemeral: true });
        }

        catch (e){
            //console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Error adding admin!", 5);
            // await interaction.reply({ content: "Error adding admin!", ephemeral: true });
        }
	},
};