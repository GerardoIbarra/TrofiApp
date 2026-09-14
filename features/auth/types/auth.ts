export interface Membership {
  id: number;
  league: string;
  league_name: string;
  role: string;
  created_at: string;
}

export interface SponsorProfile {
  id: string;
  company_name: string;
  website: string | null;
  logo: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpectatorProfile {
  id: string;
  city: string;
  bio: string;
  preferred_language: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface RefereeProfile {
  id: string;
  certification_number: string;
  years_experience: number;
  average_rating: number;
  rating_count: number;
  admin_verified: boolean;
  admin_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerProfile {
  id: string;
  full_name: string;
  nickname: string;
  date_of_birth: string;
  phone: string;
  photo: string | null;
  position: string;
  overall_rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  created_at: string;
}

export interface PlayerTeam {
  id: string;
  tournament: string;
  tournament_name: string;
  tournament_player: string;
  tournament_team: string;
  player_name: string;
  team_name: string;
  shirt_number: number | null;
  position: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  match_reminders: boolean;
  team_updates: boolean;
  league_updates: boolean;
  tournament_updates: boolean;
  marketing: boolean;
  pickup_updates: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  favorite_type: string;
  team: string | null;
  team_name: string | null;
  player: string | null;
  player_name: string | null;
  league: string | null;
  league_name: string | null;
  tournament: string | null;
  tournament_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  photo?: string | null;
  is_staff?: boolean;
  memberships?: Membership[];
  player_profile_id?: string;
  player_profile?: PlayerProfile;
  spectator_profile?: SpectatorProfile;
  referee_profile?: RefereeProfile;
  sponsor_profile?: SponsorProfile;
  player_teams?: PlayerTeam[];
  notification_preferences?: NotificationPreferences;
  favorites?: Favorite[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterResponse extends AuthResponse {
  id?: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}
