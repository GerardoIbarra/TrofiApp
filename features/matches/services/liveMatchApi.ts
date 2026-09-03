import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { metrics } from "@/services/metrics";
import {
  MatchEventSchema,
  SubstituteSchema,
  ChangeStatusSchema,
  ForfeitSchema,
  AssignRefereeSchema,
  MatchResultSchema,
  PenaltyKickSchema,
} from "../schemas/liveMatchSchema";

// 1. Arrancar el partido
export const useStartMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await api.post(`/v1/matches/${matchId}/start/`);
      return response;
    },
    onSuccess: (_, matchId) => {
      metrics.trackMatchLiveAction('started', matchId);
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

// 2. Cargar eventos en vivo
export const useAddMatchEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MatchEventSchema) => {
      const response = await api.post("/v1/match-events/", data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.match] });
      queryClient.invalidateQueries({ queryKey: ["timeline", variables.match] });
    },
  });
};

// 3. Sustituciones
export const useSubstitute = (matchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubstituteSchema) => {
      const response = await api.post(`/v1/matches/${matchId}/substitute/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["timeline", matchId] });
      queryClient.invalidateQueries({ queryKey: ["lineup", matchId] });
    },
  });
};

// 4. Pausar y reanudar
export const usePauseMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await api.post(`/v1/matches/${matchId}/pause/`);
      return response;
    },
    onSuccess: (_, matchId) => {
      metrics.trackMatchLiveAction('paused', matchId);
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
};

export const useResumeMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await api.post(`/v1/matches/${matchId}/resume/`);
      return response;
    },
    onSuccess: (_, matchId) => {
      metrics.trackMatchLiveAction('resumed', matchId);
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
};

// 5. Terminar el partido
export const useEndMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await api.post(`/v1/matches/${matchId}/end/`);
      return response;
    },
    onSuccess: (_, matchId) => {
      metrics.trackMatchLiveAction('ended', matchId);
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

// 6. Cambiar el estado directamente
export const useChangeMatchStatus = (matchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ChangeStatusSchema) => {
      const response = await api.post(`/v1/matches/${matchId}/change-status/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

// 6.1. Declarar forfeit
export const useForfeitMatch = (matchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ForfeitSchema) => {
      const response = await api.post(`/v1/matches/${matchId}/forfeit/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

// 7. Asignar árbitro
export const useAssignReferee = (matchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssignRefereeSchema) => {
      const response = await api.post(`/v1/matches/${matchId}/assign-referee/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
};

// 8. Ajustar el resultado manualmente y bloquearlo
export const useSetMatchResult = (matchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MatchResultSchema) => {
      const response = await api.post(`/v1/matches/${matchId}/result/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
};

export const useLockResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await api.post(`/v1/matches/${matchId}/lock_result/`);
      return response;
    },
    onSuccess: (_, matchId) => {
      metrics.trackMatchLiveAction('locked', matchId);
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
};

// 8.1. Definición por penales
export const useGetPenaltyShootout = (matchId: string) => {
  return useQuery({
    queryKey: ["penalty-shootout", matchId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(`/v1/matches/${matchId}/penalty-shootout/`);
        return response;
      } catch (error: any) {
        if (error?.status === 404 || error?.data?.detail?.includes("Not found")) {
          return null;
        }
        throw error;
      }
    },
  });
};

export const useAddPenaltyKick = (matchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PenaltyKickSchema) => {
      const response = await api.post(`/v1/matches/${matchId}/add-penalty-kick/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalty-shootout", matchId] });
    },
  });
};

export const useLockPenaltyShootout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await api.post(`/v1/matches/${matchId}/lock-penalty-shootout/`);
      return response;
    },
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ["penalty-shootout", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["bracket"] }); // Updates playoff advancement
    },
  });
};
