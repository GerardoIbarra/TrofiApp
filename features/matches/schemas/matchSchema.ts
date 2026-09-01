import { z } from "zod";

export const manualMatchSchema = z.object({
  tournament: z.string().uuid("ID de torneo inválido"),
  home_team: z.string().uuid("ID de equipo local inválido"),
  away_team: z.string().uuid("ID de equipo visitante inválido"),
  venue_name: z.string().optional(),
  start_datetime: z.string(), // ISO string date
});
export type ManualMatchSchema = z.infer<typeof manualMatchSchema>;

export const scheduleConfigSchema = z.object({
  days_of_week: z.array(z.union([z.string(), z.number()])).min(1, "Selecciona al menos un día"),
  window_start: z.string(), // e.g. "19:00"
  window_end: z.string(),   // e.g. "00:00"
  match_duration_minutes: z.coerce.number().min(1),
  break_minutes: z.coerce.number().optional(),
  fields: z.array(z.string().uuid()).optional(),
});
export type ScheduleConfigSchema = z.infer<typeof scheduleConfigSchema>;

export const generateScheduleSchema = z.object({
  start_date: z.string(), // YYYY-MM-DD
  // Round-robin options
  kick_off_time: z.string().optional(),
  match_interval_minutes: z.coerce.number().optional(),
  matches_per_day: z.coerce.number().optional(),
  rounds: z.coerce.number().optional(),
  field_ids: z.array(z.string().uuid()).optional(),
  // Weekly config overrides
  days_of_week: z.array(z.union([z.string(), z.number()])).optional(),
  window_start: z.string().optional(),
  window_end: z.string().optional(),
  match_duration_minutes: z.coerce.number().optional(),
  break_minutes: z.coerce.number().optional(),
});
export type GenerateScheduleSchema = z.infer<typeof generateScheduleSchema>;

export const extraTimeSchema = z.object({
  extra_time_home_score: z.coerce.number().min(0),
  extra_time_away_score: z.coerce.number().min(0),
});
export type ExtraTimeSchema = z.infer<typeof extraTimeSchema>;
