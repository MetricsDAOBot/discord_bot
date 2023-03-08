export type RegradeRequest = {
    id: number;
    discord_id: string;
    discord_name: string;
    created_at: string;
    updated_at: string;
    is_regrading: bool;
    uuid: string;

    blockchain: string | null;
    bounty_name: string | null;
    thread_id: string | null;
    first_message_id: string | null;
    submission: string | null;
    grader_feedback: string | null;
    current_score: string | null;
    expected_score: string | null;
    reason: string | null; // reason to get expected score

    regraded_by_id: string | null;
    regraded_by: string | null;
    regraded_at: string | null;
    regraded_score: number | null;
    regraded_reason: string | null;

    approved_at: string | null;
    approved_by: string | null;
    approved_by_id: string | null;

    is_payment_expected: boolean | null;
    is_payment_assigned: boolean | null;
    paid_at: string | null;
    payment_tx_hash: string | null;

    deleted_at: string | null;
}

export type RegradeRequestCSV = RegradeRequest & { is_admin: boolean }