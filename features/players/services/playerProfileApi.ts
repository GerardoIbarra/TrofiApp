import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { PlayerStats, PlayerCard, PlayerAchievement } from "../schemas/playerProfileSchema";
import { PlayerProfileResponse } from "../types/playerProfile";

export const useGetPlayerProfile = (playerId?: string, tournamentId?: string) => {
  return useQuery({
    queryKey: ["player-profile", playerId, tournamentId],
    queryFn: async () => {
      if (!playerId) throw new Error("Player ID is required");
      const url = tournamentId
        ? `/v1/players/${playerId}/profile/?tournament=${tournamentId}`
        : `/v1/players/${playerId}/profile/`;
      const response = await api.get<PlayerProfileResponse>(url);
      return response;
    },
    enabled: !!playerId,
  });
};

export const useGetPlayerStats = (tournamentId: string, playerId: string) => {
  return useQuery({
    queryKey: ["player-stats", tournamentId, playerId],
    queryFn: async () => {
      const response = await api.get<PlayerStats[]>(`/v1/player-stats/?tournament=${tournamentId}&player=${playerId}`);
      return response.length > 0 ? response[0] : null;
    },
    enabled: !!tournamentId && !!playerId,
  });
};

export const useGetPlayerCards = (playerId: string) => {
  return useQuery({
    queryKey: ["player-cards", playerId],
    queryFn: async () => {
      const response = await api.get<PlayerCard[]>(`/v1/player-cards/?player=${playerId}`);
      return response;
    },
    enabled: !!playerId,
  });
};

export const useGetPlayerAchievements = (playerId: string) => {
  return useQuery({
    queryKey: ["player-achievements", playerId],
    queryFn: async () => {
      const response = await api.get<PlayerAchievement[]>(`/v1/player-achievements/?player=${playerId}`);
      return response;
    },
    enabled: !!playerId,
  });
};
