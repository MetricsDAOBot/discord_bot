import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { closeThread, deleteReplyInteractionAfterSeconds, updateRequestDetails, updateTags } from "../utils/common";
import { CustomClient } from "../utils/CustomClient";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove_grader')
		.setDescription('Removes the grader.'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>, client: CustomClient) {
		try {
            await interaction.deferReply({ ephemeral: true });

            let request = await axios.post(
                '/remove_grader_by_thread_id', 
                {  
                    discord_id: interaction.user.id,
                    thread_id: interaction.channelId,
                });

            // update tags and send message
            if(request.data.thread_id) {
                await updateRequestDetails(client, request.data);
				await updateTags(client, request.data.thread_id, "1. Open", `Grader removed, request is now open.`);
            }

            await deleteReplyInteractionAfterSeconds(interaction, "Grader Removed", 5, "update");
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to remove.", 5, "update");
		}
	},
};