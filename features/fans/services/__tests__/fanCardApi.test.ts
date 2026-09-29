import api, { API_BASE_URL } from "@/services/api";
import {
  getFanCardImageUrl,
  useGetFanCards,
  useGetFanCard,
  useGetActiveFanCard,
} from "../fanCardApi";
import { useQuery } from "@tanstack/react-query";

jest.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
  API_BASE_URL: "https://api.trofi.club/api",
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((config) => ({
    ...config,
    data: undefined,
  })),
}));

describe("fanCardApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getFanCardImageUrl", () => {
    it("builds the expected image URL", () => {
      const url = getFanCardImageUrl("card-123");
      expect(url).toBe("https://api.trofi.club/api/v1/fan-cards/card-123/image/");
    });
  });

  describe("useGetFanCards", () => {
    const validUserId = "123e4567-e89b-12d3-a456-426614174000";

    it("configures queryKey and enables query for valid user UUID", async () => {
      const queryConfig = (useGetFanCards as any)(validUserId);
      expect(queryConfig.queryKey).toEqual(["fan-cards", "user", validUserId]);
      expect(queryConfig.enabled).toBe(true);

      const mockResults = [
        {
          id: "fan-1",
          user: validUserId,
          overall: 74,
          passion: 10,
          loyalty: 3,
          verification: 8,
          recognition: 2,
          rarity: "gold",
        },
      ];
      (api.get as jest.Mock).mockResolvedValueOnce({ results: mockResults });

      const data = await queryConfig.queryFn();
      expect(api.get).toHaveBeenCalledWith(`/v1/fan-cards/?user=${validUserId}`);
      expect(data).toEqual(mockResults);
    });

    it("handles direct array response from backend defensively", async () => {
      const queryConfig = (useGetFanCards as any)(validUserId);
      const mockResults = [{ id: "fan-direct", overall: 68 }];
      (api.get as jest.Mock).mockResolvedValueOnce(mockResults);

      const data = await queryConfig.queryFn();
      expect(data).toEqual(mockResults);
    });

    it("disables query and returns empty array if user ID is demo or placeholder", async () => {
      const queryConfig = (useGetFanCards as any)("demo");
      expect(queryConfig.enabled).toBe(false);

      const data = await queryConfig.queryFn();
      expect(data).toEqual([]);
      expect(api.get).not.toHaveBeenCalled();
    });

    it("disables query if user ID is null or undefined", async () => {
      const queryConfig = (useGetFanCards as any)(null);
      expect(queryConfig.enabled).toBe(false);

      const data = await queryConfig.queryFn();
      expect(data).toEqual([]);
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe("useGetFanCard", () => {
    const validCardId = "card-550e8400-e29b-41d4-a716-446655440000";

    it("configures detail query and calls GET /v1/fan-cards/{id}/", async () => {
      const queryConfig = (useGetFanCard as any)(validCardId);
      expect(queryConfig.queryKey).toEqual(["fan-cards", "detail", validCardId]);
      expect(queryConfig.enabled).toBe(true);

      const mockCard = {
        id: validCardId,
        overall: 82,
        rarity: "elite",
      };
      (api.get as jest.Mock).mockResolvedValueOnce(mockCard);

      const data = await queryConfig.queryFn();
      expect(api.get).toHaveBeenCalledWith(`/v1/fan-cards/${validCardId}/`);
      expect(data).toEqual(mockCard);
    });

    it("disables query and returns null for invalid or placeholder card ID", async () => {
      const queryConfig = (useGetFanCard as any)("placeholder");
      expect(queryConfig.enabled).toBe(false);

      const data = await queryConfig.queryFn();
      expect(data).toBeNull();
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe("useGetActiveFanCard", () => {
    it("returns null card when data is empty", () => {
      (useQuery as jest.Mock).mockReturnValueOnce({
        data: [],
        isLoading: false,
      });

      const res = useGetActiveFanCard("user-1");
      expect(res.card).toBeNull();
    });

    it("extracts the first card as active card when cards are present", () => {
      const cardA = { id: "card-a", overall: 70 };
      const cardB = { id: "card-b", overall: 65 };
      (useQuery as jest.Mock).mockReturnValueOnce({
        data: [cardA, cardB],
        isLoading: false,
      });

      const res = useGetActiveFanCard("user-1");
      expect(res.card).toEqual(cardA);
    });
  });
});
