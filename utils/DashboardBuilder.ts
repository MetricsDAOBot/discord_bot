import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import moment from "moment";
import { RegradeRequest } from "../commands/types";
import 'dotenv/config';

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

export class DashboardBuilder {

    request;
    title;
    description: string | null;

    config = {
        // details
        disableSubmission: false,
        disableCurrentScore: false,
        disableExpectedScore: false,
        disableRegradedScore: false,
        disableRegrader: false,
        disableRegradedAt: false,
        disableSubmittedAt: false,
        disableApprovedAt: false,
        disableThread: false,

        // buttons
        disableRegradeReason: false,
        disableGraderFeedback: false,
        disableRegradeFeedback: false,
        enableApprove: false,
        enableReject: false,
        enableReview: false,

        // navigation
        nav_type: "",
        nav_page: 0,
        disableButtonLeft: false,
        disableButtonRight: false,
    };

    constructor(request: RegradeRequest, title: string, description: string | null = null) {
        this.request = request;
        this.title = title;
        this.description = description;
    }

    disableSubmission = () => {
        this.config.disableSubmission = true;
        return this;
    }

    disableCurrentScore = () => {
        this.config.disableCurrentScore = true;
        return this;
    }

    disableExpectedScore = () => {
        this.config.disableExpectedScore = true;
        return this;
    }

    disableRegradedScore = () => {
        this.config.disableRegradedScore = true;
        return this;
    }

    disableRegrader = () => {
        this.config.disableRegrader = true;
        return this;
    }

    disableRegradedAt = () => {
        this.config.disableRegradedAt = true;
        return this;
    }

    disableSubmittedAt = () => {
        this.config.disableSubmittedAt = true;
        return this;
    }

    disableApprovedAt = () => {
        this.config.disableApprovedAt = true;
        return this;
    }

    disableThread = () => {
        this.config.disableThread = true;
        return this;
    }

    disableRegradeReason = () => {
        this.config.disableRegradeReason = true;
        return this;
    }

    disableGraderFeedback = () => {
        this.config.disableGraderFeedback = true;
        return this;
    }

    disableRegradeFeedback = () => {
        this.config.disableRegradeFeedback = true;
        return this;
    }

    setNav = (type: "self" | "approve", nav_page: number) => {
        this.config.nav_type = type;
        this.config.nav_page = nav_page;
        return this;
    }

    disableButtonLeft = () => {
        this.config.disableButtonLeft = true;
        return this;
    }

    disableButtonRight = () => {
        this.config.disableButtonRight = true;
        return this;
    }

    enableApprove = () => {
        this.config.enableApprove = true;
        return this;
    }

    enableReject = () => {
        this.config.enableReject = true;
        return this;
    }

    enableReview = () => {
        this.config.enableReview = true;
        return this;
    }

    buildDashboard = () => {
        let { request, config, title, description } = this;
        let {
            disableSubmission,
            disableCurrentScore,
            disableExpectedScore,
            disableRegradedScore,
            disableRegrader,
            disableRegradedAt,
            disableSubmittedAt,
            disableApprovedAt,
            disableThread
        } = config;

        let dashboard = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(title)
                    .setDescription(description);

        if(!disableSubmission || !disableRegrader) {
            if(!disableSubmission) {
                dashboard.addFields(
                    { name: 'Submission', value: request.submission? request.submission : 'N/A' },
                );
            }
            if(!disableThread) {
                dashboard.addFields(
                    { name: 'Thread', value: request.thread_id? `https://discord.com/channels/${DISCORD_GUILD_ID}/${request.thread_id}` : 'N/A' },
                );
            }

            if(!disableRegrader) {
                dashboard.addFields(
                    { name: 'Regrader', value: request.regraded_by_id? `<@${request.regraded_by_id}>` : 'N/A' },
                );
            }

            dashboard.addFields(
                { name: '\u200B', value: '\u200B' },
            );
        }

        if(!disableCurrentScore || !disableExpectedScore || !disableRegradedScore) {
            if(!disableCurrentScore) {
                dashboard.addFields(
                    { name: 'Current Score', value: request.current_score? request.current_score.toString() : 'N/A' }
                );
            }

            if(!disableExpectedScore) {
                dashboard.addFields(
                    { name: 'Expected Score', value: request.expected_score? request.expected_score.toString() : 'N/A' },
                );
            }

            if(!disableRegradedScore) {
                dashboard.addFields(
                    { name: 'Regraded Score', value: request.regraded_score? request.regraded_score.toString() : 'N/A' },
                );
            }

            dashboard.addFields(
                { name: '\u200B', value: '\u200B' },
            );
        }

        if(!disableSubmittedAt || !disableRegradedAt || !disableApprovedAt) {
            if(!disableCurrentScore) {
                dashboard.addFields(
                    { name: 'Submitted At', value: moment(request.created_at).format('YYYY-MM-DD HH:mm:ss'), inline: true },
                );
            }

            if(!disableExpectedScore) {
                dashboard.addFields(
                    { name: 'Regraded At', value: request.regraded_at? moment(request.regraded_at).format('YYYY-MM-DD HH:mm:ss') : "Not Regraded Yet", inline: true },
                );
            }

            if(!disableRegradedScore) {
                dashboard.addFields(
                    { name: 'Approved At', value: request.regraded_at? moment(request.approved_at).format('YYYY-MM-DD HH:mm:ss') : "Not Approved Yet", inline: true },
                );
            }
        }

        return dashboard;
    }

