export interface TournamentFeatures {
  inherit_from_league: boolean;
  discipline_enabled: boolean;
  payments_enabled: boolean;
  comms_enabled: boolean;
  qr_checkin_enabled: boolean;
  player_market_enabled: boolean;
  sponsors_enabled: boolean;
  referee_marketplace_enabled?: boolean;
}

export type TournamentStatus = 'draft' | 'active' | 'completed' | 'canceled';

export interface Tournament {
  id: string;
  league: string;
  league_name: string;
  name: string;
  season_label: string;
  format: string;
  gender: 'mens' | 'womens' | 'mixed';
  status: TournamentStatus;
  registration_open: boolean;
  max_teams: number;
  description?: string;
  start_date: string;
  end_date: string;
  features?: TournamentFeatures;
  champion_determination?: 'standings' | 'playoffs';
  standings_tiebreaker?: 'goal_difference' | 'head_to_head';
  knockout_tiebreaker?: 'penalty_shootout' | 'standings' | 'away_goals';
  extra_time_enabled?: boolean;
  two_legged_knockout?: boolean;
  min_age?: number;
  max_age?: number;
  team_count?: string;
  match_count?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string | null;
  approved_by_name?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface TournamentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tournament[];
}
