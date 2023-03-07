import { CacheType, ChatInputCommandInteraction, ForumChannel } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds, sendMessageInParts, sleep } from "../utils/common";
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

                let channel = client.channels.cache.get(DISCORD_COMMUNITY_FORUM_ID) as ForumChannel;

                let title = `[${request.blockchain ?? "N/A"}] ${request.question ?? "Review Request"} (${request.discord_name})`;
                let message = `Submitted by <@${request.discord_id}>`;

                let dashboardBuilder = new DashboardBuilder(request, "Request Details");
                dashboardBuilder
                    .disableRegrader()
                    .disableThread();
                let dashboard = dashboardBuilder.buildDashboard();

                //search for tag
                let tagName = "Open";

                if(request.approved_at) {
                    tagName = "Closed";
                    return;
                }

                else if(request.regraded_score) {
                    tagName = "Pending Approval";
                }

                else if(request.is_regrading) {
                    tagName = "Reviewing";
                }

                let tags = channel.availableTags.filter(x => x.name === tagName);
                const thread = await channel.threads.create({
                    name: title,
                    message: {
                        content: message,
                        embeds: [dashboard],
                    },
                    appliedTags: tags.length === 0? undefined : tags.map(x => x.id)
                });

                // log the thread id in backend
                await axios.post('/assign_regrade_request_thread_id', { uuid: request.uuid, thread_id: thread.id });

                if(request.reason) await sendMessageInParts(thread, "Request Reason", request.reason);
                if(request.grader_feedback) await sendMessageInParts(thread, "Original Feedback", request.grader_feedback);
                if(request.regraded_reason) await sendMessageInParts(thread, "Regrade Feedback", request.regraded_reason);
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