import { z } from 'zod';

export const tournamentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  season_label: z.string().min(2, 'La etiqueta de temporada es requerida (ej. 2024-I)'),
  description: z.string().optional().default(''),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().min(1, 'La fecha de fin es requerida'),
  status: z.enum(['draft', 'active', 'completed', 'canceled']).default('draft'),
  format: z.string().optional().default('11v11'),
  gender: z.enum(['mens', 'womens', 'mixed']).optional().default('mens'),
  registration_open: z.boolean().optional().default(true),
  champion_determination: z.enum(['standings', 'playoffs']).optional().default('standings'),
  standings_tiebreaker: z.enum(['goal_difference', 'head_to_head']).optional().default('goal_difference'),
  knockout_tiebreaker: z.enum(['penalty_shootout', 'standings', 'away_goals']).optional().default('penalty_shootout'),
  extra_time_enabled: z.boolean().optional().default(false),
  two_legged_knockout: z.boolean().optional().default(false),
  max_teams: z.preprocess((val) => (val === '' || val === undefined || val === null ? undefined : Number(val)), z.number().int().positive().optional()),
  min_age: z.preprocess((val) => (val === '' || val === undefined || val === null ? undefined : Number(val)), z.number().int().nonnegative().optional()),
  max_age: z.preprocess((val) => (val === '' || val === undefined || val === null ? undefined : Number(val)), z.number().int().positive().optional()),
  features: z.object({
    inherit_from_league: z.boolean().optional().default(false),
    discipline_enabled: z.boolean().optional().default(true),
    payments_enabled: z.boolean().optional().default(true),
    comms_enabled: z.boolean().optional().default(true),
    qr_checkin_enabled: z.boolean().optional().default(true),
    player_market_enabled: z.boolean().optional().default(false),
    sponsors_enabled: z.boolean().optional().default(false),
    referee_marketplace_enabled: z.boolean().optional().default(false),
  }).optional(),
});

export type TournamentSchema = z.infer<typeof tournamentSchema>;
