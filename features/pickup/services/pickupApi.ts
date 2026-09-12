import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import {
  PickupSpot,
  PickupCheckIn,
  PickupComment,
  PickupPhoto,
  PickupAlert,
  PickupPlan,
  PickupCrew,
  PickupCrewChallenge,
  LeaderboardItem,
  CreatePickupSpotPayload,
  CreatePickupCheckInPayload,
  CreatePickupCommentPayload,
  CreatePickupRatingPayload,
  CreatePickupPhotoPayload,
  CreatePickupAlertPayload,
  CreatePickupPlanPayload,
  CreatePickupCrewPayload,
  CreateCrewChallengePayload,
  ReportSpotPayload,
} from '../types/pickup';

// ==========================================
// SPOTS
// ==========================================

export interface GetPickupSpotsParams {
  spot_type?: string;
  city?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export const useGetPickupSpots = (params?: GetPickupSpotsParams) => {
  return useQuery({
    queryKey: ['pickup-spots', params],
    queryFn: async (): Promise<PickupSpot[]> => {
      const queryParts: string[] = [];
      if (params?.spot_type) queryParts.push(`spot_type=${encodeURIComponent(params.spot_type)}`);
      if (params?.city) queryParts.push(`city=${encodeURIComponent(params.city)}`);
      if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);

      const queryStr = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

      const headers: Record<string, string> = {};
      if (typeof params?.latitude === 'number' && typeof params?.longitude === 'number') {
        headers['X-Latitude'] = params.latitude.toString();
        headers['X-Longitude'] = params.longitude.toString();
        if (params.radius) headers['X-Radius'] = params.radius.toString();
      }

      const response = await api.get<any>(`/v1/pickup-spots/${queryStr}`, { headers });
      if (Array.isArray(response)) return response;
      return response?.results || [];
    },
  });
};

export const useGetPickupSpot = (id?: string) => {
  return useQuery({
    queryKey: ['pickup-spot', id],
    queryFn: async (): Promise<PickupSpot> => {
      return await api.get<PickupSpot>(`/v1/pickup-spots/${id}/`);
    },
    enabled: Boolean(id),
  });
};

export const useCreatePickupSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePickupSpotPayload): Promise<PickupSpot> => {
      return await api.post<PickupSpot>('/v1/pickup-spots/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-spots'] });
      queryClient.invalidateQueries({ queryKey: ['nearby'] });
    },
  });
};

export const useUpdatePickupSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePickupSpotPayload> }): Promise<PickupSpot> => {
      return await api.patch<PickupSpot>(`/v1/pickup-spots/${id}/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-spot', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pickup-spots'] });
    },
  });
};

export const useDeletePickupSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/v1/pickup-spots/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-spots'] });
      queryClient.invalidateQueries({ queryKey: ['nearby'] });
    },
  });
};

// ==========================================
// CHECK-INS
// ==========================================

export const useCreatePickupCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePickupCheckInPayload): Promise<PickupCheckIn> => {
      return await api.post<PickupCheckIn>('/v1/pickup-checkins/', payload);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['pickup-spot', payload.spot] });
      const previousSpot = queryClient.getQueryData<PickupSpot>(['pickup-spot', payload.spot]);
      if (previousSpot) {
        const added = 1 + (payload.additional_headcount || 0);
        queryClient.setQueryData<PickupSpot>(['pickup-spot', payload.spot], {
          ...previousSpot,
          active_checkin_count: (previousSpot.active_checkin_count || 0) + 1,
          estimated_headcount: (previousSpot.estimated_headcount || 0) + added,
        });
      }
      return { previousSpot, spotId: payload.spot };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousSpot) {
        queryClient.setQueryData(['pickup-spot', context.spotId], context.previousSpot);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-spot', variables.spot] });
      queryClient.invalidateQueries({ queryKey: ['pickup-spots'] });
      queryClient.invalidateQueries({ queryKey: ['pickup-checkins', variables.spot] });
      queryClient.invalidateQueries({ queryKey: ['pickup-leaderboard'] });
    },
  });
};

export const useGetPickupCheckIns = (spotId?: string, active: boolean = true) => {
  return useQuery({
    queryKey: ['pickup-checkins', spotId, active],
    queryFn: async (): Promise<PickupCheckIn[]> => {
      if (!spotId) return [];
      const response = await api.get<any>(
        `/v1/pickup-checkins/?spot=${spotId}&active=${active}`
      );
      if (Array.isArray(response)) return response;
      return response?.results || [];
    },
    enabled: Boolean(spotId),
  });
};

// ==========================================
// COMMENTS, RATINGS & PHOTOS
// ==========================================

export const useGetPickupComments = (spotId?: string) => {
  return useQuery({
    queryKey: ['pickup-comments', spotId],
    queryFn: async (): Promise<PickupComment[]> => {
      if (!spotId) return [];
      const response = await api.get<any>(`/v1/pickup-comments/?spot=${spotId}`);
      if (Array.isArray(response)) return response;
      return response?.results || [];
    },
    enabled: Boolean(spotId),
  });
};

export const useCreatePickupComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePickupCommentPayload): Promise<PickupComment> => {
      return await api.post<PickupComment>('/v1/pickup-comments/', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-comments', variables.spot] });
      queryClient.invalidateQueries({ queryKey: ['pickup-spot', variables.spot] });
    },
  });
};

export const useRatePickupSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePickupRatingPayload): Promise<void> => {
      await api.post('/v1/pickup-ratings/', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-spot', variables.spot] });
      queryClient.invalidateQueries({ queryKey: ['pickup-spots'] });
    },
  });
};

export const useGetPickupPhotos = (spotId?: string) => {
  return useQuery({
    queryKey: ['pickup-photos', spotId],
    queryFn: async (): Promise<PickupPhoto[]> => {
      if (!spotId) return [];
      const response = await api.get<any>(`/v1/pickup-photos/?spot=${spotId}`);
      if (Array.isArray(response)) return response;
      return response?.results || [];
    },
    enabled: Boolean(spotId),
  });
};

export const useUploadPickupPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePickupPhotoPayload): Promise<PickupPhoto> => {
      return await api.post<PickupPhoto>('/v1/pickup-photos/', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-photos', variables.spot] });
      queryClient.invalidateQueries({ queryKey: ['pickup-spot', variables.spot] });
    },
  });
};

// ==========================================
// ALERTS & PLANS
// ==========================================

export const useGetPickupAlerts = () => {
  return useQuery({
    queryKey: ['pickup-alerts'],
    queryFn: async (): Promise<PickupAlert[]> => {
      const response = await api.get<any>('/v1/pickup-alerts/');
      if (Array.isArray(response)) return response;
      return response?.results || [];
    },
  });
};

export const useCreatePickupAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePickupAlertPayload): Promise<PickupAlert> => {
      return await api.post<PickupAlert>('/v1/pickup-alerts/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-alerts'] });
    },
  });
};

export const useTogglePickupAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }): Promise<PickupAlert> => {
      return await api.patch<PickupAlert>(`/v1/pickup-alerts/${id}/`, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-alerts'] });
    },
  });
};

export const useDeletePickupAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/v1/pickup-alerts/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-alerts'] });
    },
  });
};

export const useGetPickupPlans = (upcoming: boolean = true) => {
  return useQuery({
    queryKey: ['pickup-plans', upcoming],
    queryFn: async (): Promise<PickupPlan[]> => {
      const response = await api.get<any>(`/v1/pickup-plans/?upcoming=${upcoming}`);
      if (Array.isArray(response)) return response;
      return response?.results || [];
    },
  });
};

export const useCreatePickupPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePickupPlanPayload): Promise<PickupPlan> => {
      return await api.post<PickupPlan>('/v1/pickup-plans/', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-plans'] });
      queryClient.invalidateQueries({ queryKey: ['pickup-spot', variables.spot] });
    },
  });
};

// ==========================================
// CREWS & CHALLENGES
// ==========================================

export const useGetPickupCrews = () => {
  return useQuery({
    queryKey: ['pickup-crews'],
    queryFn: async (): Promise<PickupCrew[]> => {
      const response = await api.get<any>('/v1/pickup-crews/');
      if (Array.isArray(response)) return response;
      return response?.results || [];
    },
  });
};

export const useCreatePickupCrew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePickupCrewPayload): Promise<PickupCrew> => {
      return await api.post<PickupCrew>('/v1/pickup-crews/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-crews'] });
    },
  });
};

export const useJoinPickupCrew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (crewId: string): Promise<void> => {
      await api.post(`/v1/pickup-crews/${crewId}/join/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-crews'] });
    },
  });
};

