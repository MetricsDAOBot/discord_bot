import { AxiosResponse } from "axios";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import moment from "moment";
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds, sleep } from "../utils/common";
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
			let res = await axios.get<any, AxiosResponse<RegradeRequest[] | string>>(`/regrade_requests/${user.id}/0`);

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
				let allRequests = await axios.get<any, AxiosResponse<RegradeRequest[]>>(`/regrade_requests/${user.id}`);
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

			// inside a command, event listener, etc.
			const dashboardEmbed = new EmbedBuilder()
								.setColor(0x0099FF)
								.setTitle(`${user.username}'s Requests`)
								.addFields(
									{ name: 'Submission', value: ret.submission? ret.submission : 'N/A' },
									{ name: 'Current Score', value: ret.current_score? ret.current_score.toString() : 'N/A' },
									{ name: 'Expected Score', value: ret.expected_score? ret.expected_score.toString() : 'N/A' },
									//{ name: 'Reason', value: ret.reason ?? 'N/A' },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Regraded Score', value: ret.regraded_score? ret.regraded_score.toString() : "Not Regraded Yet" },
									//{ name: 'Regraded Reason', value: ret.regraded_reason ?? "Not Regraded Yet" },
									{ name: '\u200B', value: '\u200B' },
								)
								.addFields([
									{ name: 'Submitted At', value: moment(ret.created_at).format('YYYY-MM-DD HH:mm:ss'), inline: true },
									{ name: 'Regraded At', value: ret.regraded_at? moment(ret.regraded_at).format('YYYY-MM-DD HH:mm:ss') : "Not Regraded Yet", inline: true },
									{ name: 'Approved At', value: ret.approved_at? moment(ret.approved_at).format('YYYY-MM-DD HH:mm:ss') : "Not Approved Yet", inline: true },
								]);

			const button1 = new ButtonBuilder()
								.setCustomId(`nav_self_0`) // split it when processing interaction
								.setLabel('<')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(true);

			const buttonReason = new ButtonBuilder()
								.setCustomId(`reasonregraded_-1_${ret.uuid}`) // split it when processing interaction
								.setLabel('Regrader Feedback')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!ret.regraded_reason);

			const button3 = new ButtonBuilder()
								.setCustomId(`nav_self_1`) // split it when processing interaction
								.setLabel('>')
								.setStyle(ButtonStyle.Primary)
								// res.data.length is always 2
								// less than 2 = no more data
								.setDisabled(res.data.length < 2);

			const actionRow = new ActionRowBuilder().addComponents(button1, buttonReason, button3) as any;

			await interaction.reply({ embeds: [dashboardEmbed], components: [actionRow], ephemeral: true });
		}

		catch (e){
			console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Unable to get your requests.", 5);
			// await interaction.reply({ content: "Unable to get your requests.", ephemeral: true });
		}
	},
};