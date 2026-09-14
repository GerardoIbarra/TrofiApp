export interface Venue {
  id: string;
  league?: string | null; // A venue can belong to a league or be public
  name: string;
  city?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Field {
  id: string;
  venue: string;
  name: string;
  surface?: string;
  created_at?: string;
  updated_at?: string;
}
