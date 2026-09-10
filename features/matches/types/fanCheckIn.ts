export interface AttendanceStreak {
  count: number;
}

export interface FanCheckInRequest {
  latitude?: number | null;
  longitude?: number | null;
  photo?: string | null; // uri or base64
}

export interface FanCheckInResponse {
  id: string;
  match: string;
  user: string;
  user_name: string;
  latitude?: number | null;
  longitude?: number | null;
  is_location_verified: boolean;
  photo?: string | null;
  attendance_streak: AttendanceStreak | null;
  created_at: string;
}
