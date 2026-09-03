export type RefereeOfferStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface RefereeAvailability {
  id: string;
  referee: string;
  referee_name?: string;
  years_experience?: number;
  is_open: boolean;
  notes?: string;
  average_rating?: number;
  rating_count?: number;
  admin_verified?: boolean;
  admin_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SetRefereeAvailabilityData {
  is_open: boolean;
  notes?: string;
}

export interface MatchOfferDetails {
  id: string;
  home_team?: string;
  home_team_name?: string;
  away_team?: string;
  away_team_name?: string;
  tournament?: string;
  tournament_name?: string;
  venue_name?: string;
  start_datetime?: string;
}

export interface RefereeOffer {
  id: string;
  match: string;
  match_details?: MatchOfferDetails;
  referee: string;
  referee_name?: string;
  status: RefereeOfferStatus;
  created_at?: string;
  updated_at?: string;
}

export interface OfferRefereeData {
  referee: string;
}

export interface RateRefereeData {
  stars: number;
}

export interface RefereeProfile {
  id: string;
  user: string;
  user_name?: string;
  years_experience?: number;
  average_rating?: number;
  rating_count?: number;
  admin_verified?: boolean;
  admin_verified_at?: string | null;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}
