import { AxiosResponse } from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import moment from "moment";
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";
import { DashboardBuilder } from "../utils/DashboardBuilder";
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

			let dashboardBuilder = new DashboardBuilder(ret, "Review This Dashboard", 'Click the review button once you\'re done.');
			dashboardBuilder
				.enableReview()
				.disableRegradedAt()
				.disableApprovedAt();

			let {
				dashboard,
				actionRows
			} = dashboardBuilder.buildAll();

			await interaction.reply({ embeds: [dashboard], components: [...actionRows], ephemeral: true });
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Error assigning you to a request!", 5);
            // await interaction.reply({ content: "Error assigning you to a request!", ephemeral: true });
		}
	},
};