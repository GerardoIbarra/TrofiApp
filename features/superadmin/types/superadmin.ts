export interface PlatformSummary {
  active_leagues: number;
  pending_approval: number;
  collected_this_month: string;
}

export interface PaymentRecordSummary {
  total_this_month: string;
  count_this_month: number;
}

export interface PaymentRecord {
  id: string;
  league: string;
  league_name?: string;
  amount: string;
  notes?: string;
  created_at: string;
}

export interface CreatePaymentRecordData {
  league: string;
  amount: string;
  notes?: string;
}

export type LeaguePaymentStatus = 'up_to_date' | 'pending' | 'overdue';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface SetPaymentStatusData {
  status: LeaguePaymentStatus;
}
