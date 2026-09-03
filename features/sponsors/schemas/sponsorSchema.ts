import { z } from 'zod';

export const PlacementTypeEnum = z.enum(['standings_banner', 'match_banner', 'share_card']);

export const SponsorPlacementSchema = z.object({
  id: z.string(),
  sponsor: z.string(),
  sponsor_name: z.string().optional(),
  sponsor_logo: z.string().nullable().optional(),
  sponsor_website: z.string().nullable().optional(),
  league: z.string().nullable().optional(),
  league_name: z.string().nullable().optional(),
  tournament: z.string().nullable().optional(),
  tournament_name: z.string().nullable().optional(),
  team: z.string().nullable().optional(),
  team_name: z.string().nullable().optional(),
  placement_type: PlacementTypeEnum,
  image_url: z.string().nullable().optional(),
  redirect_url: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  impressions: z.number().default(0),
  clicks: z.number().default(0),
  is_active: z.boolean().default(true),
  is_expired: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateSponsorPlacementSchema = z
  .object({
    league: z.string().optional(),
    tournament: z.string().optional(),
    team: z.string().optional(),
    placement_type: PlacementTypeEnum,
    starts_at: z.string().min(1, 'Fecha de inicio requerida'),
    ends_at: z.string().min(1, 'Fecha de fin requerida'),
    image_url: z.string().optional(),
    redirect_url: z.string().optional(),
    title: z.string().optional(),
  })
  .refine(
    (data) => {
      const targets = [data.league, data.tournament, data.team].filter(Boolean);
      return targets.length === 1;
    },
    {
      message: 'Debe especificar exactamente uno entre liga, torneo o equipo.',
      path: ['league'],
    }
  );

export const RenewPlacementSchema = z.object({
  extend_days: z.number().int().positive().default(30),
});
