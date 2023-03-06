import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, GatewayIntentBits, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js';
import { CustomClient } from './utils/CustomClient';
import 'dotenv/config';
import axios from './services/axios';
import { deleteReplyInteractionAfterSeconds, isValidUUID } from './utils/common';
import moment from 'moment';
import { AxiosResponse } from 'axios';
import { RegradeRequest } from './commands/types';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const client = new CustomClient({intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
]});
const PAGE_CHAR_LENGTH = 1900;

client.on(Events.MessageCreate, function(message) {
    if (message.author.bot) return;
});

// slash command
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

    const interactionClient = (interaction.client as CustomClient);
	const command = interactionClient.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await deleteReplyInteractionAfterSeconds(interaction, 'There was an error while executing this command!', 5);
		// await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// modals
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;

	let { user } = interaction;

	//new requests
	if (interaction.customId === 'new_regrade_request') {
		const submission = (interaction.fields.getField('submission') as any).value;
		const current_score = (interaction.fields.getField('current_score') as any).value;
		const expected_score = (interaction.fields.getField('expected_score') as any).value;
		const grader_feedback = (interaction.fields.getField('grader_feedback') as any).value;
		const reason = (interaction.fields.getField('reason') as any).value;

		let res = await axios.post('/regrade_request', {
			discord_id: user.id,
			discord_name: `${user.username}#${user.discriminator}`,
			submission,
			current_score,
			expected_score,
			grader_feedback,
			reason
		});

		if(!isValidUUID(res.data)) {
			await deleteReplyInteractionAfterSeconds(interaction, res.data, 5);
			// await interaction.reply({ content: res.data, ephemeral: true });
			return;
		}

		if(interaction?.channel?.id) {
			await (client.channels.cache.get(interaction.channel.id) as TextChannel).send(`New request received from ${user.username}.`);
		}

		await deleteReplyInteractionAfterSeconds(interaction, 'Your submission was received successfully!', 5);
		// await interaction.reply({ content: 'Your submission was received successfully!', ephemeral: true });
	}

	else if (interaction.customId.includes('review_')) {
		let uuid = interaction.customId.replace("review_", '');

		if(!isValidUUID(uuid)) {
			await deleteReplyInteractionAfterSeconds(interaction, "Invalid submission", 5000);
			// await interaction.reply({ content: "Invalid submission", ephemeral: true });
			return;
		}

		const regraded_score = (interaction.fields.getField('regraded_score') as any).value;
		const regraded_reason = (interaction.fields.getField('regraded_reason') as any).value;

		let res = await axios.patch('/regrade_request_by_grader', {
			uuid,
			regraded_by_id: user.id,
			regraded_score,
			regraded_reason,
		});

		if(res.data !== "Updated") {
			await deleteReplyInteractionAfterSeconds(interaction, res.data, 5);
			// await interaction.reply({ content: res.data, ephemeral: true });
			return;
		}

		let request = await axios.get<RegradeRequest[]>(`/regrade_request/${uuid}`);

		if(interaction?.channel?.id && request.data[0]?.uuid) {
			await (client.channels.cache.get(interaction.channel.id) as TextChannel).send(`${request.data[0].submission} has been reviewed.`);
		}

		await deleteReplyInteractionAfterSeconds(interaction, 'Your review was received successfully!', 5);
		//await interaction.reply({ content: 'Your review was received successfully!', ephemeral: true });
	}
});

