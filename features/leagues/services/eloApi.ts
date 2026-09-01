import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { EloRankingItem } from '../types/elo';

export const useGetEloRankings = (leagueId?: string) => {
  return useQuery({
    queryKey: ['elo-rankings', leagueId],
    queryFn: async () => {
      const url = leagueId ? `/v1/teams/elo-rankings/?league=${leagueId}` : '/v1/teams/elo-rankings/';
      const response = await api.get<EloRankingItem[]>(url);
      return response;
    },
  });
};
