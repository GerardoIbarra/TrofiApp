export type SpotType = 'park' | 'street' | 'court' | 'field' | 'other';

export interface PickupTier {
  level: number;
  name: string;
  check_in_count: number;
  next_name: string | null;
  next_threshold: number | null;
  checkins_to_next: number;
  progress: number;
}

export interface BusyWindows {
  weekdays: number[];
  start_hour: number;
  end_hour: number;
  sample_size: number;
}

export interface PickupCheckInDetail {
  id?: string;
  user_name: string;
  note?: string | null;
  created_at: string;
  is_location_verified: boolean;
  additional_headcount?: number;
  crew_name?: string | null;
  user_tier?: PickupTier;
}

export interface PickupPhoto {
  id: string;
  spot: string;
  photo: string;
  caption?: string | null;
  created_at: string;
}

export interface PickupComment {
  id: string;
  spot: string;
  user: string;
  user_name: string;
  body: string;
  created_at: string;
}

export interface PickupSpot {
  id: string;
  name: string;
  spot_type: SpotType;
  city?: string | null;
  address?: string | null;
  description?: string | null;
  latitude: number;
  longitude: number;
  distance_km?: number | null;
  active_checkin_count: number;
  estimated_headcount: number;
  average_rating: number;
  rating_count?: number;
  is_trending: boolean;
  is_verified: boolean;
  verification_reason?: string | null;
  created_by?: string;
  photos?: PickupPhoto[];
  active_checkins?: PickupCheckInDetail[];
  busy_windows?: BusyWindows | null;
  upcoming_plan_count?: number;
  nearby_market_listings?: any[];
  created_at?: string;
}

export interface PickupCheckIn {
  id: string;
  spot: string;
  spot_name?: string;
  user?: string;
  user_name?: string;
  note?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  additional_headcount?: number;
  crew?: string | null;
  crew_name?: string | null;
  is_location_verified: boolean;
  expires_at: string;
  user_tier?: PickupTier;
  created_at: string;
}

export interface PickupAlert {
  id: string;
  label?: string | null;
  spot?: string | null;
  spot_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radius_km?: number | null;
  days_of_week?: number[];
  start_time?: string | null;
  end_time?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PickupPlan {
  id: string;
  spot: string;
  spot_name?: string;
  user_name?: string;
  planned_for: string;
  note?: string | null;
  created_at: string;
}

export interface PickupCrew {
  id: string;
  name: string;
  description?: string | null;
  members_count?: number;
  is_member?: boolean;
  created_by?: string;
  created_at?: string;
}

export interface PickupCrewChallenge {
  id: string;
  challenger_crew: string;
  challenger_crew_name?: string;
  challenged_crew: string;
  challenged_crew_name?: string;
  spot?: string | null;
  spot_name?: string | null;
  proposed_for?: string | null;
  message?: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface LeaderboardItem {
  user_id: string;
  user_name: string;
  check_in_count: number;
  distinct_spot_count: number;
  tier: PickupTier;
}

// Payloads
export interface CreatePickupSpotPayload {
  [key: string]: unknown;
  name: string;
  spot_type: SpotType;
  city?: string;
  address?: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export interface CreatePickupCheckInPayload {
  [key: string]: unknown;
  spot: string;
  note?: string;
  latitude?: number;
  longitude?: number;
  additional_headcount?: number;
  crew?: string;
}

export interface CreatePickupCommentPayload {
  [key: string]: unknown;
  spot: string;
  body: string;
}

export interface CreatePickupRatingPayload {
  [key: string]: unknown;
  spot: string;
  stars: number;
}

export interface CreatePickupPhotoPayload {
  [key: string]: unknown;
  spot: string;
  photo: string; // base64
  caption?: string;
}

export interface CreatePickupAlertPayload {
  [key: string]: unknown;
  label?: string;
  spot?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  days_of_week?: number[];
  start_time?: string;
  end_time?: string;
}

export interface CreatePickupPlanPayload {
  [key: string]: unknown;
  spot: string;
  planned_for: string;
  note?: string;
}

export interface CreatePickupCrewPayload {
  [key: string]: unknown;
  name: string;
  description?: string;
}

export interface CreateCrewChallengePayload {
  [key: string]: unknown;
  challenger_crew: string;
  challenged_crew: string;
  spot?: string;
  proposed_for?: string;
  message?: string;
}

export interface ReportSpotPayload {
  [key: string]: unknown;
  spot: string;
  reason: 'does_not_exist' | 'unsafe' | 'inappropriate' | 'other';
  note?: string;
}
