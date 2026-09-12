import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import {
  MatchDispute,
  FileDisputePayload,
  ResolveDisputePayload,
} from '../types/matchDispute';

export const useGetMatchDisputes = (matchId?: string) => {
  return useQuery({
    queryKey: ['match-disputes', matchId],
    queryFn: async (): Promise<MatchDispute[]> => {
      if (!matchId) return [];
      const response = await api.get<any>(`/v1/match-disputes/?match=${matchId}`);
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: Boolean(matchId),
  });
};

export const useGetPendingDisputes = () => {
  return useQuery({
    queryKey: ['match-disputes', 'pending'],
    queryFn: async (): Promise<MatchDispute[]> => {
      const response = await api.get<any>('/v1/match-disputes/?status=pending');
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
  });
};

export const useFileMatchDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FileDisputePayload): Promise<MatchDispute> => {
      return await api.post<MatchDispute>('/v1/match-disputes/', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['match-disputes', variables.match] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.match] });
    },
  });
};

export const useUpholdMatchDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      payload,
    }: {
      disputeId: string;
      matchId: string;
      payload?: ResolveDisputePayload;
    }): Promise<MatchDispute> => {
      return await api.post<MatchDispute>(
        `/v1/match-disputes/${disputeId}/uphold/`,
        payload || {}
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['match-disputes', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
    },
  });
};

export const useRejectMatchDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      payload,
    }: {
      disputeId: string;
      matchId: string;
      payload?: ResolveDisputePayload;
    }): Promise<MatchDispute> => {
      return await api.post<MatchDispute>(
        `/v1/match-disputes/${disputeId}/reject/`,
        payload || {}
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['match-disputes', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
    },
  });
};
