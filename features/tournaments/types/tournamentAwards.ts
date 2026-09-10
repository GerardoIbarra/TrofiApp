export interface AwardRecipient {
  id: string;
  name: string;
}

export interface BestXIRecipient {
  id: string;
  name: string;
  metadata?: {
    position?: string;
    avg_rating?: string;
  };
}

export interface DetermineChampionResponse {
  champion: AwardRecipient;
  runner_up: AwardRecipient | null;
  third_place: AwardRecipient | null;
  champion_determination: 'standings' | 'playoffs';
}

export interface CrownSeasonAwardsResponse {
  top_scorers: AwardRecipient[];
  most_assists: AwardRecipient[];
  fair_play_teams: AwardRecipient[];
  best_xi: BestXIRecipient[];
}

export interface ComputeWeeklyMVPRequest {
  [key: string]: unknown;
  start?: string; // ISO date-time
  end?: string;   // ISO date-time
  matchday?: number;
}

export interface ComputeWeeklyMVPResponse {
  winner: AwardRecipient | null;
  week_start: string;
  week_end: string;
}
