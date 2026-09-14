import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { TournamentSchema } from '../schemas/tournamentSchema';
import {
  DetermineChampionResponse,
  CrownSeasonAwardsResponse,
  ComputeWeeklyMVPRequest,
  ComputeWeeklyMVPResponse,
} from '../types/tournamentAwards';

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

export const useDetermineChampion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string): Promise<DetermineChampionResponse> => {
      return await api.post<DetermineChampionResponse>(`/v1/tournaments/${tournamentId}/determine-champion/`);
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};

export const useCrownSeasonAwards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string): Promise<CrownSeasonAwardsResponse> => {
      return await api.post<CrownSeasonAwardsResponse>(`/v1/tournaments/${tournamentId}/crown-season-awards/`);
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['player-profile'] });
      queryClient.invalidateQueries({ queryKey: ['team-profile'] });
    },
  });
};

export const useComputeWeeklyMVP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentId,
      data,
    }: {
      tournamentId: string;
      data?: ComputeWeeklyMVPRequest;
    }): Promise<ComputeWeeklyMVPResponse> => {
      return await api.post<ComputeWeeklyMVPResponse>(
        `/v1/tournaments/${tournamentId}/compute-weekly-mvp/`,
        data || {}
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['player-profile'] });
    },
  });
};

import { TournamentScheduleConfig } from '../types/tournament';
import { Bracket, QualifiedTeamResponse, AssignMatchData } from '../types/playoffs';

export const useUpdateScheduleConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TournamentScheduleConfig }) => {
      return api.put<any>(`/v1/tournaments/${id}/schedule-config/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.id] });
    },
  });
};

export const useGenerateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.post<any>(`/v1/tournaments/${id}/generate-schedule/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.id] });
    },
  });
};

export const useGenerateWeeklySchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.post<any>(`/v1/tournaments/${id}/generate-weekly-schedule/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.id] });
    },
  });
};

export const useQualifyTeams = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }): Promise<QualifiedTeamResponse> => {
      return api.post<QualifiedTeamResponse>(`/v1/tournaments/${id}/qualify-teams/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bracket', variables.id] });
    },
  });
};

export const useQualifyFromGroups = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }): Promise<QualifiedTeamResponse> => {
      return api.post<QualifiedTeamResponse>(`/v1/tournaments/${id}/qualify-from-groups/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bracket', variables.id] });
    },
  });
};

export const useCreateBracket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.post<any>(`/v1/tournaments/${id}/create-bracket/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bracket', variables.id] });
    },
  });
};

export const useAssignMatchToBracketSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, slotId, data }: { id: string; slotId: string; data: AssignMatchData }) => {
      return api.post<any>(`/v1/tournaments/${id}/bracket/slots/${slotId}/assign-match/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bracket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.id] });
    },
  });
};

export const getBracket = async (tournamentId: string): Promise<Bracket> => {
  return api.get<Bracket>(`/v1/tournaments/${tournamentId}/bracket/`);
};
