import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import {
  SponsorPlacement,
  CreateSponsorPlacementData,
  RenewPlacementData,
  UpdateSponsorPlacementData,
  PlacementType,
} from '../types/sponsor';

export interface GetSponsorPlacementsParams {
  sponsor?: string;
  league?: string;
  tournament?: string;
  team?: string;
  placement_type?: PlacementType;
  is_active?: boolean;
}

export const useGetSponsorPlacements = (params?: GetSponsorPlacementsParams) => {
  return useQuery({
    queryKey: ['sponsor-placements', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.sponsor) searchParams.append('sponsor', params.sponsor);
      if (params?.league) searchParams.append('league', params.league);
      if (params?.tournament) searchParams.append('tournament', params.tournament);
      if (params?.team) searchParams.append('team', params.team);
      if (params?.placement_type) searchParams.append('placement_type', params.placement_type);
      if (params?.is_active !== undefined) searchParams.append('is_active', String(params.is_active));

      const queryStr = searchParams.toString();
      const endpoint = `/v1/sponsor-placements/${queryStr ? `?${queryStr}` : ''}`;
      const response = await api.get<any>(endpoint);
      const results: SponsorPlacement[] = Array.isArray(response)
        ? response
        : response?.results || [];
      return results;
    },
  });
};

export const useCreateSponsorPlacement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSponsorPlacementData) => {
      const response = await api.post<SponsorPlacement>('/v1/sponsor-placements/', data as any);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-placements'] });
    },
  });
};

export const useRecordImpression = () => {
  return useMutation({
    mutationFn: async (placementId: string) => {
      return await api.post(`/v1/sponsor-placements/${placementId}/record-impression/`, {}, { silent: true });
    },
  });
};

export const useRecordClick = () => {
  return useMutation({
    mutationFn: async (placementId: string) => {
      return await api.post(`/v1/sponsor-placements/${placementId}/record-click/`, {}, { silent: true });
    },
  });
};

export const useRenewSponsorPlacement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: RenewPlacementData }) => {
      const response = await api.post<SponsorPlacement>(
        `/v1/sponsor-placements/${id}/renew/`,
        (data || { extend_days: 30 }) as any
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-placements'] });
    },
  });
};

export const useUpdateSponsorPlacement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSponsorPlacementData }) => {
      const response = await api.patch<SponsorPlacement>(`/v1/sponsor-placements/${id}/`, data as any);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-placements'] });
    },
  });
};

export const useDeleteSponsorPlacement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/v1/sponsor-placements/${id}/`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-placements'] });
    },
  });
};