    buildButtons = () => {

        let { request, config } = this;
        let {
            // buttons
            disableRegradeReason,
            disableGraderFeedback,
            disableRegradeFeedback,
            enableApprove,
            enableReject,
            enableReview,
    
            // navigation
            nav_type,
            nav_page,
            disableButtonLeft,
            disableButtonRight,
        } = config;

        // build dashboard
        

        let actionRows: any[] = [];

        let buttonLeft: ButtonBuilder;
        let buttonRight: ButtonBuilder;
        let buttonReason: ButtonBuilder;
        let buttonFeedback: ButtonBuilder;
        let buttonRegradedReason: ButtonBuilder;
        let buttonApprove: ButtonBuilder;
        let buttonReject: ButtonBuilder;

        let upperButtons: ButtonBuilder[] = [];
        let lowerButtons: ButtonBuilder[] = [];

        /**
         * Upper buttons
         */
        if(!disableRegradeReason) {
			buttonReason = new ButtonBuilder()
                        .setCustomId(`reason_-1_${request.uuid}`) // split it when processing interaction
                        .setLabel('Request Reason')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!request.reason);
            upperButtons.push(buttonReason)
        }

        if(!disableGraderFeedback) {
            buttonFeedback = new ButtonBuilder()
                        .setCustomId(`feedback_-1_${request.uuid}`) // split it when processing interaction
                        .setLabel('Grader Feedback')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!request.grader_feedback);
            upperButtons.push(buttonFeedback);
        }

        if(!disableRegradeFeedback) {
			buttonRegradedReason = new ButtonBuilder()
                    .setCustomId(`reasonregraded_-1_${request.uuid}`) // split it when processing interaction
                    .setLabel('Regrader Feedback')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(!request.regraded_reason);
            upperButtons.push(buttonRegradedReason);
        }

        /**
         * Lower buttons
         */
        if(enableApprove) {
			buttonApprove = new ButtonBuilder()
								.setCustomId(`approve_0_${request.uuid}`) // split it when processing interaction
								.setLabel('Approve')
								.setStyle(ButtonStyle.Success);
            lowerButtons.push(buttonApprove);
        }

        if(enableReject) {
			buttonReject = new ButtonBuilder()
								.setCustomId(`reject_0_${request.uuid}`) // split it when processing interaction
								.setLabel('Reject')
								.setStyle(ButtonStyle.Danger);
            lowerButtons.push(buttonReject);
        }

        if(enableReview) {
			const buttonReview = new ButtonBuilder()
            .setCustomId(`regrade_${request.uuid}`) // split it when processing interaction
            .setLabel('Review')
            .setStyle(ButtonStyle.Primary);
            lowerButtons.push(buttonReview);
        }

        if(nav_type !== "") {
            // has navigation
			buttonLeft = new ButtonBuilder()
            .setCustomId(`nav_self_${nav_page - 1}`) // split it when processing interaction
            .setLabel('<')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disableButtonLeft);
            lowerButtons.unshift(buttonLeft);

            buttonRight = new ButtonBuilder()
                        .setCustomId(`nav_self_${nav_page + 1}`) // split it when processing interaction
                        .setLabel('>')
                        .setStyle(ButtonStyle.Primary)
                        // res.data.length is always 2
                        // less than 2 = no more data
                        .setDisabled(disableButtonRight);
            lowerButtons.push(buttonRight);
        }

        // combine
        if(upperButtons.length > 0) {
            actionRows.push(new ActionRowBuilder().addComponents(upperButtons));
        }

        if(lowerButtons.length > 0) {
            actionRows.push(new ActionRowBuilder().addComponents(lowerButtons));
        }

        return actionRows;
    }

    buildAll = () => {

        let dashboard = this.buildDashboard();
        let actionRows = this.buildButtons();

        return {
            dashboard,
            actionRows,
        };
    }
}