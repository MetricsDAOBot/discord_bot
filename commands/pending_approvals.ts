import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";
import { DashboardBuilder } from "../utils/DashboardBuilder";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pending_approvals')
		.setDescription('Get pending regraded requests!'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		try {
			let { user } = interaction;
			let res = await axios.post<RegradeRequest[]>('/pending_approvals', {
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

			let dashboardBuilder = new DashboardBuilder(ret, "Pending Approvals", 'Click the approve button if you\'re satisfied.');
			dashboardBuilder
				.disableApprovedAt()
				.setNav("approve", 0)
				.disableButtonLeft()
				.enableApprove()
				.enableReject();

			if(res.data.length < 2) dashboardBuilder.disableButtonRight();

			let {
				dashboard,
				actionRows
			} = dashboardBuilder.buildAll();

			await interaction.reply({ embeds: [dashboard], components: [...actionRows], ephemeral: true });
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to get pending approvals.", 5);
			// await interaction.reply({ content: "Unable to get pending approvals.", ephemeral: true });
		}
	},
};