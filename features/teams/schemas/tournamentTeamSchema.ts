import { z } from "zod";

export const enrollTeamSchema = z.object({
  tournament: z.string().uuid("ID de torneo inválido"),
  team: z.string().uuid("Debe seleccionar un equipo"),
  group: z.string().optional(),
});

export type EnrollTeamSchema = z.infer<typeof enrollTeamSchema>;

export const setCaptainSchema = z.object({
  user: z.string().uuid("ID de usuario inválido"),
});

export type SetCaptainSchema = z.infer<typeof setCaptainSchema>;
