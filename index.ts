import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, GatewayIntentBits, Message, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle, ThreadChannel } from 'discord.js';
import { CustomClient } from './utils/CustomClient';
import 'dotenv/config';
import axios from './services/axios';
import { closeThread, deleteReplyInteractionAfterSeconds, isValidUUID, newThread, sendMessageInParts, updateRequestDetails, updateTags, updateTagsWithMultipleRemarks } from './utils/common';
import { RegradeRequest } from './commands/types';
import { DashboardBuilder } from './utils/DashboardBuilder';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
export const DISCORD_COMMUNITY_FORUM_ID = process.env.DISCORD_COMMUNITY_FORUM_ID!;

let hasCustomed: {[key:string]: boolean} = {};

const client = new CustomClient({intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
]});
export const PAGE_CHAR_LENGTH = 1900;
let hasSpoken = false;
client.on(Events.MessageCreate, async function(message) {
    if (message.author.bot) return;
	if(!hasSpoken && message.content === "say sorry") {
		hasSpoken = true;
		await message.channel.send(`Sorry <@332782904247713794>, please don't rage quit gms.`)
	}

	let gmMatch = message.content.match(/(?:^|\W)(gm)+(?:$|\W)/i);
	if(gmMatch && !message.reference && !message.mentions.users.first()) {
		if(!hasCustomed[message.member!.id]) {
			// tlm
			// if(message.member!.id === "332782904247713794") {
			// 	await message.reply({
			// 		content: `Why are you still in Flipside's TG?`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// // ant
			// if(message.member!.id === "71946189913726976") {
			// 	await message.reply({
			// 		content: `I'm spreading the words for AntVentures2.0 for you my master.`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// // marqu
			// if(message.member!.id === "814154637279232010") {
			// 	await message.reply({
			// 		content: `baaaaaaaaaaaaaaa`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// //sam
			// if(message.member!.id === "91003142916800512") {
			// 	await message.reply({
			// 		content: `Hard mode wordle only please.`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// //mary
			// if(message.member!.id === "973340973667090533") {
			// 	await message.reply({
			// 		content: `... is a pig.`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// //ren
			// if(message.member!.id === "365855421896065026") {
			// 	await message.reply({
			// 		content: `guess we're back to hyperliquid`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// //ramahar
			// if(message.member!.id === "695797033218605118") {
			// 	await message.reply({
			// 		content: `Kim Jung Un..`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// //piper
			// if(message.member!.id === "399258000314990592") {
			// 	await message.reply({
			// 		content: `I'm running out of random greetings D:`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// //playwo
			// if(message.member!.id === "269131044123312129") {
			// 	await message.reply({
			// 		content: `AntVentures2.0 awaits`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// //sandesh
			// if(message.member!.id === "888479361949380658") {
			// 	await message.reply({
			// 		content: `${gmMatch[0]} to you too, how's job hunting?`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			// //pine
			// if(message.member!.id === "703216589134364764") {
			// 	await message.reply({
			// 		content: `Ohayo gozaimasu!`,
			// 	});
			// 	await message.react("🫡");
			// 	return;
			// }

			//brian
			if(message.member!.id === "520810830976122905") {
				await message.reply({
					content: `${gmMatch[0]} to you too, destroyer of the pike population.`,
				});
				await message.react("🫡");
				return;
			}

			// wolf
			if(message.member!.id === "449549881699205140") {
				await message.reply({
					content: `Hmm...this page doesn't exist. Try searching for something else.`,
				});
				return;
			}

			//gj
			if(message.member!.id === "828115529394815037") {
				await message.reply({
					content: `wen payment`,
				});
				await message.react("🫡");
				return;
			}

	// 		// fish
	// 		if(message.member!.id === "356937656900517899") {
	// 			await message.reply({
	// 				content: `Hey there! 🐟✈️

	// Just flying by to say **"You're fintastic!"** — like a flying fish who forgot it’s not a bird but is *still totally committed to the bit.* 😄💨

	// Hope your day takes off... but with *less flopping*!

	// idk if it's funny but AI wrote this shit`,
	// 			});
	// 			await message.react("🫡");
	// 			return;
	// 		}
			
		}

		hasCustomed[message.member!.id] = true;

		await message.reply({
			content: `Master says AI soon tm. In the meantime, ${gmMatch[0]} to you too, <@${message.member!.id}> !`,
		});
		await message.react("🫡");
	}

	if(message.content === "is bak kut teh pepper soup?") {
		let statements = [
			"Bak kut teh is not pepper soup.",
			"Don't confuse bak kut teh with pepper soup.",
			"Bak kut teh has its own identity—it's not pepper soup.",
			"Just to clarify: bak kut teh is not pepper soup.",
			"Pepper soup is not bak kut teh, and bak kut teh is not pepper soup.",
			"They're two different dishes entirely.",
			"One word: different.",
			"Bak kut teh is herbal, not just peppery.",
			"Calling bak kut teh pepper soup is like calling ramen chicken broth.",
			"Nope, bak kut teh isn't pepper soup.",
			"That herbal aroma? Not from pepper.",
			"It's more than just pepper—it's a culture.",
			"Pepper soup lacks bak kut teh's herbal complexity.",
			"Herbal pork soup is not pepper explosion.",
			"Try both, but don't mix them up.",
			"Bak kut teh isn't your average spicy broth.",
			"Pepper is just one note; bak kut teh is a whole symphony.",
			"Pepper soup doesn't steep in Chinese herbs like bak kut teh.",
			"There are levels to this soup game.",
			"No, seriously, they're not the same.",
			"One is rooted in Hokkien and Teochew traditions.",
			"Bak kut teh is about balance, not just spice.",
			"Saying they're the same is culinary slander.",
			"They might both be soupy, but that's where the similarities end.",
			"Do you call pho beef water? No? Then don't do this.",
			"Pepper alone does not a bak kut teh make.",
			"Let's respect the broth.",
			"Bak kut teh is a heritage dish.",
			"Not all soups are created equal.",
			"There's no dang gui in pepper soup.",
			"Pepper soup doesn't come with youtiao.",
			"Don't insult bak kut teh like that.",
			"Imagine calling pizza flatbread with ketchup—that's how this feels.",
			"Spicy does not mean bak kut teh.",
			"Bak kut teh is a medicinal meal, not heat.",
			"Pepper soup is straightforward. Bak kut teh is a journey.",
			"You can't reduce bak kut teh to pepper.",
			"Not even close.",
			"It's soup, but it's not that soup.",
			"Pepper soup is a different cuisine altogether.",
			"Don't oversimplify bak kut teh.",
			"It's a broth of tradition, not just spice.",
			"Teochew or Hokkien versions vary—but neither is pepper soup.",
			"There's no bak kut teh in a peppercorn shaker.",
			"Bak kut teh uses dang shen, not just pepper.",
			"One warms you with spice; the other heals you with herbs.",
			"Pepper soup didn't come from Klang.",
			"You wouldn't say sushi is just raw fish, would you?",
			"Don't disrespect the pig rib like that.",
			"Bak kut teh is layered.",
			"It's herbal, not pepper-loaded.",
			"Pepper soup can't stand up to bak kut teh's depth.",
			"Even your grandma would disagree.",
			"It's not just hot—it's wholesome.",
			"That's like calling espresso bitter water.",
			"Pepper soup is bold. Bak kut teh is wise.",
			"Not all that is hot is pepper soup.",
			"Herbs matter.",
			"You need more than pepper to make bak kut teh.",
			"Soup is not soup.",
			"Respect the soup lineage.",
			"Just because it's in a bowl doesn't mean it's the same.",
			"Bak kut teh is a culture, not just a recipe.",
			"The roots are different.",
			"It's like calling katsu curry gravy rice.",
			"Pepper soup doesn't have goji berries.",
			"Bak kut teh is slow-cooked mastery.",
			"Pepper soup is spice; bak kut teh is soul.",
			"There's a reason it's called meat bone tea.",
			"Bak kut teh nourishes. Pepper soup burns.",
			"One simmers with love; the other stings.",
			"Pepper soup is fire; bak kut teh is warmth.",
			"They don't even smell the same.",
			"Bak kut teh has layers.",
			"It's soup—but it's not that soup.",
			"Would you call laksa noodle curry? No.",
			"One hugs you, one punches you.",
			"Don't mix traditions.",
			"Pepper soup is about heat. Bak kut teh is about healing.",
			"Pepper soup wakes you up. Bak kut teh comforts you.",
			"They're on different continents, both literally and taste-wise.",
			"Bak kut teh is health in a bowl.",
			"You wouldn't say congee is oatmeal.",
			"Don't reduce it to just peppery.",
			"That's like saying stew is just thick soup.",
			"It's herbal, not peppery by design.",
			"Bak kut teh feeds your chi.",
			"It's not a spicy broth—it's a cultural heirloom.",
			"It's medicine that tastes amazing.",
			"No chili required.",
			"Bak kut teh is Malaysia; Singapore can only hope for tasty bak kut teh.",
			"You'll never confuse them after one taste.",
			"Bak kut teh doesn't need pepper to shine.",
			"It's not about the burn—it's about the brew.",
			"Calling it pepper soup is like calling nasi lemak rice with stuff.",
			"Bottom line: Bak kut teh is not pepper soup."
		];

		let randomStatement = Math.floor((Math.random() - 0.000001) * 101);
		if(randomStatement < 0) {
			randomStatement = 0;
		}

		if(randomStatement > statements.length - 1) {
			randomStatement = statements.length - 1;
		}

		await message.reply({ content: statements[randomStatement] });
	}

	if(message.content === "what is the colour of hokkien mee?") {
		await message.reply({ content: "black" });
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