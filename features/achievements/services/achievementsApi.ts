import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import {
  Achievement,
  AchievementListResponse,
  CreateLeagueAchievementPayload,
} from '../types/achievement';
import { isValidEntityId } from '@/features/matches/utils/matchValidation';

export const useGetUserAchievements = (userId?: string) => {
  const isRealUser = isValidEntityId(userId);

  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: async (): Promise<Achievement[]> => {
      if (!isRealUser || !userId) return [];
      const response = await api.get<AchievementListResponse | Achievement[]>(
        `/v1/achievements/?user=${userId}`
      );
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: isRealUser,
  });
};

export const useGetLeagueAchievements = (leagueId?: string) => {
  const isRealLeague = isValidEntityId(leagueId);

  return useQuery({
    queryKey: ['league-achievements', leagueId],
    queryFn: async (): Promise<Achievement[]> => {
      if (!isRealLeague || !leagueId) return [];
      const response = await api.get<AchievementListResponse | Achievement[]>(
        `/v1/achievements/?league=${leagueId}`
      );
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: isRealLeague,
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
