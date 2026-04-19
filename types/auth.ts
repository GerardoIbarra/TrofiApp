export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  memberships?: any[];
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
