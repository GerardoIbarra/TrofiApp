import { z } from "zod";

export const qualifyTeamsSchema = z.object({
  source_tournament_ids: z.array(z.union([
    z.string().uuid(),
    z.object({
      id: z.string().uuid(),
      top_n: z.coerce.number().min(1)
    })
  ])).min(1, "Selecciona al menos un torneo fuente"),
  top_n: z.coerce.number().min(1).default(3),
});
export type QualifyTeamsSchema = z.infer<typeof qualifyTeamsSchema>;

export const qualifyFromGroupsSchema = z.object({
  top_n_per_group: z.coerce.number().min(1).default(2),
  group_top_n: z.record(z.coerce.number()).optional(),
});
export type QualifyFromGroupsSchema = z.infer<typeof qualifyFromGroupsSchema>;

export const createBracketSchema = z.object({
  seeded_team_ids: z.array(z.string().uuid()).optional(),
});
export type CreateBracketSchema = z.infer<typeof createBracketSchema>;

export const assignMatchToSlotSchema = z.object({
  match_id: z.string().uuid().optional(),
  start_datetime: z.string().optional(), // ISO string date
  venue_name: z.string().optional(),
  leg: z.coerce.number().optional(), // 2 for return leg
}).refine(data => data.match_id || data.start_datetime, {
  message: "Debe proveer match_id o start_datetime",
});
export type AssignMatchToSlotSchema = z.infer<typeof assignMatchToSlotSchema>;
