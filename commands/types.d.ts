export type RegradeRequest = {
    id: number;
    discord_id: string;
    discord_name: string;
    created_at: string;
    updated_at: string;
    is_regrading: bool;
    uuid: string;

    submission: string | null;
    grader_feedback: string | null;
    current_score: number | null;
    expected_score: number | null;
    reason: string | null; // reason to get expected score

    regraded_by_id: number | null;
    regraded_by: string | null;
    regraded_at: string | null;
    regraded_score: number | null;
    regraded_reason: string | null;

    approved_at: string | null;
    approved_by: string | null;
    approved_by_id: string | null;

    deleted_at: string | null;
}

export type RegradeRequestCSV = RegradeRequest & { is_admin: boolean }