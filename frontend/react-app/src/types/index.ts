export interface TrialRecord {
    nct_id: string;
    phase: string;
    status: string;
    condition: string;
    region?: string;
    results_summary?: string;
}

export interface CanonicalResult {
    molecule: string;
    trial_summary?: string;
    trials: TrialRecord[];
    key_findings: string[];
    suggested_follow_up: string[];
    data_completeness_score?: number;
    confidence_overall?: number;
}

export interface Job {
    id: string;
    molecule: string;
    status: 'queued' | 'running' | 'generating_report' | 'completed' | 'failed';
    created_at: string;
    canonical_result?: CanonicalResult;
}

export interface ResearchRequest {
    molecule: string;
    prompt: string;
}

export interface ResearchStatusResponse {
    job_id: string;
    status: string;
    canonical_result?: CanonicalResult;
    created_at: string;
}
