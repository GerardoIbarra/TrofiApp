import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { metrics } from '@/services/metrics';
import {
  RefereeAvailability,
  SetRefereeAvailabilityData,
  RefereeOffer,
  OfferRefereeData,
  RateRefereeData,
  RefereeProfile,
} from '../types/referee';

export const useGetAvailableReferees = (isOpen = true) => {
  return useQuery({
    queryKey: ['referee-availability', isOpen],
    queryFn: async () => {
      const response = await api.get<any>(`/v1/referee-availability/?is_open=${isOpen}`);
      const results: RefereeAvailability[] = Array.isArray(response)
        ? response
        : response?.results || [];
      return results;
    },
  });
};

export const useSetRefereeAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetRefereeAvailabilityData) => {
      const response = await api.post<RefereeAvailability>('/v1/referee-availability/', data as any);
      return response;
    },
    onSuccess: (_, variables) => {
      metrics.trackRefereeAvailability(variables.is_open);
      queryClient.invalidateQueries({ queryKey: ['referee-availability'] });
    },
  });
};

export const useOfferMatchReferee = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OfferRefereeData) => {
      const response = await api.post(`/v1/matches/${matchId}/offer-referee/`, data as any);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referee-offers'] });
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
  });
};

export const useGetRefereeOffers = (params?: { referee?: string; status?: string }) => {
  return useQuery({
    queryKey: ['referee-offers', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.referee) searchParams.append('referee', params.referee);
      if (params?.status) searchParams.append('status', params.status);

      const queryStr = searchParams.toString();
      const endpoint = `/v1/referee-offers/${queryStr ? `?${queryStr}` : ''}`;
      const response = await api.get<any>(endpoint);
      const results: RefereeOffer[] = Array.isArray(response)
        ? response
        : response?.results || [];
      return results;
    },
  });
};

export const useAcceptRefereeOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const response = await api.post(`/v1/referee-offers/${offerId}/accept/`, {});
      return response;
    },
    onSuccess: (_, offerId) => {
      metrics.trackRefereeOfferResponse('accept', offerId);
      queryClient.invalidateQueries({ queryKey: ['referee-offers'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useDeclineRefereeOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const response = await api.post(`/v1/referee-offers/${offerId}/decline/`, {});
      return response;
    },
    onSuccess: (_, offerId) => {
      metrics.trackRefereeOfferResponse('decline', offerId);
      queryClient.invalidateQueries({ queryKey: ['referee-offers'] });
    },
  });
};

export const useRateReferee = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RateRefereeData) => {
      const response = await api.post(`/v1/matches/${matchId}/rate-referee/`, data as any);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['referee-profiles'] });
    },
  });
};

export const useGetRefereeProfile = (refereeId: string) => {
  return useQuery({
    queryKey: ['referee-profile', refereeId],
    queryFn: async () => {
      const response = await api.get<RefereeProfile>(`/v1/referee-profiles/${refereeId}/`);
      return response;
    },
    enabled: Boolean(refereeId),
  });
};

export const useVerifyReferee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refereeProfileId: string) => {
      const response = await api.post(`/v1/referee-profiles/${refereeProfileId}/verify/`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referee-profile'] });
      queryClient.invalidateQueries({ queryKey: ['referee-availability'] });
    },
  });
};

export const useUnverifyReferee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refereeProfileId: string) => {
      const response = await api.post(`/v1/referee-profiles/${refereeProfileId}/unverify/`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referee-profile'] });
      queryClient.invalidateQueries({ queryKey: ['referee-availability'] });
    },
  });
};