// buttons
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;
	if (interaction.customId.includes('regrade_')) {
		let uuid = interaction.customId.replace('regrade_', '');

		if(!isValidUUID(uuid)) {
			await deleteReplyInteractionAfterSeconds(interaction, "Invalid submission", 5);
			// await interaction.reply({ content: "Invalid submission", ephemeral: true });
			return;
		}

		// Create the modal
		const modal = new ModalBuilder()
						.setCustomId(`review_${uuid}`)
						.setTitle('Review Request');

		// Add components to modal

		// let { discord_id, discord_name, submission, grader_feedback, expected_score, current_score, reason }
		// Create the text input components
		const regradeScoreInput = new TextInputBuilder()
			.setCustomId('regraded_score')
			// The label is the prompt the user sees for this input
			.setLabel("Regrade Score")
			// Short means only a single line of text
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const regradeReasonInput = new TextInputBuilder()
			.setCustomId('regraded_reason')
			// The label is the prompt the user sees for this input
			.setLabel("Request Reason")
			// Short means only a single line of text
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const actionRow1 = new ActionRowBuilder().addComponents(regradeScoreInput) as any; // have to do this if not it'll cause error
		const actionRow2 = new ActionRowBuilder().addComponents(regradeReasonInput) as any; // have to do this if not it'll cause error

		// Add inputs to the modal
		modal.addComponents(actionRow1, actionRow2);

		// Show the modal to the user
		await interaction.showModal(modal);
	}

	// pending approvals
	else if (interaction.customId.includes('nav_approval_') || interaction.customId.includes('approve_') || interaction.customId.includes('reject_')) {
		try {
			let { user } = interaction;
			let page = interaction.customId.includes('nav_approval_')? 
						parseInt(interaction.customId.replace('nav_approval_', '')) : 
						parseInt(interaction.customId.split('_')[1]);

			let approveButtonEnabled = true;
			let approveButtonText = "Approve";
			let isApprovalOperation = false;

			// approve the review
			if(interaction.customId.includes('approve_')) {
				let uuid = interaction.customId.split('_')[2];

				let res = await axios.post<any, AxiosResponse<string>>('/approve_regrade_request', {
					discord_id: user.id,
					discord_name: `${user.username}#${user.discriminator}`,
					uuid,
				});

				if(res.data !== "Approved") {
					await deleteReplyInteractionAfterSeconds(interaction, res.data, 5);
					// await interaction.reply({ content: res.data, ephemeral: true });
					return;
				}

				else {
					let request = await axios.get<RegradeRequest[]>(`/regrade_request/${uuid}`);

					if(interaction?.channel?.id && request.data[0]?.uuid) {
						await (client.channels.cache.get(interaction.channel.id) as TextChannel).send(`${request.data[0].submission}'s regraded score has been approved.\n\`\`\`Old Score: ${request.data[0].current_score}\nNew Score: ${request.data[0].regraded_score}\`\`\``);
					}

					//decrease one page to not overflow
					page--;
					page = page < 0? 0 : page;
					isApprovalOperation = true;
				}
			}

			// reject the review
			if(interaction.customId.includes('reject_')) {
				let uuid = interaction.customId.split('_')[2];
				console.log('rejecting');
				let res = await axios.post<any, AxiosResponse<string>>('/reject_regrade_request', {
					discord_id: user.id,
					discord_name: `${user.username}#${user.discriminator}`,
					uuid,
				});

				if(res.data !== "Rejected") {
					await deleteReplyInteractionAfterSeconds(interaction, res.data, 5);
					// await interaction.reply({ content: res.data, ephemeral: true });
					return;
				}

				else {
					let request = await axios.get<RegradeRequest[]>(`/regrade_request/${uuid}`);

					if(interaction?.channel?.id && request.data[0]?.uuid) {
						await (client.channels.cache.get(interaction.channel.id) as TextChannel).send(`${request.data[0].submission}'s regraded score has been rejected.`);
					}

					//decrease one page to not overflow
					page--;
					page = page < 0? 0 : page;
					isApprovalOperation = true;
				}
			}

			let res = await axios.post<any, AxiosResponse<RegradeRequest[] | string>>('/pending_approvals', {
				discord_id: user.id,
				page,
			});

			if(typeof res.data === "string") {
				await deleteReplyInteractionAfterSeconds(interaction, res.data, 5);
				// await interaction.reply({ content: res.data, ephemeral: true });
				return;
			}

			const button1 = new ButtonBuilder()
								.setCustomId(`nav_approval_${page - 1}`) // split it when processing interaction
								.setLabel('<')
								.setStyle(ButtonStyle.Primary)
								// if page - 1 is less than 0 then it is in the lower limit
								.setDisabled(page - 1 < 0);

			let button3 = new ButtonBuilder()
								.setCustomId(`nav_approval_${page + 1}`) // split it when processing interaction
								.setLabel('>')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(true);

			let actionRow = new ActionRowBuilder().addComponents(button1, button3) as any;


			if(res.data.length === 0) {
				if(isApprovalOperation) {
					await interaction.update({ content: "No more pending approvals.", embeds: [], components: [] });
				}

				else {
					await deleteReplyInteractionAfterSeconds(interaction, "No pending approvals.", 5);
					// await interaction.reply({ content: "No pending approvals.", ephemeral: true });
				}
				return;
			}

			let ret = res.data[0];

			const button2 = new ButtonBuilder()
								.setCustomId(`approve_${page}_${ret.uuid}`) // split it when processing interaction
								.setLabel(approveButtonText)
								.setStyle(ButtonStyle.Success)
								.setDisabled(!approveButtonEnabled);

			const button4 = new ButtonBuilder()
								.setCustomId(`reject_${page}_${ret.uuid}`) // split it when processing interaction
								.setLabel(approveButtonText)
								.setStyle(ButtonStyle.Danger)
								.setDisabled(!approveButtonEnabled);

			// the data size is always 2
			// if it's less than 2, it has no more new approvals
			button3.setDisabled(res.data.length < 2);

			// inside a command, event listener, etc.
			const dashboardEmbed = new EmbedBuilder()
								.setColor(0x0099FF)
								.setTitle("Pending Approvals")
								.setDescription('Click the approve button if you\'re satisfied.')
								.addFields(
									{ name: 'Submission', value: ret.submission? ret.submission : 'N/A' },
									{ name: 'Current Score', value: ret.current_score? ret.current_score.toString() : 'N/A' },
									{ name: 'Expected Score', value: ret.expected_score? ret.expected_score.toString() : 'N/A' },
									//{ name: 'Reason', value: ret.reason ?? 'N/A' },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Regraded Score', value: ret.regraded_score? ret.regraded_score.toString() : 'N/A' },
									//{ name: 'Regraded Reason', value: ret.regraded_reason ?? 'N/A' },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Submitted By', value: ret.discord_name, inline: true },
									{ name: 'Submitted At', value: moment(ret.created_at).format('YYYY-MM-DD HH:mm:ss'), inline: true },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Regraded By', value: ret.regraded_by? ret.regraded_by : 'N/A', inline: true },
									{ name: 'Regraded At', value: moment(ret.regraded_at).format('YYYY-MM-DD HH:mm:ss'), inline: true },
								);
			const buttonRegradeReason = new ButtonBuilder()
								.setCustomId(`reason_${ret.uuid}`) // split it when processing interaction
								.setLabel('Regrader Feedback')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!ret.reason);

			const buttonReason = new ButtonBuilder()
								.setCustomId(`reasonregraded_${ret.uuid}`) // split it when processing interaction
								.setLabel('Regrader Feedback')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!ret.regraded_reason);

			const buttonFeedback = new ButtonBuilder()
								.setCustomId(`feedback_${ret.uuid}`) // split it when processing interaction
								.setLabel('Grader Feedback')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!ret.grader_feedback);

			actionRow = new ActionRowBuilder().addComponents(button1, button2, button4, buttonRegradeReason, buttonReason, buttonFeedback, button3) as any;
			await interaction.update({ embeds: [dashboardEmbed], components: [actionRow] });
		}

		catch (e){
			console.log(e);
			await deleteReplyInteractionAfterSeconds(interaction, "Unable to get pending approvals.", 5);
			// await interaction.reply({ content: "Unable to get pending approvals.", ephemeral: true });
		}
	}

	// when requesting for "my requests"
	else if (interaction.customId.includes('nav_self_')) {
		try {
			let { user } = interaction;
			let page = parseInt(interaction.customId.replace('nav_self_', ''));
			let res = await axios.get<any, AxiosResponse<RegradeRequest[] | string>>(`/regrade_requests/${user.id}/${page}`);

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

			let description = 'Pending Review';
			if(ret.approved_at) {
				description = 'Approved';
			}

			else if(ret.regraded_at) {
				description = 'Pending Approval';
			}

			else if(ret.is_regrading) {
				description = 'Review in Progress';
			}

			// inside a command, event listener, etc.
			const dashboardEmbed = new EmbedBuilder()
								.setColor(0x0099FF)
								.setTitle(`${user.username}'s Requests`)
								.setDescription(description)
								.addFields(
									{ name: 'Submission', value: ret.submission? ret.submission : 'N/A' },
									{ name: 'Current Score', value: ret.current_score? ret.current_score.toString() : 'N/A' },
									{ name: 'Expected Score', value: ret.expected_score? ret.expected_score.toString() : 'N/A' },
									//{ name: 'Reason', value: ret.reason ?? 'N/A' },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Regraded Score', value: ret.regraded_score? ret.regraded_score.toString() : "Not Regraded Yet" },
									//{ name: 'Regraded Reason', value: ret.regraded_reason ?? "Not Regraded Yet" },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Submitted At', value: moment(ret.created_at).format('YYYY-MM-DD HH:mm:ss'), inline: true },
									{ name: 'Regraded At', value: ret.regraded_at? moment(ret.regraded_at).format('YYYY-MM-DD HH:mm:ss') : "Not Regraded Yet", inline: true },
									{ name: 'Approved At', value: ret.regraded_at? moment(ret.approved_at).format('YYYY-MM-DD HH:mm:ss') : "Not Approved Yet", inline: true },
								);

			const button1 = new ButtonBuilder()
								.setCustomId(`nav_self_${page - 1}`) // split it when processing interaction
								.setLabel('<')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(page - 1 < 0);

			const button3 = new ButtonBuilder()
								.setCustomId(`nav_self_${page + 1}`) // split it when processing interaction
								.setLabel('>')
								.setStyle(ButtonStyle.Primary)
								// res.data.length is always 2
								// less than 2 = no more data
								.setDisabled(res.data.length < 2);

			const buttonReason = new ButtonBuilder()
								.setCustomId(`reasonregraded_${ret.uuid}`) // split it when processing interaction
								.setLabel('Regrader Feedback')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(!ret.regraded_reason);

			const actionRow = new ActionRowBuilder().addComponents(button1, buttonReason, button3) as any;

			await interaction.update({  embeds: [dashboardEmbed], components: [actionRow] });
		}

		catch (e){
			console.log(e);
			await deleteReplyInteractionAfterSeconds(interaction, "Unable to get pending approvals.", 5);
			//await interaction.reply({ content: "Unable to get pending approvals.", ephemeral: true });
		}
	}

	// when requesting for feedback 
	else if (interaction.customId.includes('feedback_') || interaction.customId.includes('reason_') || interaction.customId.includes('reasonregraded_')) {
		let [type, pageStr, uuid] = interaction.customId.split("_");

		let request = await axios.get<RegradeRequest[]>(`/regrade_request/${uuid}`);
		let page = parseInt(pageStr);
		page = page < 0? 0 : page;

		if(!request.data[0]?.uuid) {
			await deleteReplyInteractionAfterSeconds(interaction, "Unable to get request.", 5);
			return;
		}

		let ret = request.data[0];

		let replyMessage = '';
		let oriStringLength = 0;
		let currentPageStart = PAGE_CHAR_LENGTH * page;
		let wordArray: string[] = [];
		switch(type) {
			case "feedback":
				wordArray = ret.grader_feedback?.split(" ") ?? [];
				oriStringLength = ret.grader_feedback?.length ?? 0;
				break;
			case "reason":
				wordArray = ret.reason?.split(" ") ?? [];
				oriStringLength = ret.reason?.length ?? 0;
				break;
			case "reasonregraded":
				wordArray = ret.regraded_reason?.split(" ") ?? [];
				oriStringLength = ret.regraded_reason?.length ?? 0;
				break;
			default:
				break;
		}

		let currentStringIndex = 0;
		let wordIndex = 0;

		for(const word of wordArray) {
			wordIndex++;
			currentStringIndex += word.length + 1; // + 1 cause we need to include one space bar

			// search for the previous end and continue from there
			if(currentStringIndex < currentPageStart) {
				continue;
			}

			// max page length reached
			if(replyMessage.length + word.length + 1 > PAGE_CHAR_LENGTH) {
				break;
			}

			replyMessage += `${word} `;
		}

		replyMessage = replyMessage.replace(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g, '<$1>');
		replyMessage = replyMessage.trim();

		const button1 = new ButtonBuilder()
							.setCustomId(`${type}_${page - 1}_${ret.uuid}`) // split it when processing interaction
							.setLabel('<')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(page === 0);

		const button2 = new ButtonBuilder()
							.setCustomId(`${type}_${page + 1}_${ret.uuid}`) // split it when processing interaction
							.setLabel('>')
							.setStyle(ButtonStyle.Secondary)
							// if word array was exhausted
							.setDisabled(wordIndex === wordArray.length);

		const actionRow = new ActionRowBuilder().addComponents(button1, button2) as any;

		if(pageStr === '-1') {
			await interaction.reply({ content: replyMessage, components: oriStringLength > PAGE_CHAR_LENGTH? [actionRow] : [], ephemeral: true });
			return;
		}

		await interaction.update({ content: replyMessage, components: oriStringLength > PAGE_CHAR_LENGTH? [actionRow] : [] });
	}
});

client.login(TOKEN);