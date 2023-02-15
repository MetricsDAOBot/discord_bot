import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('my_tickets')
		.setDescription('Get your current ticket count.'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            let {user} = interaction;
            let res = await axios.get(`/ticket_count/${user.id}`);
            await deleteReplyInteractionAfterSeconds(interaction, `You have ${res.data.toString()} ticket(s).`, 5000);
            // await interaction.reply({ content: `You have ${res.data.toString()} ticket(s).`, ephemeral: true });
        }

        catch (e){
            //console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to get your ticket count!", 5000);
            // await interaction.reply({ content: "Unable to get your ticket count!", ephemeral: true });
        }
	},
};