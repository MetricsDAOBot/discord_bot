import { CacheType, ChatInputCommandInteraction, ForumChannel, ThreadChannel } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import { DISCORD_COMMUNITY_FORUM_ID } from "..";
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";
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

			if(ret.thread_id) {
				let channel = client.channels.cache.get(DISCORD_COMMUNITY_FORUM_ID) as ForumChannel;
				let thread = client.channels.cache.get(ret.thread_id) as ThreadChannel;
				let newTags = channel.availableTags.filter(x => x.name === "Reviewing");
				await thread.setAppliedTags(newTags.map(x => x.id));
				await thread.send(`Request is being reviewed.`);
			}

			await interaction.reply({ embeds: [dashboard], components: [...actionRows], ephemeral: true });
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Error assigning you to a request!", 5);
            // await interaction.reply({ content: "Error assigning you to a request!", ephemeral: true });
		}
	},
};