export interface MVPVoteResultItem {
  roster_membership: string;
  player_name: string;
  votes: number;
  score: number;
}

export interface MVPVoteTallyResponse {
  results: MVPVoteResultItem[];
}

export interface VoteMVPPayload {
  [key: string]: unknown;
  voted_for: string; // uuid of roster_membership
}

export interface VoteMVPResponse {
  id: string;
  match: string;
  voter: string;
  voter_name: string;
  voted_for: string;
  voted_for_name: string;
  created_at: string;
}

export interface LockMVPVoteResponse {
  results: MVPVoteResultItem[];
  winner_tournament_player: string | null;
}
