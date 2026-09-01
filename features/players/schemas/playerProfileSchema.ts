import { z } from "zod";

export const playerStatsSchema = z.object({
  id: z.string().uuid(),
  tournament: z.string().uuid(),
  player: z.string().uuid(),
  matches_played: z.number(),
  goals: z.number(),
  assists: z.number(),
  mvp_count: z.number(),
  clean_sheets: z.number(),
  yellow_cards: z.number(),
  red_cards: z.number(),
  wins: z.number(),
  draws: z.number(),
  losses: z.number(),
  avg_match_rating: z.number(),
  confidence_factor: z.number(),
  provisional: z.boolean(),
});
export type PlayerStats = z.infer<typeof playerStatsSchema>;

export const playerCardSchema = z.object({
  id: z.string().uuid(),
  player: z.string().uuid(),
  card_type: z.enum(["base", "season", "form", "mvp", "top_scorer", "special"]),
  position: z.string(), // e.g. "FW", "MF", "DF", "GK"
  overall: z.number(),
  pace: z.number(),
  shooting: z.number(),
  passing: z.number(),
  dribbling: z.number(),
  defense: z.number(),
  physical: z.number(),
  rarity: z.enum(["bronze", "silver", "gold", "elite", "iconic"]),
  theme: z.string().optional().nullable(),
  last_calculated_at: z.string(),
});
export type PlayerCard = z.infer<typeof playerCardSchema>;

export const playerAchievementSchema = z.object({
  id: z.string().uuid(),
  player: z.string().uuid(),
  achievement_type: z.enum(["first_day", "mvp_week", "top_scorer", "hat_trick", "champion", "fair_play"]),
  awarded_at: z.string(),
});
export type PlayerAchievement = z.infer<typeof playerAchievementSchema>;
