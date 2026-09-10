import { Team } from './team';

export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goals_per_game: number;
  goals_conceded_per_game: number;
  clean_sheets: number;
}

export interface RecentFormItem {
  outcome: 'W' | 'D' | 'L';
  opponent_name: string;
  goals_for: number;
  goals_against: number;
  date: string;
}

export interface CurrentStreak {
  type: 'W' | 'D' | 'L';
  count: number;
}

export interface TeamRosterItem {
  player_id?: string;
  player_name: string;
  shirt_number?: number | string | null;
  position?: string | null;
  photo?: string | null;
  is_captain?: boolean;
}

export interface CurrentLineup {
  formation_name: string;
  starting_xi: any[];
  unavailable: any[];
}

export interface LineupHistoryItem {
  name: string;
  formation_name: string;
  is_active: boolean;
  player_count: number;
  created_at: string;
}

export interface TeamAchievementItem {
  achievement_type: string;
  tournament_name?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface TeamProfileResponse {
  team: Team;
  tournament_team_id: string | null;
  tournament_name: string | null;
  stats: TeamStats | null;
  position: number | null;
  recent_form: RecentFormItem[];
  current_streak: CurrentStreak | null;
  roster: TeamRosterItem[];
  current_lineup: CurrentLineup | null;
  lineup_history: LineupHistoryItem[];
  achievements: TeamAchievementItem[];
}

export interface TeamHistoryResponse {
  team_id: string;
  team_name: string;
  tournaments_played: number;
  career_stats: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    clean_sheets: number;
  };
  achievements_by_type: Record<string, number>;
  achievements: TeamAchievementItem[];
}
