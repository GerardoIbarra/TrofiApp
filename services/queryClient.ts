import { QueryClient, QueryCache, MutationCache, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { logger } from './logger';

// Configure online manager for React Native
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logger.error('query', `Query failed: ${JSON.stringify(query.queryKey)}`, error, {
        queryKey: query.queryKey,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const key = mutation.options.mutationKey ? JSON.stringify(mutation.options.mutationKey) : 'mutation';
      logger.error('mutation', `Mutation failed: ${key}`, error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (keep in cache for offline use)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
