import { useQuery } from "@tanstack/react-query";
import api, { API_BASE_URL } from "@/services/api";
import { FanCard } from "../types/fanCard";
import { isValidEntityId } from "@/features/matches/utils/matchValidation";

/**
 * Returns the URL for generated fan card image if supported.
 */
export function getFanCardImageUrl(cardId: string): string {
  return `${API_BASE_URL}/v1/fan-cards/${cardId}/image/`;
}

/**
 * Hook to fetch all fan cards belonging to a user.
 * Contract: GET /api/v1/fan-cards/?user=<uuid>
 * Read-only endpoint (automatically recalculated on fan check-in).
 */
export const useGetFanCards = (userId?: string | null, enabled = true) => {
  const isRealUser = isValidEntityId(userId) && enabled;
  return useQuery({
    queryKey: ["fan-cards", "user", userId],
    queryFn: async (): Promise<FanCard[]> => {
      if (!isRealUser || !userId) return [];
      const response = await api.get<any>(`/v1/fan-cards/?user=${userId}`);
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: isRealUser,
  });
};

/**
 * Hook to fetch the single detail of a fan card.
 * Contract: GET /api/v1/fan-cards/{id}/
 */
export const useGetFanCard = (cardId?: string | null, enabled = true) => {
  const isRealCard = isValidEntityId(cardId) && enabled;
  return useQuery({
    queryKey: ["fan-cards", "detail", cardId],
    queryFn: async (): Promise<FanCard | null> => {
      if (!isRealCard || !cardId) return null;
      return await api.get<FanCard>(`/v1/fan-cards/${cardId}/`);
    },
    enabled: isRealCard,
  });
};

/**
 * Helper hook to retrieve the current active/primary FanCard for a user.
 */
export const useGetActiveFanCard = (userId?: string | null, enabled = true) => {
  const query = useGetFanCards(userId, enabled);
  const activeCard: FanCard | null =
    query.data && query.data.length > 0 ? query.data[0] : null;

  return {
    ...query,
    card: activeCard,
  };
};
