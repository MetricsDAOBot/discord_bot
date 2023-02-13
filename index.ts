import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { CustomClient } from './utils/CustomClient';
import 'dotenv/config';
import axios from './services/axios';
import { isValidUUID } from './utils/common';
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

client.on("messageCreate", function(message) {
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
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
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
			await interaction.reply({ content: res.data, ephemeral: true });
			return;
		}

		await interaction.reply({ content: 'Your submission was received successfully!', ephemeral: true });
	}

	else if (interaction.customId.includes('review_')) {
		let uuid = interaction.customId.replace("review_", '');

		if(!isValidUUID(uuid)) {
			await interaction.reply({ content: "Invalid submission", ephemeral: true });
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
			await interaction.reply({ content: res.data, ephemeral: true });
			return;
		}

		await interaction.reply({ content: 'Your review was received successfully!', ephemeral: true });
	}
});

// buttons
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;
	if (interaction.customId.includes('regrade_')) {
		let uuid = interaction.customId.replace('regrade_', '');

		if(!isValidUUID(uuid)) {
			await interaction.reply({ content: "Invalid submission", ephemeral: true });
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
			.setLabel("Regrade Reason")
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

	else if (interaction.customId.includes('nav_approval_') || interaction.customId.includes('approve_')) {
		try {
			let { user } = interaction;
			let page = interaction.customId.includes('nav_approval_')? 
						parseInt(interaction.customId.replace('nav_approval_', '')) : 
						parseInt(interaction.customId.split('_')[1]);

			let approveButtonEnabled = true;
			let approveButtonText = "Approve";
			let isApprove = false;

			// approve the review
			if(interaction.customId.includes('approve_')) {
				let uuid = interaction.customId.split('_')[2];

				let res = await axios.post<any, AxiosResponse<string>>('/approve_regrade_request', {
					discord_id: user.id,
					discord_name: `${user.username}#${user.discriminator}`,
					uuid,
				});

				if(res.data !== "Approved") {
					await interaction.reply({ content: res.data, ephemeral: true });
					return;
				}

				else {
					//decrease one page to not overflow
					page--;
					page = page < 0? 0 : page;
					isApprove = true;
				}
			}

			let res = await axios.post<any, AxiosResponse<RegradeRequest[] | string>>('/pending_approvals', {
				discord_id: user.id,
				page,
			});

			if(typeof res.data === "string") {
				await interaction.reply({ content: res.data, ephemeral: true });
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
				if(isApprove) {
					await interaction.update({ content: "No more pending approvals.", embeds: [], components: [] });
				}

				else {
					await interaction.reply({ content: "No pending approvals.", ephemeral: true });
				}
				return;
			}

			let ret = res.data[0];

			const button2 = new ButtonBuilder()
								.setCustomId(`approve_${page}_${ret.uuid}`) // split it when processing interaction
								.setLabel(approveButtonText)
								.setStyle(ButtonStyle.Success)
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
									{ name: 'Submission', value: ret.submission ?? "null" },
									{ name: 'Current Score', value: ret.current_score?.toString() ?? 'null' },
									{ name: 'Expected Score', value: ret.expected_score?.toString() ?? 'null' },
									{ name: 'Reason', value: ret.reason ?? "null" },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Regraded Score', value: ret.regraded_score?.toString() ?? "null" },
									{ name: 'Regraded Reason', value: ret.regraded_reason ?? "null" },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Submitted By', value: ret.discord_name },
									{ name: 'Submitted At', value: moment(ret.created_at).format('YYYY-MM-DD HH:mm:ss') },
									{ name: '\u200B', value: '\u200B' },
									{ name: 'Regraded By', value: ret.regraded_by ?? "null" },
									{ name: 'Regraded At', value: moment(ret.regraded_at).format('YYYY-MM-DD HH:mm:ss') },
								);

			actionRow = new ActionRowBuilder().addComponents(button1, button2, button3) as any;
			await interaction.update({ embeds: [dashboardEmbed], components: [actionRow] });
		}

		catch (e){
			console.log(e);
			await interaction.reply({ content: "Unable to get pending approvals.", ephemeral: true });
		}
	}
});

client.login(TOKEN);