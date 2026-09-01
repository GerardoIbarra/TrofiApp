import { z } from "zod";

export const matchEventSchema = z.object({
  match: z.string().uuid(),
  team: z.string().uuid(),
  event_type: z.enum([
    "goal",
    "own_goal",
    "assist",
    "yellow_card",
    "red_card",
    "save",
    "clean_sheet",
    "mvp",
    "sub_in",
    "sub_out",
    "penalty_missed",
    "var",
  ]),
  roster_membership: z.string().uuid().optional().nullable(),
  minute: z.coerce.number().min(1).max(150),
  metadata: z
    .object({
      scoring_method: z.enum(["penalty", "free_kick", "header", "open_play"]).optional(),
    })
    .optional()
    .nullable(),
});
export type MatchEventSchema = z.infer<typeof matchEventSchema>;

export const substituteSchema = z.object({
  team: z.string().uuid(),
  player_out: z.string().uuid(),
  player_in: z.string().uuid(),
  minute: z.coerce.number().min(1).max(150),
});
export type SubstituteSchema = z.infer<typeof substituteSchema>;

export const changeStatusSchema = z.object({
  status: z.enum(["scheduled", "live", "paused", "played", "postponed", "canceled", "forfeit"]),
  reason: z
    .enum(["weather", "field_unavailable", "referee_unavailable", "team_no_show", "disciplinary", "other"])
    .optional(),
  note: z.string().optional(),
});
export type ChangeStatusSchema = z.infer<typeof changeStatusSchema>;

export const forfeitSchema = z.object({
  forfeiting_team: z.string().uuid(),
  reason: z
    .enum(["team_no_show", "disciplinary", "other"])
    .optional(),
  note: z.string().optional(),
});
export type ForfeitSchema = z.infer<typeof forfeitSchema>;

export const assignRefereeSchema = z.object({
  referee: z.string().uuid().nullable(),
});
export type AssignRefereeSchema = z.infer<typeof assignRefereeSchema>;

export const matchResultSchema = z.object({
  home_score: z.coerce.number().min(0),
  away_score: z.coerce.number().min(0),
  result_type: z.enum(["normal", "extra_time", "penalties", "forfeit"]),
});
export type MatchResultSchema = z.infer<typeof matchResultSchema>;

export const penaltyKickSchema = z.object({
  team: z.string().uuid(),
  roster_membership: z.string().uuid().optional().nullable(),
  scored: z.boolean(),
});
export type PenaltyKickSchema = z.infer<typeof penaltyKickSchema>;
