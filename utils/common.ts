import { ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, TextChannel, ThreadChannel } from 'discord.js';
import 'dotenv/config';
import { PAGE_CHAR_LENGTH } from '..';

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
export async function deleteReplyInteractionAfterSeconds(interaction: ChatInputCommandInteraction | ModalSubmitInteraction | ButtonInteraction, content: string, s: number) {
    await interaction.reply({ content, ephemeral: true });
    await sleep(s * 1000);
    await interaction.deleteReply();
}

export const sendMessageInParts = async(thread: TextChannel | ThreadChannel, title: string, message: string) => {
    message = message.replace(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g, '<$1>');
    
    if(message.length <= PAGE_CHAR_LENGTH) {
        await thread.send(`__**${title}**__\n${message}`);
        return;
    }

    let replyMessage = '';
    let wordArray: string[] = [];
    wordArray = message.split(" ");
    let page = 1;

    let currentStringIndex = 0;
    let wordIndex = 0;

    thread.send(`__**${title}**__`);

    for(const word of wordArray) {
        wordIndex++;
        currentStringIndex += word.length + 1; // + 1 cause we need to include one space bar
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