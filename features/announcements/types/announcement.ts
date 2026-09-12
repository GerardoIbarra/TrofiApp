export interface Announcement {
  id: string;
  league?: string | null;
  league_name?: string | null;
  tournament?: string | null;
  tournament_name?: string | null;
  title: string;
  body: string;
  author?: string;
  author_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateAnnouncementPayload {
  [key: string]: unknown;
  title: string;
  body: string;
  league?: string;
  tournament?: string;
}

export interface UpdateAnnouncementPayload {
  [key: string]: unknown;
  title?: string;
  body?: string;
}

export interface AnnouncementListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Announcement[];
}
