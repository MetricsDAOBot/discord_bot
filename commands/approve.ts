import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { closeThread, deleteReplyInteractionAfterSeconds, updateRequestDetails, updateTags } from "../utils/common";
import { CustomClient } from "../utils/CustomClient";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('approve')
		.setDescription('Approve this request! (Only usable in request posts)'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>, client: CustomClient) {
		try {
			let { user } = interaction;

            await interaction.deferReply({ ephemeral: true });

            let res = await axios.post<string>('/approve_regrade_request', {
                discord_id: user.id,
                discord_name: `${user.username}#${user.discriminator}`,
                thread_id: interaction.channelId,
            });

            // has error
            if(res.data !== "Approved") {
                await deleteReplyInteractionAfterSeconds(interaction, res.data, 5, "update");
                return;
            }

            let request = await axios.get<RegradeRequest[]>(`/regrade_request_by_thread_id/${interaction.channelId}`);

            // update tags and send message
            if(request.data[0]?.thread_id) {
                await updateRequestDetails(client, request.data[0]);
                let tag = (request.data[0].regraded_score ?? 0) > (request.data[0].current_score ?? 0)? "4. Payment Expected" :  "6. Closed";
                await updateTags(client, request.data[0].thread_id, tag, `Request's regraded score has been approved.\n\`\`\`Old Score: ${request.data[0].current_score}\nNew Score: ${request.data[0].regraded_score}\`\`\``);
                await closeThread(client, request.data[0]);
            }

            await deleteReplyInteractionAfterSeconds(interaction, "Approved", 5, "update");
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to approve.", 5, "update");
		}
	},
};