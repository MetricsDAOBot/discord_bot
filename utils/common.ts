import { ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js';
import 'dotenv/config';

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