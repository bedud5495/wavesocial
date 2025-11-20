import { useState, useEffect, useCallback } from 'react';
import type { EnrichedPost } from '@shared/schema';

const CACHE_KEYS = {
  POSTS: 'socialwave_posts',
  LAST_SYNC: 'socialwave_last_sync',
  PENDING_ACTIONS: 'socialwave_pending_actions'
};

// BigInt serialization helpers
const bigIntReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

const bigIntReviver = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  if (typeof value === 'string' && /^\d+$/.test(value) && value.length > 15) {
    return BigInt(value);
  }
  return value;
};

export const useLocalCache = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getPosts = useCallback((): EnrichedPost[] => {
    if (!isClient) return [];
    try {
      const cached = localStorage.getItem(CACHE_KEYS.POSTS);
      return cached ? JSON.parse(cached, bigIntReviver) : [];
    } catch (error) {
      console.error('Failed to parse cached posts:', error);
      return [];
    }
  }, [isClient]);

  const savePosts = useCallback((posts: EnrichedPost[]) => {
    if (!isClient) return;
    try {
      // Convert BigInt values to strings for serialization
      const serializablePosts = posts.map(post => ({
        ...post,
        id: typeof post.id === 'bigint' ? post.id.toString() : post.id,
        timestamp: typeof post.timestamp === 'bigint' ? post.timestamp.toString() : post.timestamp,
        likeCount: typeof post.likeCount === 'bigint' ? post.likeCount.toString() : post.likeCount,
        totalRewards: typeof post.totalRewards === 'bigint' ? post.totalRewards.toString() : post.totalRewards,
        // Handle any other BigInt fields that might exist
      }));
      
      localStorage.setItem(CACHE_KEYS.POSTS, JSON.stringify(serializablePosts, bigIntReplacer));
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('Failed to save posts to cache:', error);
    }
  }, [isClient]);

  const getPendingActions = (): any[] => {
    if (!isClient) return [];
    try {
      const pending = localStorage.getItem(CACHE_KEYS.PENDING_ACTIONS);
      return pending ? JSON.parse(pending, bigIntReviver) : [];
    } catch {
      return [];
    }
  };

  const addPendingAction = (action: any) => {
    if (!isClient) return;
    try {
      const pending = getPendingActions();
      // Convert any BigInt values in action to strings
      const serializableAction = JSON.parse(JSON.stringify(action, bigIntReplacer));
      pending.push({ ...serializableAction, timestamp: Date.now() });
      localStorage.setItem(CACHE_KEYS.PENDING_ACTIONS, JSON.stringify(pending, bigIntReplacer));
    } catch (error) {
      console.error('Failed to save pending action:', error);
    }
  };

  const clearPendingActions = () => {
    if (!isClient) return;
    localStorage.removeItem(CACHE_KEYS.PENDING_ACTIONS);
  };

  const getLastSync = (): number => {
    if (!isClient) return 0;
    return parseInt(localStorage.getItem(CACHE_KEYS.LAST_SYNC) || '0');
  };

  return {
    getPosts,
    savePosts,
    getPendingActions,
    addPendingAction,
    clearPendingActions,
    getLastSync
  };
};