import { useQuery } from "@tanstack/react-query";
import api, { API_BASE_URL } from "@/services/api";
import { PlayerStats, PlayerCard, PlayerAchievement } from "../schemas/playerProfileSchema";
import { PlayerProfileResponse, CardHistoryItem } from "../types/playerProfile";
import { isValidEntityId } from "@/features/matches/utils/matchValidation";

/**
 * Returns the URL to download or share the generated player card PNG image.
 * Contract: GET /api/v1/player-cards/{id}/image/
 */
export function getPlayerCardImageUrl(cardId: string): string {
  return `${API_BASE_URL}/v1/player-cards/${cardId}/image/`;
}

/**
 * Returns the URL to view the HTML preview of the player card.
 * Contract: GET /api/v1/players/{id}/card/
 */
export function getPlayerCardHtmlPreviewUrl(playerId: string): string {
  return `${API_BASE_URL}/v1/players/${playerId}/card/`;
}

export const useGetPlayerProfile = (playerId?: string, tournamentId?: string) => {
  const isRealPlayer = isValidEntityId(playerId);
  return useQuery({
    queryKey: ["player-profile", playerId, tournamentId],
    queryFn: async () => {
      if (!isRealPlayer || !playerId) throw new Error("Player ID is required");
      const url = tournamentId && isValidEntityId(tournamentId)
        ? `/v1/players/${playerId}/profile/?tournament=${tournamentId}`
        : `/v1/players/${playerId}/profile/`;
      const response = await api.get<PlayerProfileResponse>(url);
      return response;
    },
    enabled: isRealPlayer,
  });
};

export const useGetPlayerStats = (tournamentId: string, playerId: string) => {
  const isValid = isValidEntityId(tournamentId) && isValidEntityId(playerId);
  return useQuery({
    queryKey: ["player-stats", tournamentId, playerId],
    queryFn: async () => {
      if (!isValid) return null;
      const response = await api.get<PlayerStats[]>(`/v1/player-stats/?tournament=${tournamentId}&player=${playerId}`);
      return response.length > 0 ? response[0] : null;
    },
    enabled: isValid,
  });
};

/**
 * Hook to fetch all cards belonging to a player (per tournament, history, special cards).
 * Contract: GET /api/v1/player-cards/?player=<uuid>
 */
export const useGetPlayerCards = (playerId?: string | null) => {
  const isRealPlayer = isValidEntityId(playerId);
  return useQuery({
    queryKey: ["player-cards", playerId],
    queryFn: async (): Promise<PlayerCard[]> => {
      if (!isRealPlayer || !playerId) return [];
      const response = await api.get<any>(`/v1/player-cards/?player=${playerId}`);
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: isRealPlayer,
  });
};

/**
 * Hook to fetch the single detail of a player card.
 * Contract: GET /api/v1/player-cards/{id}/
 */
export const useGetPlayerCard = (cardId?: string | null) => {
  const isRealCard = isValidEntityId(cardId);
  return useQuery({
    queryKey: ["player-card-detail", cardId],
    queryFn: async (): Promise<PlayerCard | null> => {
      if (!isRealCard || !cardId) return null;
      return await api.get<PlayerCard>(`/v1/player-cards/${cardId}/`);
    },
    enabled: isRealCard,
  });
};

/**
 * Hook to fetch the evolution history ("cartas retro") of a card.
 * Contract: GET /api/v1/card-history/?card=<uuid>
 */
export const useGetCardHistory = (cardId?: string | null) => {
  const isRealCard = isValidEntityId(cardId);
  return useQuery({
    queryKey: ["card-history", cardId],
    queryFn: async (): Promise<CardHistoryItem[]> => {
      if (!isRealCard || !cardId) return [];
      const response = await api.get<any>(`/v1/card-history/?card=${cardId}`);
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: isRealCard,
  });
};

export const useGetPlayerAchievements = (playerId?: string | null) => {
  const isRealPlayer = isValidEntityId(playerId);
  return useQuery({
    queryKey: ["player-achievements", playerId],
    queryFn: async () => {
      if (!isRealPlayer || !playerId) return [];
      const response = await api.get<PlayerAchievement[]>(`/v1/player-achievements/?player=${playerId}`);
      return response;
    },
    enabled: isRealPlayer,
  });
};
