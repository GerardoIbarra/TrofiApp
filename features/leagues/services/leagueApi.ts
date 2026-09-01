import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { LeagueSchema } from '../schemas/leagueSchema';

export const useCreateLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LeagueSchema) => {
      return api.post<any>('/v1/leagues/', data);
    },
    onSuccess: () => {
      // Invalidate queries related to leagues if they exist
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
    },
  });
};

export const useUpdateLeagueFeatures = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, boolean> }) => {
      return api.patch<any>(`/v1/leagues/${id}/features/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['league', variables.id] });
    },
  });
};
