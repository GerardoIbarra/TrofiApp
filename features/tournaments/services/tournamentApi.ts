import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { TournamentSchema } from '../schemas/tournamentSchema';

export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TournamentSchema & { league: string }) => {
      return api.post<any>('/v1/tournaments/', data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', variables.league] });
    },
  });
};

export const useCloneTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      leagueId,
    }: {
      id: string;
      data: { season_label: string; start_date: string; end_date: string; name?: string };
      leagueId: string;
    }) => {
      return api.post<any>(`/v1/tournaments/${id}/clone-into-season/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', variables.leagueId] });
    },
  });
};

export const useOpenRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.post<any>(`/v1/tournaments/${id}/open-registration/`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
    },
  });
};

export const useCloseRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.post<any>(`/v1/tournaments/${id}/close-registration/`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
    },
  });
};

export const useUpdateTournamentTiebreaker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, standings_tiebreaker }: { id: string; standings_tiebreaker: 'goal_difference' | 'head_to_head' }) => {
      return api.patch<any>(`/v1/tournaments/${id}/`, { standings_tiebreaker });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['standings', variables.id] });
    },
  });
};

