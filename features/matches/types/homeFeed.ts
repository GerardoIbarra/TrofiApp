import { Match } from '@/features/tournaments/types/match';

export type RelationReason =
  | 'player'
  | 'favorite'
  | 'referee'
  | 'league_admin'
  | 'tournament_admin'
  | 'captain'
  | 'owner';

export interface HomeFeedCapabilities {
  is_referee: boolean;
  is_league_admin: boolean;
  is_tournament_admin: boolean;
  can_manage_match: boolean;
  is_player: boolean;
  my_tournament_team_id: string | null;
  can_confirm_attendance: boolean;
  is_captain: boolean;
  is_owner: boolean;
  can_confirm_for_team: boolean;
}

export interface HomeFeedItem {
  match: Match;
  relation_reasons: RelationReason[];
  capabilities: HomeFeedCapabilities;
}
