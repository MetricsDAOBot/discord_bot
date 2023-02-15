import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_ticket')
		.setDescription('Adds a Golden Ticket to a user!')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Discord User')
                .setRequired(true))
		.addStringOption(option =>
			option.setName('remark')
				.setDescription('Add a remark'))
		.addNumberOption(option =>
			option.setName('number_of_tickets')
				.setDescription('How many tickets to give this user?')),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            let user = interaction.options.getUser('user');
            let remark = interaction.options.getString('remark');
            let number_of_tickets = interaction.options.getNumber('number_of_tickets');
            let res = await axios.post(
                '/add_ticket', 
                { 
                    discord_id: user?.id, 
                    discord_name: `${user?.username}#${user?.discriminator}`, 
                    created_by: `${interaction.user.username}#${interaction.user.discriminator}`, 
                    created_by_id: interaction.user.id,
                    remark,
                    number_of_tickets
                });

            await deleteReplyInteractionAfterSeconds(interaction, res.data, 5000);
            // await interaction.reply({ content: res.data, ephemeral: true });
        }

        catch (e){
            //console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Error adding tickets!", 5000);
            // await interaction.reply({ content: "Error adding tickets!", ephemeral: true });
        }
	},
};