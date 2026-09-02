export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  memberships?: any[];
  player_profile_id?: string;
  player_profile?: any;
  spectator_profile?: any;
  referee_profile?: any;
  sponsor_profile?: any;
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
