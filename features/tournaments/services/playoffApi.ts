import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import {
  QualifyTeamsSchema,
  QualifyFromGroupsSchema,
  CreateBracketSchema,
  AssignMatchToSlotSchema,
} from "../schemas/playoffSchema";

export const useQualifyTeams = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playoffTournamentId, data }: { playoffTournamentId: string; data: QualifyTeamsSchema }) => {
      const response = await api.post(`/v1/tournaments/${playoffTournamentId}/qualify-teams/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-teams", variables.playoffTournamentId] });
    },
  });
};

export const useQualifyFromGroups = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, data }: { tournamentId: string; data: QualifyFromGroupsSchema }) => {
      const response = await api.post(`/v1/tournaments/${tournamentId}/qualify-from-groups/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-teams", variables.tournamentId] });
    },
  });
};

export const useCreateBracket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, data }: { tournamentId: string; data: CreateBracketSchema }) => {
      const response = await api.post(`/v1/tournaments/${tournamentId}/create-bracket/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bracket", variables.tournamentId] });
    },
  });
};

export const useGetBracket = (tournamentId: string) => {
  return useQuery({
    queryKey: ["bracket", tournamentId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(`/v1/tournaments/${tournamentId}/bracket/`);
        return response;
      } catch (error: any) {
        if (error?.response?.status === 404 || String(error).includes("404")) {
          return null; // Bracket not created yet
        }
        throw error;
      }
    },
  });
};

export const useAssignMatchToSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentId,
      slotId,
      data,
    }: {
      tournamentId: string;
      slotId: string;
      data: AssignMatchToSlotSchema;
    }) => {
      const response = await api.post(`/v1/tournaments/${tournamentId}/bracket/slots/${slotId}/assign-match/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bracket", variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["matches", variables.tournamentId] });
    },
  });
};
