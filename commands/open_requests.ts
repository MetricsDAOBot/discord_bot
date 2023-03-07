import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds, sleep } from "../utils/common";
import { RegradeRequestCSV } from "./types";

const OPEN_FOR_REVIEW = 0;
const REVIEW_IN_PROGRESS = 1;
const PENDING_APPROVAL = 2;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('open_requests')
		.setDescription('Returns all open requests.')
		.addIntegerOption(option =>
			option.setName('filter')
                .setDescription('Returns only selected option.')
				.addChoices(
                    { name: 'Open For Review', value: OPEN_FOR_REVIEW },
                    { name: 'Review In Progress', value: REVIEW_IN_PROGRESS },
                    { name: 'Pending Approval', value: PENDING_APPROVAL },
                )),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            let filter = interaction.options.getInteger('filter');
            let res = await axios.get<RegradeRequestCSV[]>(`/open_regrade_requests`);
            
			if(res.data.length === 0) {
				await deleteReplyInteractionAfterSeconds(interaction, "There are no open requests.", 5);
				// await interaction.reply({ content: "You have no requests.", ephemeral: true });
				return;
			}

            // if has regraded_by
            let ret = '';
            let currentLength = 1;

            res.data.forEach((request, index) => {
                const {discord_name, created_at, updated_at, regraded_at, approved_at, uuid, is_regrading, submission, grader_feedback, current_score, expected_score, reason, regraded_score, regraded_reason, regraded_by} = request;
                let status = "Open for Review";

                if(approved_at) {
                    status = "Approved";
                    return;
                }

                else if(regraded_score) {
                    status = "Pending Approval";
                    // filter out unrelated
                    if(filter != null && filter != PENDING_APPROVAL) {
                        return;
                    }
                }

                else if(is_regrading) {
                    status = "Review in Progress";
                    // filter out unrelated
                    if(filter != null && filter != REVIEW_IN_PROGRESS) {
                        return;
                    }
                }

                // filter out unrelated
                else if(filter != null && filter != OPEN_FOR_REVIEW) {
                    return;
                }

                ret += `\n${currentLength}. ${discord_name}'s <${submission}> (${status})`;
                currentLength++;
            });

            let filterStatus = "";
            switch(filter) {
                case PENDING_APPROVAL:
                    filterStatus = 'pending approval';
                    break;
                case REVIEW_IN_PROGRESS:
                    filterStatus = 'review in progress';
                    break;
                case OPEN_FOR_REVIEW:
                    filterStatus = 'open for review';
                    break;
                default:
                    filterStatus = 'open';
                    break;
            }

			if(ret.length === 0) {
				await deleteReplyInteractionAfterSeconds(interaction, `There are no ${filterStatus} requests.`, 5);
				// await interaction.reply({ content: "You have no requests.", ephemeral: true });
				return;
			}

            // might need to check if ret is more than 2000 characters

            await interaction.reply({ content: ret.trim(), ephemeral: true });
            await sleep(30000);
            await interaction.deleteReply();
            return;
        }

        catch (e){
            //console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction,"Error adding tickets!", 5);
            // await interaction.reply({ content: "Error adding tickets!", ephemeral: true });
        }
	},
};