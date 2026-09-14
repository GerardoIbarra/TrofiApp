import { Match } from "./match";

export interface TournamentTeam {
  id: string;
  team_id: string;
  team_name: string;
  group?: string;
  // Other fields based on earlier tickets like points, goals_for...
}

export interface QualifiedTeamResponse {
  qualified_teams: TournamentTeam[];
}

export interface BracketSlot {
  stage: string; // ej. "f", "sf", "qf"
  slot_number: number;
  home_team?: string | null;
  home_team_name?: string | null;
  away_team?: string | null;
  away_team_name?: string | null;
  winner?: string | null;
  winner_name?: string | null;
  match?: Match | null; // Match associated to this slot
  next_slot?: string | null;
}

export interface Bracket {
  id: string;
  current_stage: string;
  slots: BracketSlot[];
}

export interface AssignMatchData {
  match_id?: string;
  start_datetime?: string;
  venue_name?: string;
  leg?: number; // for two_legged_knockout
}
