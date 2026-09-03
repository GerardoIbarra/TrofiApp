export type PlacementType = 'standings_banner' | 'match_banner' | 'share_card';

export interface SponsorPlacement {
  id: string;
  sponsor: string;
  sponsor_name?: string;
  sponsor_logo?: string | null;
  sponsor_website?: string | null;
  league?: string | null;
  league_name?: string | null;
  tournament?: string | null;
  tournament_name?: string | null;
  team?: string | null;
  team_name?: string | null;
  placement_type: PlacementType;
  image_url?: string | null;
  redirect_url?: string | null;
  title?: string | null;
  starts_at: string;
  ends_at: string;
  impressions: number;
  clicks: number;
  is_active: boolean;
  is_expired: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSponsorPlacementData {
  league?: string;
  tournament?: string;
  team?: string;
  placement_type: PlacementType;
  starts_at: string;
  ends_at: string;
  image_url?: string;
  redirect_url?: string;
  title?: string;
}

export interface RenewPlacementData {
  extend_days?: number;
}

export interface UpdateSponsorPlacementData {
  placement_type?: PlacementType;
  image_url?: string | null;
  redirect_url?: string | null;
  title?: string | null;
  starts_at?: string;
  ends_at?: string;
  is_active?: boolean;
}

export interface SponsorPlacementsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SponsorPlacement[];
}
