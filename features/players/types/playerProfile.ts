import { PlayerCard } from '../schemas/playerProfileSchema';

export interface TournamentCardItem {
  tournament: string;
  tournament_name: string;
  card: PlayerCard | null;
}

export interface CardHistoryItem {
  overall: number;
  rarity: string;
  captured_at: string;
}

export interface PlayerStatsByTournament {
  tournament: string;
  tournament_name?: string;
  matches_played?: number;
  goals: number;
  assists: number;
  avg_match_rating: number;
  clean_sheets?: number;
  mvp_count?: number;
  yellow_cards?: number;
  red_cards?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  confidence_factor?: number;
  provisional?: boolean;
}

export interface PlayerAchievementItem {
  id?: string;
  achievement_type: string;
  tournament_name?: string;
  metadata?: Record<string, any>;
  created_at: string;
  awarded_at?: string;
}

export interface PlayerStreak {
  count: number;
}

export interface PlayerProfileResponse {
  player: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    photo?: string | null;
    avatar?: string | null;
    position?: string | null;
    dorsal?: number | null;
    height?: number | null;
    city?: string | null;
    country?: string | null;
  };
  cards: TournamentCardItem[];
  active_tournament_id: string | null;
  card: PlayerCard | null;
  card_history: CardHistoryItem[];
  stats_by_tournament: PlayerStatsByTournament[];
  achievements: PlayerAchievementItem[];
  offensive_streak: PlayerStreak | null;
  defensive_streak: PlayerStreak | null;
}
