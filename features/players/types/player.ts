export interface Player {
  id: string;
  full_name: string;
  nickname: string;
  date_of_birth: string;
  photo?: string;
  phone?: string;
  position: string;
  overall_rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  created_at: string;
}

export interface PaginatedPlayers {
  count: number;
  next: string | null;
  previous: string | null;
  results: Player[];
}

export interface PlayerDetail extends Player {
  user: string;
  user_email: string;
  tournament_registrations: TournamentRegistration[];
  fifa_card: string;
  updated_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament: string;
  tournament_name: string;
  player: string;
  player_name: string;
  roster_assignment: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerStats {
  id: string;
  matches_played: number;
  minutes_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  clean_sheets: number;
  mvp_count: number;
  tournament: string;
  player: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerAchievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string;
  image: string | null;
  earned_at: string;
  player: string;
  tournament: string | null;
}

export interface PlayerCard {
  id: string;
  generated_image: string | null;
  card_type: string; // base, season, form, mvp, top_scorer, special
  card_type_display?: string;
  position: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  rarity: string; // bronze, silver, gold, elite, iconic, legend, icon, champion, on_fire, veteran, rookie, birthday, community, derby
  rarity_color?: string; // hex color embedded by backend (e.g. #17968C)
  rarity_label?: string; // localized label embedded by backend (e.g. "Icónica")
  theme?: string | null;
  last_calculated_at?: string | null;
  tournament?: string | null;
  tournament_name?: string | null;
  tournament_season_label?: string | null;
  is_active?: boolean;
  player: string;
  created_at?: string;
  updated_at?: string;
}

export interface CardHistoryItem {
  id?: string;
  card?: string;
  overall: number;
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defense?: number;
  physical?: number;
  rarity: string;
  rarity_color?: string;
  rarity_label?: string;
  captured_at: string;
}
