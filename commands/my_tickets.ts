import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('my_tickets')
		.setDescription('Get your current ticket count.'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            let {user} = interaction;
            let res = await axios.get(`/ticket_count/${user.id}`);
            await interaction.reply({ content: `You have ${res.data.toString()} ticket(s).`, ephemeral: true });
        }

        catch (e){
            //console.log(e);
            await interaction.reply({ content: "Unable to get your ticket count!", ephemeral: true });
        }
	},
};