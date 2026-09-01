import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import {
  ManualMatchSchema,
  ScheduleConfigSchema,
  GenerateScheduleSchema,
  ExtraTimeSchema,
} from "../schemas/matchSchema";
import { MatchAttendanceSummary, ConfirmAttendanceData, CaptainConfirmAttendanceData } from "../schemas/attendanceSchema";

export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ManualMatchSchema) => {
      const response = await api.post("/v1/matches/", data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["matches", variables.tournament],
      });
    },
  });
};

export const useUpdateScheduleConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, data }: { tournamentId: string; data: ScheduleConfigSchema }) => {
      const response = await api.put(`/v1/tournaments/${tournamentId}/schedule-config/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["schedule-config", variables.tournamentId],
      });
    },
  });
};

export const useGetScheduleConfig = (tournamentId: string) => {
  return useQuery({
    queryKey: ["schedule-config", tournamentId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(`/v1/tournaments/${tournamentId}/schedule-config/`);
        return response;
      } catch (error: any) {
        if (error?.response?.status === 404 || String(error).includes("404")) {
          return null; // Config no existe aún
        }
        throw error;
      }
    },
  });
};

export const useGenerateWeeklySchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, data }: { tournamentId: string; data: GenerateScheduleSchema }) => {
      const response = await api.post(`/v1/tournaments/${tournamentId}/generate-weekly-schedule/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["matches", variables.tournamentId],
      });
    },
  });
};

export const useGenerateRoundRobin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, data }: { tournamentId: string; data: GenerateScheduleSchema }) => {
      const response = await api.post(`/v1/tournaments/${tournamentId}/generate-schedule/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["matches", variables.tournamentId],
      });
    },
  });
};

export const useRecordExtraTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: ExtraTimeSchema }) => {
      const response = await api.post(`/v1/matches/${matchId}/record-extra-time/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["bracket"] });
    },
  });
};

export const useGetMatchAttendance = (matchId: string) => {
  return useQuery({
    queryKey: ["match-attendance", matchId],
    queryFn: async () => {
      const response = await api.get<MatchAttendanceSummary>(`/v1/matches/${matchId}/attendance-confirmations/`);
      return response;
    },
    enabled: !!matchId,
  });
};

export const useConfirmAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: ConfirmAttendanceData }) => {
      const response = await api.post(`/v1/matches/${matchId}/confirm-attendance/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match-attendance", variables.matchId] });
    },
  });
};

export const useCaptainConfirmAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: CaptainConfirmAttendanceData }) => {
      const response = await api.post(`/v1/matches/${matchId}/captain-confirm-attendance/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match-attendance", variables.matchId] });
    },
  });
};
