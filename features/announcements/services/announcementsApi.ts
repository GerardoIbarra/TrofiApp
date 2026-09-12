import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import {
  Announcement,
  AnnouncementListResponse,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from '../types/announcement';

interface GetAnnouncementsParams {
  leagueId?: string;
  tournamentId?: string;
}

export const useGetAnnouncements = ({ leagueId, tournamentId }: GetAnnouncementsParams) => {
  return useQuery({
    queryKey: ['announcements', { leagueId, tournamentId }],
    queryFn: async (): Promise<Announcement[]> => {
      let endpoint = '';
      if (leagueId) {
        endpoint = `/v1/announcements/?league=${leagueId}`;
      } else if (tournamentId) {
        endpoint = `/v1/announcements/?tournament=${tournamentId}`;
      } else {
        return [];
      }

      const response = await api.get<AnnouncementListResponse | Announcement[]>(endpoint);
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: Boolean(leagueId || tournamentId),
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAnnouncementPayload): Promise<Announcement> => {
      return await api.post<Announcement>('/v1/announcements/', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['announcements', { leagueId: variables.league, tournamentId: variables.tournament }],
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAnnouncementPayload;
      leagueId?: string;
      tournamentId?: string;
    }): Promise<Announcement> => {
      return await api.patch<Announcement>(`/v1/announcements/${id}/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['announcements', { leagueId: variables.leagueId, tournamentId: variables.tournamentId }],
      });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
    }: {
      id: string;
      leagueId?: string;
      tournamentId?: string;
    }): Promise<void> => {
      await api.delete(`/v1/announcements/${id}/`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['announcements', { leagueId: variables.leagueId, tournamentId: variables.tournamentId }],
      });
    },
  });
};
