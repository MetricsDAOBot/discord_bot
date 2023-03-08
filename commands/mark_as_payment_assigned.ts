import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { closeThread, deleteReplyInteractionAfterSeconds, updateRequestDetails, updateTags } from "../utils/common";
import { CustomClient } from "../utils/CustomClient";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mark_as_payment_assigned')
		.setDescription('Marks the approved request as payment assigned! (Only usable in request posts)'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>, client: CustomClient) {
		try {
			let { user } = interaction;

            await interaction.deferReply({ ephemeral: true });

            let res = await axios.post<RegradeRequest | string>('/mark_request_as_payment_assigned', {
                discord_id: user.id,
                thread_id: interaction.channelId,
            });

            // has error
            if(typeof res.data === "string") {
                await deleteReplyInteractionAfterSeconds(interaction, res.data, 5, "update");
                return;
            }

            // update tags and send message
            if(res.data.thread_id) {
                await updateRequestDetails(client, res.data);
                await updateTags(client, res.data.thread_id, "Payment Assigned", "This request has been assigned a payment.");
                try {
                    await closeThread(client, res.data);
                }

                catch {
                    // do nothing
                }
            }

            await deleteReplyInteractionAfterSeconds(interaction, "Success", 5, "update");
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to mark as payment assigned.", 5, "update");
		}
	},
};