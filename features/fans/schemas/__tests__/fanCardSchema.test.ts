import {
  fanCardSchema,
  fanCardListResponseSchema,
  fanCardRaritySchema,
} from "../fanCardSchema";

describe("fanCardSchema", () => {
  const validFanCard = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    user: "223e4567-e89b-12d3-a456-426614174000",
    card_type: "season",
    card_type_display: "Temporada",
    overall: 74,
    passion: 12,
    loyalty: 4,
    verification: 10,
    recognition: 3,
    rarity: "gold",
    rarity_color: "#D4AF37",
    rarity_label: "Oro",
    theme: "champions",
    last_calculated_at: "2026-09-28T12:00:00Z",
  };

  it("successfully parses a valid fan card", () => {
    const result = fanCardSchema.safeParse(validFanCard);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overall).toBe(74);
      expect(result.data.passion).toBe(12);
      expect(result.data.loyalty).toBe(4);
      expect(result.data.verification).toBe(10);
      expect(result.data.recognition).toBe(3);
      expect(result.data.rarity).toBe("gold");
      expect(result.data.rarity_color).toBe("#D4AF37");
    }
  });

  it("applies default 0 for missing engagement stats", () => {
    const minimalCard = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      user: "223e4567-e89b-12d3-a456-426614174000",
      card_type: "base",
      overall: 60,
      rarity: "bronze",
      last_calculated_at: "2026-09-28T12:00:00Z",
    };
    const result = fanCardSchema.safeParse(minimalCard);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.passion).toBe(0);
      expect(result.data.loyalty).toBe(0);
      expect(result.data.verification).toBe(0);
      expect(result.data.recognition).toBe(0);
    }
  });

  it("validates the 5 shared rarity tiers", () => {
    const validRarities = ["bronze", "silver", "gold", "elite", "iconic"];
    for (const rarity of validRarities) {
      const res = fanCardRaritySchema.safeParse(rarity);
      expect(res.success).toBe(true);
    }
  });

  it("parses paginated list responses from GET /api/v1/fan-cards/?user=<uuid>", () => {
    const listPayload = {
      count: 1,
      next: null,
      previous: null,
      results: [validFanCard],
    };
    const result = fanCardListResponseSchema.safeParse(listPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.results).toHaveLength(1);
      expect(result.data.results[0].overall).toBe(74);
    }
  });
});
