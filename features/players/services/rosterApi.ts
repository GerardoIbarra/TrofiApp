import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import {
  RegisterTournamentPlayerSchema,
  AssignRosterSchema,
} from "../schemas/rosterSchema";
import { CreateJoinRequestSchema } from "../schemas/joinRequestSchema";

export const useRegisterTournamentPlayer = () => {
  return useMutation({
    mutationFn: async (data: RegisterTournamentPlayerSchema) => {
      const response = await api.post("/v1/tournament-players/", data);
      return response;
    },
  });
};

export const useAssignToRoster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignRosterSchema) => {
      const response = await api.post("/v1/roster/", data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["roster", variables.tournament_team],
      });
    },
  });
};

export const useCreateJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJoinRequestSchema) => {
      const response = await api.post("/v1/join-requests/", data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["join-requests", variables.tournament_team],
      });
    },
  });
};

export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await api.post(`/v1/join-requests/${requestId}/approve/`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["roster"] });
    },
  });
};

export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await api.post(`/v1/join-requests/${requestId}/reject/`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join-requests"] });
    },
  });
};
