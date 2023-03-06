import { AxiosResponse } from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import moment from "moment";
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pending_approvals')
		.setDescription('Get pending regraded requests!'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		try {
			let { user } = interaction;
			let res = await axios.post<any, AxiosResponse<RegradeRequest[] | string>>('/pending_approvals', {
				discord_id: user.id,
				page: 0,
			});

			if(typeof res.data === "string") {
				await deleteReplyInteractionAfterSeconds(interaction, res.data, 5);
				// await interaction.reply({ content: res.data, ephemeral: true });
				return;
			}

			if(res.data.length === 0) {
				await deleteReplyInteractionAfterSeconds(interaction, "No pending approvals.", 5);
				// await interaction.reply({ content: "No pending approvals.", ephemeral: true });
				return;
			}

			let ret = res.data[0];

			// inside a command, event listener, etc.
			const dashboardEmbed = new EmbedBuilder()
								.setColor(0x0099FF)
								.setTitle("Pending Approvals")
								.setDescription('Click the approve button if you\'re satisfied.')
								.addFields(
									{ name: 'Submission', value: ret.submission? ret.submission : 'N/A' },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Current Score', value: ret.current_score? ret.current_score.toString() : 'N/A' },
									{ name: 'Expected Score', value: ret.expected_score? ret.expected_score.toString() : 'N/A' },
									//{ name: 'Reason', value: ret.reason ?? 'N/A' },
									{ name: 'Regraded Score', value: ret.regraded_score? ret.regraded_score.toString() : 'N/A' },
									//{ name: 'Regraded Reason', value: ret.regraded_reason ?? 'N/A' },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Submitted By', value: ret.discord_name, inline: true },
									{ name: 'Submitted At', value: moment(ret.created_at).format('YYYY-MM-DD HH:mm:ss'), inline: true },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Regraded By', value: ret.regraded_by? ret.regraded_by : 'N/A', inline: true },
									{ name: 'Regraded At', value: moment(ret.regraded_at).format('YYYY-MM-DD HH:mm:ss'), inline: true },
								);

			const button1 = new ButtonBuilder()
								.setCustomId(`nav_approval_0`) // split it when processing interaction
								.setLabel('<')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(true);

			const button2 = new ButtonBuilder()
								.setCustomId(`approve_0_${ret.uuid}`) // split it when processing interaction
								.setLabel('Approve')
								.setStyle(ButtonStyle.Success);

			const button4 = new ButtonBuilder()
								.setCustomId(`reject_0_${ret.uuid}`) // split it when processing interaction
								.setLabel('Reject')
								.setStyle(ButtonStyle.Danger);

			const buttonRegradeReason = new ButtonBuilder()
								.setCustomId(`reason_-1_${ret.uuid}`) // split it when processing interaction
								.setLabel('Request Reason')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!ret.reason);

			const buttonReason = new ButtonBuilder()
								.setCustomId(`reasonregraded_-1_${ret.uuid}`) // split it when processing interaction
								.setLabel('Regrader Feedback')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!ret.regraded_reason);

			const buttonFeedback = new ButtonBuilder()
								.setCustomId(`feedback_-1_${ret.uuid}`) // split it when processing interaction
								.setLabel('Grader Feedback')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!ret.grader_feedback);

			const button3 = new ButtonBuilder()
								.setCustomId(`nav_approval_1`) // split it when processing interaction
								.setLabel('>')
								.setStyle(ButtonStyle.Primary)
								// res.data.length is always 2
								// less than 2 = no more data
								.setDisabled(res.data.length < 2);

			const actionRow = new ActionRowBuilder().addComponents(button1, button2, button4, button3) as any;
			const actionRow2 = new ActionRowBuilder().addComponents(buttonRegradeReason, buttonReason, buttonFeedback) as any;

			await interaction.reply({ embeds: [dashboardEmbed], components: [actionRow, actionRow2], ephemeral: true });
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to get pending approvals.", 5);
			// await interaction.reply({ content: "Unable to get pending approvals.", ephemeral: true });
		}
	},
};