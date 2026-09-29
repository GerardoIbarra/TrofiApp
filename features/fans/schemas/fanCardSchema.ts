import { z } from "zod";

export const fanCardRaritySchema = z.enum([
  "bronze",
  "silver",
  "gold",
  "elite",
  "iconic",
]);

export const fanCardTypeSchema = z.enum(["base", "season", "special"]);

export const fanCardSchema = z.object({
  id: z.string().uuid(),
  user: z.string().uuid(),
  card_type: fanCardTypeSchema.or(z.string()),
  card_type_display: z.string().optional().nullable(),
  overall: z.number(),
  passion: z.number().default(0),
  loyalty: z.number().default(0),
  verification: z.number().default(0),
  recognition: z.number().default(0),
  rarity: fanCardRaritySchema.or(z.string()),
  rarity_color: z.string().optional().nullable(),
  rarity_label: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
  last_calculated_at: z.string(),
});

export type FanCardSchemaType = z.infer<typeof fanCardSchema>;

export const fanCardListResponseSchema = z.object({
  count: z.number().optional(),
  next: z.string().optional().nullable(),
  previous: z.string().optional().nullable(),
  results: z.array(fanCardSchema),
});

export type FanCardListResponseType = z.infer<typeof fanCardListResponseSchema>;
