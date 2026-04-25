export type MatchStatus = 'scheduled' | 'ongoing' | 'live' | 'finished' | 'canceled';

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

export interface RelevantTeam {
  id: string;
  name: string;
  side: 'home' | 'away';
  sources: string[];
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
  current_minute?: number | null;
  referee?: string;
  referee_name?: string;
  result?: MatchResult;
  relevant_teams?: RelevantTeam[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedMatches {
  count: number;
  next: string | null;
  previous: string | null;
  results: Match[];
}

export interface TeamFeed {
  id: string;
  name: string;
  logo: string;
  matches: Match[];
}

export interface TeamFeedResponse {
  teams: TeamFeed[];
}
