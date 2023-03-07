import { CacheType, ChatInputCommandInteraction, ForumChannel } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds, newThread, sendMessageInParts, sleep } from "../utils/common";
import { CustomClient } from "../utils/CustomClient";
import 'dotenv/config';
import { RegradeRequest } from "./types";
import { DashboardBuilder } from "../utils/DashboardBuilder";
import { DISCORD_COMMUNITY_FORUM_ID } from "..";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('seed_threads')
		.setDescription('Seeds missing threads!'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>, client: CustomClient) {
        try {
            let requests = await axios.get<RegradeRequest[]>('/regrade_request_without_threads');

            if(!requests.data || requests.data.length === 0) {
                await deleteReplyInteractionAfterSeconds(interaction, "No requests without threads.", 5);
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            let count = 0;
            for(const request of requests.data) {
                await newThread(client, request);
                count++;
            }

            await interaction.editReply({ content: `${count} new threads were created.`});
            await sleep(5000);
            await interaction.deleteReply();
        }

        catch (e){
            console.log(e);
            try {
                await deleteReplyInteractionAfterSeconds(interaction, "Error adding new request!", 5);
            }

            catch {
                // might have deferred
                await interaction.editReply({ content: "Error adding new request!"});
                await sleep(5000);
                await interaction.deleteReply();
            }
        }
	},
};