import { ActionRowBuilder, CacheType, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds, isValidUUID } from "../utils/common";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('new_regrade_request')
		.setDescription('Adds a new regrade request!')
		.addStringOption(option =>
			option.setName('blockchain')
				.setDescription('Blockchain')
                .setRequired(true))
		.addStringOption(option =>
			option.setName('bounty_name')
				.setDescription('Name of the bounty')
                .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            let {user} = interaction;
            let res = await axios.get(`/ticket_count/${user.id}`);

			// if new regrade request is added, it's gonna be a uuid
			if(res.data === 0) {
				await deleteReplyInteractionAfterSeconds(interaction, "You're out of Golden Tickets.", 5);
				return;
			}

			let blockchain = interaction.options.getString('blockchain');
			let bounty_name = interaction.options.getString('bounty_name');

			if(!blockchain) {
				await deleteReplyInteractionAfterSeconds(interaction, "Blockchain not set.", 5);
				return;
			}
			if(!bounty_name) {
				await deleteReplyInteractionAfterSeconds(interaction, "Bounty name not set.", 5);
				return;
			}

			// After creating a new regrade request, ask user to update it
			// Create the modal
			const modal = new ModalBuilder()
					.setCustomId('new_regrade_request')
					.setTitle('New Regrade Request');

			// Add components to modal
			// Create the text input components
			const submissionInput = new TextInputBuilder()
				.setCustomId('submission')
				// The label is the prompt the user sees for this input
				.setLabel("Submission Link")
				// Short means only a single line of text
				.setStyle(TextInputStyle.Short)
				.setRequired(true);

			const currentScoreInput = new TextInputBuilder()
				.setCustomId('current_score')
				// The label is the prompt the user sees for this input
				.setLabel("Current Score")
				// Short means only a single line of text
				.setStyle(TextInputStyle.Short)
				.setRequired(true);

			const expectedScoreInput = new TextInputBuilder()
				.setCustomId('expected_score')
				// The label is the prompt the user sees for this input
				.setLabel("Expected Score")
				// Short means only a single line of text
				.setStyle(TextInputStyle.Short)
				.setRequired(false);

			const reasonInput = new TextInputBuilder()
				.setCustomId('reason')
				// The label is the prompt the user sees for this input
				.setLabel("Reason for Expected Score")
				// Short means only a single line of text
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true);

			const graderFeedbackInput = new TextInputBuilder()
				.setCustomId('grader_feedback')
				.setLabel("Grader Feedback")
				// Paragraph means multiple lines of text.
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(false);

			// An action row only holds one text input,
			// so you need one action row per text input.
			const actionRow1 = new ActionRowBuilder().addComponents(submissionInput) as any; // have to do this if not it'll cause error
			const actionRow2 = new ActionRowBuilder().addComponents(currentScoreInput) as any; // have to do this if not it'll cause error
			const actionRow3 = new ActionRowBuilder().addComponents(expectedScoreInput) as any; // have to do this if not it'll cause error
			const actionRow4 = new ActionRowBuilder().addComponents(reasonInput) as any; // have to do this if not it'll cause error
			const actionRow5 = new ActionRowBuilder().addComponents(graderFeedbackInput) as any; // have to do this if not it'll cause error

			// Add inputs to the modal
			modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4, actionRow5);

			// Show the modal to the user
			await interaction.showModal(modal);
			return { blockchain, bounty_name };
        }

        catch (e){
            console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction, "Error adding new request!", 5);
            // await interaction.reply({ content: "Error adding new request!", ephemeral: true });
        }
	},
};