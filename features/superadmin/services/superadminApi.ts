import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import {
  PlatformSummary,
  PaymentRecordSummary,
  PaymentRecord,
  CreatePaymentRecordData,
  SetPaymentStatusData,
} from '../types/superadmin';
import { League } from '@/features/leagues/types/league';
import { Tournament } from '@/features/tournaments/types/tournament';

export const useGetPlatformSummary = () => {
  return useQuery({
    queryKey: ['platform-summary'],
    queryFn: async () => {
      const response = await api.get<PlatformSummary>('/v1/leagues/platform-summary/');
      return response;
    },
  });
};

export const useGetPaymentSummary = () => {
  return useQuery({
    queryKey: ['payment-summary'],
    queryFn: async () => {
      const response = await api.get<PaymentRecordSummary>('/v1/payment-records/summary/');
      return response;
    },
  });
};

export const useGetPendingLeagues = () => {
  return useQuery({
    queryKey: ['pending-leagues'],
    queryFn: async () => {
      const response = await api.get<any>('/v1/leagues/?approval_status=pending');
      const results: League[] = Array.isArray(response)
        ? response
        : response?.results || [];
      return results;
    },
  });
};

export const useGetPendingTournaments = () => {
  return useQuery({
    queryKey: ['pending-tournaments'],
    queryFn: async () => {
      const response = await api.get<any>('/v1/tournaments/?approval_status=pending');
      const results: Tournament[] = Array.isArray(response)
        ? response
        : response?.results || [];
      return results;
    },
  });
};

export const useGetOverdueLeagues = () => {
  return useQuery({
    queryKey: ['overdue-leagues'],
    queryFn: async () => {
      const response = await api.get<any>('/v1/leagues/?payment_status=overdue');
      const results: League[] = Array.isArray(response)
        ? response
        : response?.results || [];
      return results;
    },
  });
};

export const useApproveLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leagueId: string) => {
      const response = await api.post<League>(`/v1/leagues/${leagueId}/approve/`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-leagues'] });
      queryClient.invalidateQueries({ queryKey: ['platform-summary'] });
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
    },
  });
};

export const useRejectLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leagueId: string) => {
      const response = await api.post<League>(`/v1/leagues/${leagueId}/reject/`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-leagues'] });
      queryClient.invalidateQueries({ queryKey: ['platform-summary'] });
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
    },
  });
};

export const useApproveTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await api.post<Tournament>(`/v1/tournaments/${tournamentId}/approve/`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['platform-summary'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};

export const useRejectTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await api.post<Tournament>(`/v1/tournaments/${tournamentId}/reject/`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['platform-summary'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};

export const useCreatePaymentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentRecordData) => {
      const response = await api.post<PaymentRecord>('/v1/payment-records/', data as any);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['platform-summary'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-leagues'] });
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
    },
  });
};

export const useSetLeaguePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leagueId, data }: { leagueId: string; data: SetPaymentStatusData }) => {
      const response = await api.post<League>(`/v1/leagues/${leagueId}/set-payment-status/`, data as any);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overdue-leagues'] });
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      queryClient.invalidateQueries({ queryKey: ['platform-summary'] });
    },
  });
};

export const useGetPaymentRecords = () => {
  return useQuery({
    queryKey: ['payment-records'],
    queryFn: async () => {
      const response = await api.get<any>('/v1/payment-records/');
      const results: PaymentRecord[] = Array.isArray(response)
        ? response
        : response?.results || [];
      return results;
    },
  });
};
