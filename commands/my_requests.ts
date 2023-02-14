import { AxiosResponse } from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import moment from "moment";
import axios from '../services/axios';
import { RegradeRequest } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('my_requests')
		.setDescription('Get your requests!'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		try {
			let { user } = interaction;
			let res = await axios.get<any, AxiosResponse<RegradeRequest[] | string>>(`/regrade_requests/${user.id}/0`);

			if(typeof res.data === "string") {
				await interaction.reply({ content: res.data, ephemeral: true });
				return;
			}

			if(res.data.length === 0) {
				await interaction.reply({ content: "You have no requests.", ephemeral: true });
				return;
			}

			let ret = res.data[0];

			// inside a command, event listener, etc.
			const dashboardEmbed = new EmbedBuilder()
								.setColor(0x0099FF)
								.setTitle(`${user.username}'s Requests`)
								.addFields(
									{ name: 'Submission', value: ret.submission ?? "null" },
									{ name: 'Current Score', value: ret.current_score?.toString() ?? 'null' },
									{ name: 'Expected Score', value: ret.expected_score?.toString() ?? 'null' },
									{ name: 'Reason', value: ret.reason ?? "null" },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Regraded Score', value: ret.regraded_score?.toString() ?? "null" },
									{ name: 'Regraded Reason', value: ret.regraded_reason ?? "null" },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Submitted At', value: moment(ret.created_at).format('YYYY-MM-DD HH:mm:ss') },
									{ name: 'Regraded At', value: moment(ret.regraded_at).format('YYYY-MM-DD HH:mm:ss') },
								);

			const button1 = new ButtonBuilder()
								.setCustomId(`nav_self_0`) // split it when processing interaction
								.setLabel('<')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(true);

			const button3 = new ButtonBuilder()
								.setCustomId(`nav_self_1`) // split it when processing interaction
								.setLabel('>')
								.setStyle(ButtonStyle.Primary)
								// res.data.length is always 2
								// less than 2 = no more data
								.setDisabled(res.data.length < 2);

			const actionRow = new ActionRowBuilder().addComponents(button1, button3) as any;

			await interaction.reply({ embeds: [dashboardEmbed], components: [actionRow], ephemeral: true });
		}

		catch (e){
			console.log(e);
			await interaction.reply({ content: "Unable to get your requests.", ephemeral: true });
		}
	},
};