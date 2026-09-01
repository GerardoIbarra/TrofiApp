import { z } from "zod";

export const registerTournamentPlayerSchema = z.object({
  tournament: z.string().uuid("ID de torneo inválido"),
  player: z.string().uuid("ID de jugador inválido"),
});

export type RegisterTournamentPlayerSchema = z.infer<typeof registerTournamentPlayerSchema>;

export const assignRosterSchema = z.object({
  tournament: z.string().uuid("ID de torneo inválido"),
  tournament_player: z.string().uuid("ID de jugador de torneo inválido"),
  tournament_team: z.string().uuid("ID de equipo de torneo inválido"),
  shirt_number: z.coerce.number().min(0).max(99).optional(),
  position: z.enum(["gk", "def", "mid", "fwd"]).optional(),
});

export type AssignRosterSchema = z.infer<typeof assignRosterSchema>;
