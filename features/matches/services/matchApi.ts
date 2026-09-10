import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { metrics } from "@/services/metrics";
import {
  ManualMatchSchema,
  ScheduleConfigSchema,
  GenerateScheduleSchema,
  ExtraTimeSchema,
} from "../schemas/matchSchema";
import { MatchAttendanceSummary, ConfirmAttendanceData, CaptainConfirmAttendanceData } from "../schemas/attendanceSchema";
import { FanCheckInRequest, FanCheckInResponse } from "../types/fanCheckIn";
import {
  MVPVoteTallyResponse,
  VoteMVPPayload,
  VoteMVPResponse,
  LockMVPVoteResponse,
} from "../types/mvpVoting";

export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ManualMatchSchema) => {
      const response = await api.post("/v1/matches/", data);
      return response;
    },
    onSuccess: (_, variables) => {
      metrics.trackMatchCreated(variables.tournament);
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
      metrics.trackScheduleGenerated('weekly', variables.tournamentId);
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
      metrics.trackScheduleGenerated('round_robin', variables.tournamentId);
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
    onMutate: async ({ matchId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["match-attendance", matchId] });
      const previousData = queryClient.getQueryData<MatchAttendanceSummary>(["match-attendance", matchId]);

      if (previousData) {
        const optimisticData = { ...previousData };
        // Simple optimistic approach: Assume user is on home team for visual bounce.
        // In a real app we'd pass userTeamId to this hook.
        if (data.status === 'confirmed') optimisticData.home.confirmed += 1;
        else if (data.status === 'declined') optimisticData.home.declined += 1;
        
        queryClient.setQueryData(["match-attendance", matchId], optimisticData);
      }

      return { previousData, matchId };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["match-attendance", context.matchId], context.previousData);
      }
    },
    onSuccess: (_, variables) => {
      metrics.trackAttendanceConfirmation(variables.data.status, variables.matchId);
    },
    onSettled: (_, __, variables) => {
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
      metrics.trackCaptainAttendance(variables.data.roster_membership_ids?.length || 0, variables.matchId);
      queryClient.invalidateQueries({ queryKey: ["match-attendance", variables.matchId] });
    },
  });
};

export const useFanCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      data,
    }: {
      matchId: string;
      data: FanCheckInRequest;
    }): Promise<FanCheckInResponse> => {
      let body: any = {};
      if (data.latitude !== undefined && data.latitude !== null) body.latitude = data.latitude;
      if (data.longitude !== undefined && data.longitude !== null) body.longitude = data.longitude;
      if (data.photo) body.photo = data.photo;

      return await api.post<FanCheckInResponse>(`/v1/matches/${matchId}/fan-checkin/`, body);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ["fan-checkin", variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
    },
  });
};

export const useGetMVPVotes = (matchId: string, enabled = true) => {
  return useQuery({
    queryKey: ["mvp-votes", matchId],
    queryFn: async (): Promise<MVPVoteTallyResponse> => {
      return await api.get<MVPVoteTallyResponse>(`/v1/matches/${matchId}/vote-mvp/`);
    },
    enabled: !!matchId && enabled,
    refetchInterval: 10000, // Poll every 10s during live voting
  });
};

export const useVoteMVP = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VoteMVPPayload): Promise<VoteMVPResponse> => {
      return await api.post<VoteMVPResponse>(`/v1/matches/${matchId}/vote-mvp/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mvp-votes", matchId] });
    },
  });
};

export const useLockMVPVote = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<LockMVPVoteResponse> => {
      return await api.post<LockMVPVoteResponse>(`/v1/matches/${matchId}/lock-mvp-vote/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mvp-votes", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
};

