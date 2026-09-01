import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { DisciplinaryRecord, Suspension, CreateManualSuspensionData } from "../schemas/disciplineSchema";

export const useGetDisciplinaryRecords = (params: { tournament?: string; roster_membership?: string }) => {
  return useQuery({
    queryKey: ["disciplinary-records", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.tournament) searchParams.append("tournament", params.tournament);
      if (params.roster_membership) searchParams.append("roster_membership", params.roster_membership);

      const response = await api.get<{ results: DisciplinaryRecord[] }>(`/v1/disciplinary-records/?${searchParams.toString()}`);
      return response;
    },
    enabled: !!params.tournament || !!params.roster_membership,
  });
};

export const useGetActiveSuspensions = (tournamentId: string) => {
  return useQuery({
    queryKey: ["suspensions", "active", tournamentId],
    queryFn: async () => {
      const response = await api.get<{ results: Suspension[] }>(`/v1/suspensions/?tournament=${tournamentId}&is_active=true`);
      return response;
    },
    enabled: !!tournamentId,
  });
};

export const useLiftSuspension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suspensionId: string) => {
      const response = await api.post(`/v1/suspensions/${suspensionId}/lift/`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suspensions"] });
    },
  });
};

export const useCreateManualSuspension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateManualSuspensionData) => {
      const response = await api.post("/v1/suspensions/", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suspensions"] });
      queryClient.invalidateQueries({ queryKey: ["disciplinary-records"] });
    },
  });
};
