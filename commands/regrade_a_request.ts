import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds, updateRequestDetails, updateTags } from "../utils/common";
import { CustomClient } from "../utils/CustomClient";
import { DashboardBuilder } from "../utils/DashboardBuilder";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('regrade_a_request')
		.setDescription('Assign you to someone else\'s regrade request! Only one request at a time!'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>, client: CustomClient) {
		try {
			let { user } = interaction;
			let res = await axios.patch<RegradeRequest | string>('/assign_grader_to_request', {
				discord_id: user.id,
				discord_name: `${user.username}#${user.discriminator}`,
			});

			let ret = res.data;

			if(typeof ret === "string") {
				await deleteReplyInteractionAfterSeconds(interaction, ret, 5);
				return;
			}

			let dashboardBuilder = new DashboardBuilder(ret, "Review This Dashboard", 'Click the review button once you\'re done.');
			dashboardBuilder
				.enableReview()
				.disableRegradedAt()
				.disableApprovedAt();

			let {
				dashboard,
				actionRows
			} = dashboardBuilder.buildAll();

			if(ret.thread_id) {
				await updateRequestDetails(client, ret);
				await updateTags(client, ret.thread_id, "Reviewing", `Request is being reviewed.`);
			}

			await interaction.reply({ embeds: [dashboard], components: [...actionRows], ephemeral: true });
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Error assigning you to a request!", 5);
		}
	},
};