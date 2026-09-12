export type DisputeStatus = 'pending' | 'upheld' | 'rejected';

export interface MatchDispute {
  id: string;
  match: string;
  filed_by: string;
  filed_by_name?: string;
  filed_by_team?: string | null;
  filed_by_team_name?: string | null;
  reason: string;
  status: DisputeStatus;
  resolution_notes?: string | null;
  resolved_by?: string | null;
  resolved_by_name?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface FileDisputePayload {
  [key: string]: unknown;
  match: string;
  reason: string;
}

export interface ResolveDisputePayload {
  [key: string]: unknown;
  resolution_notes?: string;
}
