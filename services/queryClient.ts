import { QueryClient, QueryCache, MutationCache, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { logger, isCancellationError } from './logger';

// Configure online manager for React Native
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      if (isCancellationError(error)) {
        return;
      }
      if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
        return;
      }
      logger.error('query', `Query failed: ${JSON.stringify(query.queryKey)}`, error, {
        queryKey: query.queryKey,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any, _variables, _context, mutation) => {
      if (isCancellationError(error)) {
        return;
      }
      if (error?.status === 401 || error?.status === 403) {
        return;
      }
      const key = mutation.options.mutationKey ? JSON.stringify(mutation.options.mutationKey) : 'mutation';
      logger.error('mutation', `Mutation failed: ${key}`, error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (keep in cache for offline use)
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});
