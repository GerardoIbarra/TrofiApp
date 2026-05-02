import { MatchStatus, MatchResult } from './match';

export interface PlayerLineup {
  player_name: string;
  shirt_number: number;
  position: string;
  photo: string | null;
}

export interface UnavailablePlayer extends PlayerLineup {
  reason: string;
}

export interface TeamLineup {
  team_name: string;
  formation_name: string;
  formation: Array<{ position: string; count: number }>;
  starting_xi: PlayerLineup[];
  unavailable: UnavailablePlayer[];
}

export interface MatchLineupResponse {
  match_id: string;
  home_team_name: string;
  away_team_name: string;
  venue_name: string;
  start_datetime: string;
  home: TeamLineup;
  away: TeamLineup;
}

export interface RecentForm {
  outcome: 'W' | 'D' | 'L';
  goals_for: number;
  goals_against: number;
  opponent_name: string;
  date: string;
}

export interface SeasonStats {
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_per_game: number;
  goals_conceded_per_game: number;
  clean_sheets: number;
}

export interface HeadToHeadStats {
  home_wins: number;
  draws: number;
  away_wins: number;
  home_win_pct: number;
  draw_pct: number;
  away_win_pct: number;
  total_played: number;
}

export interface MatchHeadToHeadResponse {
  home_team_name: string;
  away_team_name: string;
  head_to_head: HeadToHeadStats;
  home_recent_form: RecentForm[];
  away_recent_form: RecentForm[];
  home_season_stats: SeasonStats;
  away_season_stats: SeasonStats;
}

export interface MatchEvent {
  id: string;
  match: string;
  team: string;
  team_name: string;
  roster_membership: string;
  player_name: string;
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'var' | 'period_start' | 'period_end' | 'other';
  minute: number;
  metadata: string | null;
  created_at: string;
}

export interface MatchTimelineResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MatchEvent[];
}
