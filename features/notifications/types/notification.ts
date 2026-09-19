export interface NotificationData {
  screen?: string;
  [key: string]: any;
}

export interface AppNotification {
  id: string | number;
  notification_type: string;
  title: string;
  body?: string;
  message?: string;
  data?: NotificationData | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}
