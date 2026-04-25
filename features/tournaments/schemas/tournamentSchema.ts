import { z } from 'zod';

export const tournamentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  season_label: z.string().min(2, 'La etiqueta de temporada es requerida (ej. 2024-I)'),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().min(1, 'La fecha de fin es requerida'),
  status: z.enum(['draft', 'active', 'completed', 'canceled']).default('draft'),
});

export type TournamentSchema = z.infer<typeof tournamentSchema>;
