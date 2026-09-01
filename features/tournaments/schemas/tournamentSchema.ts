import { z } from 'zod';

export const tournamentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  season_label: z.string().min(2, 'La etiqueta de temporada es requerida (ej. 2024-I)'),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().min(1, 'La fecha de fin es requerida'),
  status: z.enum(['draft', 'active', 'completed', 'canceled']).default('draft'),
  format: z.string().optional().default('11v11'),
  gender: z.enum(['mens', 'womens', 'mixed']).optional().default('mens'),
  champion_determination: z.enum(['standings', 'playoffs']).optional().default('standings'),
  knockout_tiebreaker: z.enum(['penalty_shootout', 'standings', 'away_goals']).optional().default('penalty_shootout'),
  max_teams: z.number().int().positive().optional(),
  min_age: z.number().int().nonnegative().optional(),
  max_age: z.number().int().positive().optional(),
});

export type TournamentSchema = z.infer<typeof tournamentSchema>;
