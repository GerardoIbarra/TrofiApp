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
  card_type: z.string(),
  card_type_display: z.string().optional().nullable(),
  position: z.string(),
  overall: z.number(),
  pace: z.number(),
  shooting: z.number(),
  passing: z.number(),
  dribbling: z.number(),
  defense: z.number(),
  physical: z.number(),
  rarity: z.string(),
  rarity_color: z.string().optional().nullable(),
  rarity_label: z.string().optional().nullable(),
  tournament: z.string().uuid().optional().nullable(),
  tournament_name: z.string().optional().nullable(),
  tournament_season_label: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
  last_calculated_at: z.string().optional().nullable(),
  generated_image: z.string().optional().nullable(),
});
export type PlayerCard = z.infer<typeof playerCardSchema>;

export const playerAchievementSchema = z.object({
  id: z.string().uuid(),
  player: z.string().uuid(),
  tournament: z.string().uuid().nullable().optional(),
  achievement_type: z
    .enum([
      "first_day",
      "mvp_week",
      "top_scorer",
      "most_assists",
      "hat_trick",
      "champion",
      "fair_play",
      "best_xi",
      "potm",
      "totw",
      "career_50_goals",
      "career_100_goals",
      "career_50_assists",
      "career_25_clean_sheets",
      "career_50_clean_sheets",
    ])
    .or(z.string()),
  metadata: z.record(z.any()).nullable().optional(),
  awarded_at: z.string(),
});
export type PlayerAchievement = z.infer<typeof playerAchievementSchema>;
