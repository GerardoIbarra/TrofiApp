import { z } from "zod";

export const playerSchema = z.object({
  full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  nickname: z.string().min(2, "El apodo debe tener al menos 2 caracteres"),
  date_of_birth: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  phone: z.string().optional(),
  position: z.enum(["POR", "DEF", "MED", "DEL"] as const, {
    message: "Selecciona una posición técnica",
  }),
  overall_rating: z.number().min(1).max(99).default(50),
  pace: z.number().min(1).max(99).default(50),
  shooting: z.number().min(1).max(99).default(50),
  passing: z.number().min(1).max(99).default(50),
  dribbling: z.number().min(1).max(99).default(50),
  defense: z.number().min(1).max(99).default(50),
  physical: z.number().min(1).max(99).default(50),
  photo: z.string().min(1, "La foto es obligatoria"),
});

export type PlayerSchema = z.infer<typeof playerSchema>;
