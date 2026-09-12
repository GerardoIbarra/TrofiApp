import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import {
  TeamProfileResponse,
  TeamHistoryResponse,
  CreateTeamAchievementPayload,
  TeamAchievementResponse,
} from "../types/teamProfile";

export const useGetTeamProfile = (teamId?: string, tournamentId?: string) => {
  return useQuery({
    queryKey: ["team-profile", teamId, tournamentId],
    queryFn: async () => {
      if (!teamId) throw new Error("Team ID is required");
      const url = tournamentId
        ? `/v1/teams/${teamId}/profile/?tournament=${tournamentId}`
        : `/v1/teams/${teamId}/profile/`;
      const response = await api.get<TeamProfileResponse>(url);
      return response;
    },
    enabled: !!teamId,
  });
};

export const useGetTeamHistory = (teamId?: string) => {
  return useQuery({
    queryKey: ["team-history", teamId],
    queryFn: async () => {
      if (!teamId) throw new Error("Team ID is required");
      const response = await api.get<TeamHistoryResponse>(`/v1/teams/${teamId}/history/`);
      return response;
    },
    enabled: !!teamId,
  });
};

export const useAwardTeamAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTeamAchievementPayload): Promise<TeamAchievementResponse> => {
      return await api.post<TeamAchievementResponse>("/v1/team-achievements/", payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team-profile", variables.team] });
      queryClient.invalidateQueries({ queryKey: ["team-history", variables.team] });
      queryClient.invalidateQueries({ queryKey: ["tournament", variables.tournament] });
    },
  });
};
