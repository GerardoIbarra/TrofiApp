import { z } from "zod";

export const createJoinRequestSchema = z.object({
  tournament: z.string().uuid("ID de torneo inválido"),
  tournament_team: z.string().uuid("ID de equipo de torneo inválido"),
  player: z.string().uuid("ID de jugador inválido"),
});

export type CreateJoinRequestSchema = z.infer<typeof createJoinRequestSchema>;
