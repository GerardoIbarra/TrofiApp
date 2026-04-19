import { z } from 'zod';

export const teamSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  city: z.string().min(1, 'La ciudad es requerida'),
  league: z.string().uuid('Debes seleccionar una liga válida'),
});

export type TeamSchema = z.infer<typeof teamSchema>;
