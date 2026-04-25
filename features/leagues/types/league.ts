export interface LeagueFeatures {
  discipline_enabled: boolean;
  payments_enabled: boolean;
  comms_enabled: boolean;
  qr_checkin_enabled: boolean;
  player_market_enabled: boolean;
  sponsors_enabled: boolean;
  white_label_enabled: boolean;
}

export interface LeagueMembership {
  id: number;
  user: string;
  user_name: string;
  league: string;
  role: string;
  created_at: string;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  logo: string | null;
  background_image: string | null;
  created_by: string;
  created_by_name: string;
  features?: LeagueFeatures;
  memberships?: LeagueMembership[];
  tournament_count?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaguesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: League[];
}
