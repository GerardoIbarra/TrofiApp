import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { EnrollTeamSchema, SetCaptainSchema } from "../schemas/tournamentTeamSchema";

export const useEnrollTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EnrollTeamSchema) => {
      const response = await api.post("/v1/tournament-teams/", data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-teams", variables.tournament],
      });
    },
  });
};

export const useSetCaptain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentTeamId,
      data,
    }: {
      tournamentTeamId: string;
      data: SetCaptainSchema;
    }) => {
      const response = await api.post(
        `/v1/tournament-teams/${tournamentTeamId}/set_captain/`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-teams"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tournament-team-detail"],
      });
    },
  });
};
