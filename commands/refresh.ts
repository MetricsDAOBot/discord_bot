import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { closeThread, deleteReplyInteractionAfterSeconds, updateRequestDetails, updateTags } from "../utils/common";
import { CustomClient } from "../utils/CustomClient";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('refresh')
		.setDescription('Refreshes the request\'s details.'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>, client: CustomClient) {
		try {
            await interaction.deferReply({ ephemeral: true });

            let request = await axios.get<RegradeRequest[]>(`/regrade_request_by_thread_id/${interaction.channelId}`);

            // update tags and send message
            if(request.data[0]?.thread_id) {
                await updateRequestDetails(client, request.data[0]);
            }

            await deleteReplyInteractionAfterSeconds(interaction, "Refreshed", 5, "update");
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to refresh.", 5, "update");
		}
	},
};