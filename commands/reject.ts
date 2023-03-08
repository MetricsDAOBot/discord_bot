import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { closeThread, deleteReplyInteractionAfterSeconds, updateRequestDetails, updateTags } from "../utils/common";
import { CustomClient } from "../utils/CustomClient";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reject')
		.setDescription('Reject this regraded score! (Only usable in request posts)'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>, client: CustomClient) {
		try {
			let { user } = interaction;

            await interaction.deferReply({ ephemeral: true });

            let res = await axios.post<string>('/reject_regrade_request', {
                discord_id: user.id,
                discord_name: `${user.username}#${user.discriminator}`,
                thread_id: interaction.channelId,
            });

            // has error
            if(res.data !== "Rejected") {
                await deleteReplyInteractionAfterSeconds(interaction, res.data, 5, "update");
                return;
            }

            let request = await axios.get<RegradeRequest[]>(`/regrade_request/${interaction.channelId}`);

            if(request.data[0]?.thread_id) {
                await updateRequestDetails(client, request.data[0]);
                await updateTags(client, request.data[0].thread_id, "Open", `Request's regraded score has been rejected.`);
            }

            await deleteReplyInteractionAfterSeconds(interaction, "Rejected, request is now open for review!", 5, "update");
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to reject this request's regraded score.", 5, "update");
		}
	},
};