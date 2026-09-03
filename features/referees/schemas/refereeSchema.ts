import { z } from 'zod';

export const SetRefereeAvailabilitySchema = z.object({
  is_open: z.boolean(),
  notes: z.string().max(255).optional(),
});

export type SetRefereeAvailabilityFormData = z.infer<typeof SetRefereeAvailabilitySchema>;

export const OfferRefereeSchema = z.object({
  referee: z.string().uuid('Debe ser un UUID válido de árbitro'),
});

export type OfferRefereeFormData = z.infer<typeof OfferRefereeSchema>;

export const RateRefereeSchema = z.object({
  stars: z
    .number()
    .int('La calificación debe ser un número entero')
    .min(1, 'Mínimo 1 estrella')
    .max(5, 'Máximo 5 estrellas'),
});

export type RateRefereeFormData = z.infer<typeof RateRefereeSchema>;
