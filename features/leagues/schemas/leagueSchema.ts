import { z } from 'zod';

export const leagueSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string().optional(),
  city: z.string().min(1, 'La ciudad es requerida'),
  country: z.string().min(1, 'El país es requerido'),
  logo: z.string().optional(),
  background_image: z.string().optional(),
});

export type LeagueSchema = z.infer<typeof leagueSchema>;
