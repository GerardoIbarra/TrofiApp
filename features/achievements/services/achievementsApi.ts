import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import {
  Achievement,
  AchievementListResponse,
  CreateLeagueAchievementPayload,
} from '../types/achievement';

export const useGetUserAchievements = (userId?: string) => {
  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: async (): Promise<Achievement[]> => {
      if (!userId) return [];
      const response = await api.get<AchievementListResponse | Achievement[]>(
        `/v1/achievements/?user=${userId}`
      );
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: !!userId,
  });
};

export const useGetLeagueAchievements = (leagueId?: string) => {
  return useQuery({
    queryKey: ['league-achievements', leagueId],
    queryFn: async (): Promise<Achievement[]> => {
      if (!leagueId) return [];
      const response = await api.get<AchievementListResponse | Achievement[]>(
        `/v1/achievements/?league=${leagueId}`
      );
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: !!leagueId,
  });
};

export const useSpotlightLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeagueAchievementPayload): Promise<Achievement> => {
      return await api.post<Achievement>('/v1/achievements/', data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['league-achievements', variables.league] });
      queryClient.invalidateQueries({ queryKey: ['league', variables.league] });
    },
  });
};
