export interface NotificationPreferences {
  id?: string;
  user?: string;
  match_reminders: boolean;
  team_updates: boolean;
  league_updates: boolean;
  tournament_updates: boolean;
  marketing: boolean;
  pickup_updates: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  match_reminders: true,
  team_updates: true,
  league_updates: true,
  tournament_updates: true,
  marketing: false,
  pickup_updates: true,
  push_enabled: true,
  email_enabled: true,
  sms_enabled: false,
};
