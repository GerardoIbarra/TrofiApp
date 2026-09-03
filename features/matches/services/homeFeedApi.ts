import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { HomeFeedItem } from '../types/homeFeed';

export const useGetHomeFeed = () => {
  return useQuery<HomeFeedItem[]>({
    queryKey: ['home-feed'],
    queryFn: async () => {
      const response = await api.get<HomeFeedItem[]>('/v1/matches/home-feed/');
      return Array.isArray(response) ? response : [];
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
