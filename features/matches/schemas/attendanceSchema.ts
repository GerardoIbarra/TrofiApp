import { z } from 'zod';

export const AttendanceStatusSchema = z.enum(['confirmed', 'declined', 'pending']);

export const ConfirmAttendanceSchema = z.object({
  status: AttendanceStatusSchema,
});

export const CaptainConfirmAttendanceSchema = z.object({
  status: AttendanceStatusSchema,
  roster_membership_ids: z.array(z.string().uuid()).optional(), // Optional, if empty implies all roster
});

export const TeamAttendanceSummarySchema = z.object({
  team_name: z.string(),
  roster_size: z.number(),
  confirmed: z.number(),
  declined: z.number(),
  pending: z.number(),
  required: z.number(),
});

export const MatchAttendanceSummarySchema = z.object({
  match_id: z.string().uuid(),
  home: TeamAttendanceSummarySchema,
  away: TeamAttendanceSummarySchema,
});

export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;
export type ConfirmAttendanceData = z.infer<typeof ConfirmAttendanceSchema>;
export type CaptainConfirmAttendanceData = z.infer<typeof CaptainConfirmAttendanceSchema>;
export type MatchAttendanceSummary = z.infer<typeof MatchAttendanceSummarySchema>;
