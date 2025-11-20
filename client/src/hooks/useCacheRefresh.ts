import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LocalCache } from '@/lib/cache';

const REFRESH_INTERVAL = 60 * 1000; // 1 minute
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

export function useCacheRefresh(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const cleanupIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    LocalCache.cleanOldData();

    refreshIntervalRef.current = setInterval(() => {
      queryClient.invalidateQueries();
    }, REFRESH_INTERVAL);

    cleanupIntervalRef.current = setInterval(() => {
      LocalCache.cleanOldData();
    }, CLEANUP_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [enabled, queryClient]);
}
