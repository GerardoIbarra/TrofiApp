export interface League {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface LeaguesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: League[];
}
