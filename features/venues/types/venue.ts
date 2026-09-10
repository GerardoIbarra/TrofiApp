export interface Venue {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number | null;
  league?: string | null;
  fields_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VenuesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Venue[];
}
