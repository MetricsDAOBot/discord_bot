import { AttachmentBuilder, CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds, sleep } from "../utils/common";
import { DashboardBuilder } from "../utils/DashboardBuilder";
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('my_requests')
		.setDescription('Get your requests!')
		.addBooleanOption(option =>
			option.setName('as_csv')
				.setDescription('Reply as CSV?')),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		try {
			let { user } = interaction;
			let res = await axios.get<RegradeRequest[] | string>(`/regrade_requests/${user.id}/0`);

			if(typeof res.data === "string") {
				await deleteReplyInteractionAfterSeconds(interaction, res.data, 5);
				// await interaction.reply({ content: res.data, ephemeral: true });
				return;
			}

			if(res.data.length === 0) {
				await deleteReplyInteractionAfterSeconds(interaction, "You have no requests.", 5);
				// await interaction.reply({ content: "You have no requests.", ephemeral: true });
				return;
			}

			let ret = res.data[0];

			let asCsv = interaction.options.getBoolean('as_csv');

			//return csv file
			if(asCsv) {
				let allRequests = await axios.get<RegradeRequest[]>(`/regrade_requests/${user.id}`);
				let ret = '"discord_name","created_at","updated_at","regraded_at","approved_at","uuid","is_regrading","link","grader_feedback","current_score","expected_score","reason","regraded_score","regraded_reason"';
				allRequests.data.forEach(request => {
					const {discord_name, created_at, updated_at, regraded_at, approved_at, uuid, is_regrading, submission, grader_feedback, current_score, expected_score, reason, regraded_score, regraded_reason} = request;
					ret += `\n"${discord_name}","${created_at}","${updated_at}","${regraded_at ?? "Not Regraded"}","${approved_at ?? "Not Approved"}","${uuid}","${is_regrading? "Yes" : "No"}","${submission ?? "-"}","${grader_feedback ?? "-"}","${current_score ?? "-"}","${expected_score ?? "-"}","${reason ?? "-"}","${regraded_score ?? "-"}","${regraded_reason ?? "-"}"`;
				});
				let buffer = Buffer.from(ret);
				let attachment = new AttachmentBuilder(buffer, { name: 'my_requests.csv' });
				await interaction.reply({ files: [attachment]});
				await sleep(30000);
				await interaction.deleteReply();
				return;
			}

			let dashboardBuilder = new DashboardBuilder(ret, `${user.username}'s Requests`);
			dashboardBuilder
				.disableRegrader()
				.disableButtonLeft()
				.setNav("self", 0);

			// res.data.length is always 2
			// less than 2 = no more data
			if(res.data.length < 2) dashboardBuilder.disableButtonRight();
			

			let {
				dashboard,
				actionRows
			} = dashboardBuilder.buildAll();

			await interaction.reply({ embeds: [dashboard], components: [...actionRows], ephemeral: true });
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to get your requests.", 5);
			// await interaction.reply({ content: "Unable to get your requests.", ephemeral: true });
		}
	},
};