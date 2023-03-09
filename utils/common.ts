import { ButtonInteraction, ChatInputCommandInteraction, ForumChannel, ModalSubmitInteraction, TextChannel, ThreadChannel } from 'discord.js';
import 'dotenv/config';
import { DISCORD_COMMUNITY_FORUM_ID, PAGE_CHAR_LENGTH } from '..';
import { RegradeRequest } from '../commands/types';
import { CustomClient } from './CustomClient';
import { DashboardBuilder } from './DashboardBuilder';
import axios from '../services/axios';

// check if the uuid is valid as sanitization
export const isValidUUID = (uuid: string) => {
    return (uuid.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)?.length ?? 0) > 0;
}

export function sleep(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    });
}


/**
 * Deletes the reply after a few seconds
 * 
 * @param interaction 
 * @param content 
 * @param s 
 */
export async function deleteReplyInteractionAfterSeconds(interaction: ChatInputCommandInteraction | ModalSubmitInteraction | ButtonInteraction, content: string, s: number, type: "update" | "reply" = "reply") {
    if(type === "reply") {
        await interaction.reply({ content, ephemeral: true });
    }

    else {
        await interaction.editReply({ content });
    }

    await sleep(s * 1000);
    await interaction.deleteReply();
}

export const sendMessageInParts = async(thread: TextChannel | ThreadChannel, title: string, message: string) => {
    message = message.replace(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g, '<$1>');
    
    if(title) {
        await thread.send(`__**${title}**__`);
    }

    if(message.length <= PAGE_CHAR_LENGTH) {
        await thread.send(`\n${message}`);
        return;
    }

    let replyMessage = '';
    let wordArray: string[] = [];
    wordArray = message.split(" ");
    let page = 1;

    for(const word of wordArray) {
        replyMessage += `${word} `;

        // max page length reached
        if(replyMessage.length + word.length + 1 > PAGE_CHAR_LENGTH) {
            replyMessage.trim();
            // send once page length reached
            await thread.send(`\n${page}\\\n ${replyMessage}`);

            // clear and increase
            replyMessage = "";
            page++
        }
    }

    // leftovers
    if(replyMessage.length > 0) {
        await thread.send(`\n${page}\\ ${replyMessage}`);
    }

    return;
}

export const updateRequestDetails = async(client: CustomClient, request: RegradeRequest) => {
    let thread = await client.channels.fetch(request.thread_id!) as ThreadChannel;

    let dashboardBuilder = new DashboardBuilder(request, "Request Details");
    dashboardBuilder
        .disableRegrader()
        .disableThread();

    if(!request.approved_at) dashboardBuilder.disablePaymentStatus();
    
    let dashboard = dashboardBuilder.buildDashboard();
    let firstMessage = await thread.messages.fetch(request.first_message_id!);

    if(firstMessage) {
        await firstMessage.edit({
            embeds: [dashboard]
        });
    }
    return;
}

export const updateTags = async(client: CustomClient, threadId: string, tagName: string, remark?: string) => {
    let channel = client.channels.cache.get(DISCORD_COMMUNITY_FORUM_ID) as ForumChannel;
    let thread = client.channels.cache.get(threadId) as ThreadChannel;
    let newTags = channel.availableTags.filter(x => x.name === tagName);
    await thread.setAppliedTags(newTags.map(x => x.id));

    if(remark) {
        await thread.send(remark);
    }
    return;
}

export const updateTagsWithMultipleRemarks = async(client: CustomClient, threadId: string, tagName: string, remarks: { title: string, value: string }[]) => {
    let channel = client.channels.cache.get(DISCORD_COMMUNITY_FORUM_ID) as ForumChannel;
    let thread = client.channels.cache.get(threadId) as ThreadChannel;
    let newTags = channel.availableTags.filter(x => x.name === tagName);
    await thread.setAppliedTags(newTags.map(x => x.id));

    if(remarks.length > 0) {
        for(const { title, value } of remarks) {
            await sendMessageInParts(thread, title, value);

        }
    }
    return;
}

export const newThread = async(client: CustomClient, request: RegradeRequest) => {
    let channel = client.channels.cache.get(DISCORD_COMMUNITY_FORUM_ID) as ForumChannel;

    let title = `[${request.blockchain ?? "N/A"}] ${request.bounty_name ?? "Review Request"} (${request.discord_name})`;
    let message = `Submitted by <@${request.discord_id}>`;

    let dashboardBuilder = new DashboardBuilder(request, "Request Details");
    dashboardBuilder
        .disableRegrader()
        .disableThread();
    if(!request.approved_at) dashboardBuilder.disablePaymentStatus();

    let dashboard = dashboardBuilder.buildDashboard();

    //search for tag
    let tagName = "Open";

    if(request.approved_at) {
        tagName = "Closed";
        return;
    }

    else if(request.regraded_score) {
        tagName = "Pending Approval";
    }

    else if(request.is_regrading) {
        tagName = "Reviewing";
    }

    let tags = channel.availableTags.filter(x => x.name === tagName);
    const thread = await channel.threads.create({
        name: title,
        message: {
            content: message,
            embeds: [dashboard],
        },
        appliedTags: tags.length === 0? undefined : tags.map(x => x.id)
    });

    // log the thread id in backend
    await axios.post('/assign_regrade_request_thread_id', { uuid: request.uuid, thread_id: thread.id, first_message_id: thread.lastMessageId });

    if(request.reason) await sendMessageInParts(thread, "Request Reason", request.reason);
    if(request.grader_feedback) await sendMessageInParts(thread, "Original Feedback", request.grader_feedback);
    if(request.regraded_reason) await sendMessageInParts(thread, "Regrade Feedback", request.regraded_reason);

    return;
}

export const closeThread = async(client: CustomClient, request: RegradeRequest) => {
    let thread = client.channels.cache.get(request.thread_id!) as ThreadChannel;
    await thread.setLocked(true);
}