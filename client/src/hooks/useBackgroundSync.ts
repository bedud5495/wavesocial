import { useEffect, useRef } from 'react';

interface BackgroundSyncOptions {
  refetch: () => void;
  enabled?: boolean;
  interval?: number;
  onFocus?: boolean;
  onVisibilityChange?: boolean;
}

export const useBackgroundSync = ({
  refetch,
  enabled = true,
  interval = 30000, // 30 seconds
  onFocus = true,
  onVisibilityChange = true
}: BackgroundSyncOptions) => {
  const refetchRef = useRef(refetch);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!enabled) return;

    // Periodic sync
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refetchRef.current();
      }
    }, interval);

    // Sync on window focus
    const handleFocus = () => {
      if (onFocus) {
        refetchRef.current();
      }
    };

    // Sync when tab becomes visible
    const handleVisibilityChange = () => {
      if (onVisibilityChange && document.visibilityState === 'visible') {
        refetchRef.current();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval, onFocus, onVisibilityChange]);

  return {
    triggerSync: () => refetchRef.current()
  };
};