export const useLeavePickupCrew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (crewId: string): Promise<void> => {
      await api.post(`/v1/pickup-crews/${crewId}/leave/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-crews'] });
    },
  });
};

export const useGetCrewChallenges = () => {
  return useQuery({
    queryKey: ['crew-challenges'],
    queryFn: async (): Promise<PickupCrewChallenge[]> => {
      const response = await api.get<any>('/v1/pickup-crew-challenges/');
      if (Array.isArray(response)) return response;
      return response?.results || [];
    },
  });
};

export const useCreateCrewChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCrewChallengePayload): Promise<PickupCrewChallenge> => {
      return await api.post<PickupCrewChallenge>('/v1/pickup-crew-challenges/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-challenges'] });
    },
  });
};

export const useRespondCrewChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'accept' | 'decline' }): Promise<void> => {
      await api.post(`/v1/pickup-crew-challenges/${id}/${action}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-challenges'] });
    },
  });
};

// ==========================================
// LEADERBOARD, REPORTS & VERIFICATION
// ==========================================

export interface GetLeaderboardParams {
  spot?: string;
  city?: string;
  tier?: number;
  ordering?: string; // 'name' for alphabetical
}

export const useGetPickupLeaderboard = (params?: GetLeaderboardParams) => {
  return useQuery({
    queryKey: ['pickup-leaderboard', params],
    queryFn: async (): Promise<LeaderboardItem[]> => {
      const parts: string[] = [];
      if (params?.spot) parts.push(`spot=${params.spot}`);
      if (params?.city) parts.push(`city=${encodeURIComponent(params.city)}`);
      if (params?.tier != null) parts.push(`tier=${params.tier}`);
      if (params?.ordering) parts.push(`ordering=${params.ordering}`);

      const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
      const response = await api.get<any>(`/v1/pickup-checkins/leaderboard/${qs}`);
      if (Array.isArray(response)) return response;
      return response?.results || [];
    },
  });
};

export const useReportPickupSpot = () => {
  return useMutation({
    mutationFn: async (payload: ReportSpotPayload): Promise<void> => {
      await api.post('/v1/pickup-reports/', payload);
    },
  });
};

export const useVerifyPickupSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (spotId: string): Promise<void> => {
      await api.post(`/v1/pickup-spots/${spotId}/verify/`);
    },
    onSuccess: (_, spotId) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-spot', spotId] });
      queryClient.invalidateQueries({ queryKey: ['pickup-spots'] });
    },
  });
};

export const useUnverifyPickupSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (spotId: string): Promise<void> => {
      await api.post(`/v1/pickup-spots/${spotId}/unverify/`);
    },
    onSuccess: (_, spotId) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-spot', spotId] });
      queryClient.invalidateQueries({ queryKey: ['pickup-spots'] });
    },
  });
};
