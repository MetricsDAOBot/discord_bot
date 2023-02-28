import { AxiosResponse } from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import moment from "moment";
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('regrade_a_request')
		.setDescription('Assign you to someone else\'s regrade request! Only one request at a time!'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		try {
			let { user } = interaction;
			let res = await axios.patch<any, AxiosResponse<RegradeRequest | string>>('/assign_grader_to_request', {
				discord_id: user.id,
				discord_name: `${user.username}#${user.discriminator}`,
			});

			let ret = res.data;
			// if new regrade request is added, it's gonna be a uuid
			/* if(isValidUUID(res.data)) {
				ret = "Please regrade this request: " + getFrontendBaseUrl() + `/regrade_request/${res.data}`;
			} */

			if(typeof ret === "string") {
				await deleteReplyInteractionAfterSeconds(interaction, ret, 5);
				// await interaction.reply({ content: ret, ephemeral: true });
				return;
			}

			// inside a command, event listener, etc.
			const dashboardEmbed = new EmbedBuilder()
								.setColor(0x0099FF)
								.setTitle("Review This Dashboard")
								.setDescription('Click the review button once you\'re done.')
								.addFields(
									{ name: 'Submission', value: ret.submission ?? "null" },
									{ name: 'Current Score', value: ret.current_score?.toString() ?? 'null' },
									{ name: 'Expected Score', value: ret.expected_score?.toString() ?? 'null' },
									{ name: 'Reason', value: ret.reason ?? "null" },
									{ name: 'Grader Feedback', value: ret.grader_feedback ?? "null" },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Submitted At', value: moment(ret.created_at).format('YYYY-MM-DD HH:mm:ss') },
								);

			const button = new ButtonBuilder()
								.setCustomId(`regrade_${ret.uuid}`) // split it when processing interaction
								.setLabel('Review')
								.setStyle(ButtonStyle.Primary);

			const actionRow = new ActionRowBuilder().addComponents(button) as any;

			await interaction.reply({ embeds: [dashboardEmbed], components: [actionRow], ephemeral: true });
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Error assigning you to a request!", 5);
            // await interaction.reply({ content: "Error assigning you to a request!", ephemeral: true });
		}
	},
};