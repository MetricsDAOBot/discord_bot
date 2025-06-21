import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, GatewayIntentBits, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle, ThreadChannel } from 'discord.js';
import { CustomClient } from './utils/CustomClient';
import 'dotenv/config';
import axios from './services/axios';
import { closeThread, deleteReplyInteractionAfterSeconds, isValidUUID, newThread, updateRequestDetails, updateTags, updateTagsWithMultipleRemarks } from './utils/common';
import { RegradeRequest } from './commands/types';
import { DashboardBuilder } from './utils/DashboardBuilder';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
export const DISCORD_COMMUNITY_FORUM_ID = process.env.DISCORD_COMMUNITY_FORUM_ID!;

const client = new CustomClient({intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
]});
export const PAGE_CHAR_LENGTH = 1900;

client.on(Events.MessageCreate, async function(message) {
    if (message.author.bot) return;

	if(message.content.match(/(?:^|\W)gm(?:$|\W)/) && !message.reference && !message.mentions.users.first()) {
		await message.reply({
			content: `GM to you too, <@${message.member!.id}> !`,
		});
		await message.react("🫡");
	}
});

// slash command
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const {user} = interaction;
    const interactionClient = (interaction.client as CustomClient);
	const command = interactionClient.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		let ret = await command.execute(interaction, client);
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
});

// buttons
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;
});

client.login(TOKEN);