export interface TournamentRegistration {
  id: string;
  tournament: string;
  tournament_name: string;
  team: string;
  team_name: string;
  group: string;
  is_active: boolean;
  captain: {
    id: number;
    user: string;
    user_name: string;
  };
  player_count: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  league: string;
  league_name: string;
  name: string;
  logo: string | null;
  city: string;
  owner: string;
  owner_name: string;
  tournament_registrations?: TournamentRegistration[];
  created_at: string;
  updated_at: string;
}

export interface TeamsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Team[];
}
