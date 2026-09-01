import { z } from "zod";

export const venueSchema = z.object({
  name: z.string().min(1, "El nombre de la sede es obligatorio"),
  city: z.string().optional(),
  league: z.string().uuid().optional(), // Si no tiene league, es pública
});
export type VenueSchema = z.infer<typeof venueSchema>;

export const fieldSchema = z.object({
  venue: z.string().uuid("ID de sede inválido"),
  name: z.string().min(1, "El nombre de la cancha es obligatorio"),
  surface: z.enum(["grass", "turf", "indoor", "dirt", "other"]).optional(),
});
export type FieldSchema = z.infer<typeof fieldSchema>;
