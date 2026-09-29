import {
  playerAchievementSchema,
  playerCardSchema,
  playerStatsSchema,
} from "../playerProfileSchema";

describe("playerAchievementSchema", () => {
  const playerId = "123e4567-e89b-12d3-a456-426614174000";
  const tournamentId = "223e4567-e89b-12d3-a456-426614174000";

  it("parses a POTM (Jugador del Partido) achievement with match_id metadata", () => {
    const potmAchievement = {
      id: "323e4567-e89b-12d3-a456-426614174000",
      player: playerId,
      tournament: tournamentId,
      achievement_type: "potm",
      metadata: {
        match_id: "423e4567-e89b-12d3-a456-426614174000",
        computed_rating: 8.2,
      },
      awarded_at: "2026-09-28T20:00:00Z",
    };

    const result = playerAchievementSchema.safeParse(potmAchievement);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.achievement_type).toBe("potm");
      expect(result.data.metadata?.match_id).toBe("423e4567-e89b-12d3-a456-426614174000");
      expect(result.data.metadata?.computed_rating).toBe(8.2);
    }
  });

  it("parses a TOTW (Equipo de la Semana) achievement", () => {
    const totwAchievement = {
      id: "523e4567-e89b-12d3-a456-426614174000",
      player: playerId,
      tournament: tournamentId,
      achievement_type: "totw",
      metadata: {
        matchday: 4,
        avg_rating: 8.4,
      },
      awarded_at: "2026-09-28T20:00:00Z",
    };

    const result = playerAchievementSchema.safeParse(totwAchievement);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.achievement_type).toBe("totw");
      expect(result.data.metadata?.matchday).toBe(4);
    }
  });

  it("allows tournament: null for career milestone achievements", () => {
    const milestones = [
      "career_50_goals",
      "career_100_goals",
      "career_50_assists",
      "career_25_clean_sheets",
      "career_50_clean_sheets",
    ];

    for (const milestone of milestones) {
      const careerAchievement = {
        id: "623e4567-e89b-12d3-a456-426614174000",
        player: playerId,
        tournament: null,
        achievement_type: milestone,
        metadata: {
          lifetime_value: 50,
        },
        awarded_at: "2026-09-28T20:00:00Z",
      };

      const result = playerAchievementSchema.safeParse(careerAchievement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tournament).toBeNull();
        expect(result.data.achievement_type).toBe(milestone);
      }
    }
  });
});
