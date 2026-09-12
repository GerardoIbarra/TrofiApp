export interface ChatMessage {
  id: string;
  team: string | null;
  league: string | null;
  sender: string;
  sender_name: string;
  body: string | null;
  photo: string | null;
  created_at: string;
}

export interface DirectMessage {
  id: string;
  sender: string;
  sender_name: string;
  recipient: string;
  recipient_name: string;
  body: string | null;
  photo: string | null;
  is_read?: boolean;
  created_at: string;
}

export interface ConversationItem {
  user_id: string;
  user_name: string;
  user_photo?: string | null;
  last_message: DirectMessage | null;
  unread_count: number;
}

export interface UserBlock {
  id: string;
  blocker: string;
  blocked: string;
  blocked_name?: string;
  created_at: string;
}

export interface SendChatMessagePayload {
  [key: string]: unknown;
  body?: string;
  photo?: string; // base64 data URI data:image/jpeg;base64,...
}

export interface SendDirectMessagePayload {
  [key: string]: unknown;
  recipient: string;
  body?: string;
  photo?: string;
}

export interface BlockUserPayload {
  [key: string]: unknown;
  blocked: string;
}

export interface PaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}
