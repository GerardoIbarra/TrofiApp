export type MatchStatus = 'scheduled' | 'ongoing' | 'finished' | 'canceled';

export interface MatchResult {
  id: string;
  match: string;
  home_score: number;
  away_score: number;
  result_type: 'normal' | 'technical' | 'walkover';
  notes?: string;
  locked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  tournament: string;
  tournament_name: string;
  home_team: string;
  home_team_name: string;
  away_team: string;
  away_team_name: string;
  venue_name?: string;
  start_datetime: string;
  status: MatchStatus;
  referee?: string;
  referee_name?: string;
  result?: MatchResult;
  created_at: string;
  updated_at: string;
}

export interface PaginatedMatches {
  count: number;
  next: string | null;
  previous: string | null;
  results: Match[];
}
