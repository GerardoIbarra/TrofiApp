export type AchievementType =
  | 'loyal_fan'
  | 'match_day_regular'
  | 'referee_10'
  | 'referee_50'
  | 'league_spotlight'
  | 'fastest_growing_league'
  | 'pickup_regular'
  | 'pickup_explorer';

export interface Achievement {
  id: string;
  achievement_type: AchievementType | string;
  title?: string;
  description?: string;
  user?: string | null;
  user_name?: string;
  league?: string | null;
  league_name?: string;
  tournament?: string | null;
  metadata?: Record<string, any>;
  unlocked_at?: string;
  created_at: string;
}

export interface AchievementListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Achievement[];
}

export interface CreateLeagueAchievementPayload {
  [key: string]: unknown;
  league: string;
  achievement_type: 'league_spotlight' | 'fastest_growing_league';
}
