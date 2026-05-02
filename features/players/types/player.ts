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
  card_type: string;
  position: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  rarity: string;
  theme: string;
  is_active: boolean;
  player: string;
  tournament: string | null;
  created_at: string;
  updated_at: string;
}
