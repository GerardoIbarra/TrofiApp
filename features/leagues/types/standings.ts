export interface StandingItem {
  position: number;
  tournament_team: string;
  team_name: string;
  group: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export type StandingsResponse = StandingItem[];
