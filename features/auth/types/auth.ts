export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  photo?: string;
  memberships?: any[];
  player_profile_id?: string;
  player_profile?: any;
  spectator_profile?: any;
  referee_profile?: any;
  sponsor_profile?: any;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}
