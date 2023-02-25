import { AxiosResponse } from "axios";
import { AttachmentBuilder, CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds, sleep } from "../utils/common";
import { RegradeRequestCSV } from "./types";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('all_requests')
		.setDescription('Returns all requests in a csv file.'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
			let { user } = interaction;
            let res = await axios.post<any, AxiosResponse<RegradeRequestCSV[]>>(`/regrade_requests`, { discord_id: user.id });
            
			if(res.data.length === 0) {
				await deleteReplyInteractionAfterSeconds(interaction, "There are no requests.", 5);
				// await interaction.reply({ content: "You have no requests.", ephemeral: true });
				return;
			}

            // if has regraded_by
            let shouldIncludeRegrader = res.data[0].is_admin;

            let ret = '"discord_name","created_at","updated_at","regraded_at","approved_at","uuid","is_regrading","link","grader_feedback","current_score","expected_score","reason","regraded_score","regraded_reason"';
            if(shouldIncludeRegrader) {
                ret += ',"regraded_by"';
            }

            res.data.forEach(request => {
                const {discord_name, created_at, updated_at, regraded_at, approved_at, uuid, is_regrading, submission, grader_feedback, current_score, expected_score, reason, regraded_score, regraded_reason, regraded_by} = request;
                ret += `\n"${discord_name}","${created_at}","${updated_at}","${regraded_at ?? "Not Regraded"}","${approved_at ?? "Not Approved"}","${uuid}","${is_regrading? "Yes" : "No"}","${submission ?? "-"}","${grader_feedback ?? "-"}","${current_score ?? "-"}","${expected_score ?? "-"}","${reason ?? "-"}","${regraded_score ?? "-"}","${regraded_reason ?? "-"}"`;
                if(shouldIncludeRegrader) {
                    ret += `,"${regraded_by ?? 'Not Regraded'}"`;
                }
            });
            let buffer = Buffer.from(ret);
            let attachment = new AttachmentBuilder(buffer, { name: 'my_requests.csv' });
            await interaction.reply({ files: [attachment]});
            await sleep(30000);
            await interaction.deleteReply();
            return;
        }

        catch (e){
            //console.log(e);
            await deleteReplyInteractionAfterSeconds(interaction,"Error adding tickets!", 5);
            // await interaction.reply({ content: "Error adding tickets!", ephemeral: true });
        }
	},
};