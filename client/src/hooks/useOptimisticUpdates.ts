import { useState, useCallback } from 'react';
import type { EnrichedPost } from '@shared/schema';
import { useLocalCache } from './useLocalCache';

// Extended type for optimistic posts with tempId
type OptimisticPost = EnrichedPost & {
  tempId?: string;
};

type PostInput = {
  content: string;
  images?: string[];
  mediaTypes?: string[];
  isAd?: boolean;
  author?: string;
  authorProfile?: any;
};

export const useOptimisticUpdates = () => {
  const [optimisticPosts, setOptimisticPosts] = useState<OptimisticPost[]>([]);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const { getPosts, savePosts, addPendingAction } = useLocalCache();

  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addOptimisticPost = useCallback((postData: PostInput) => {
    const tempPost: OptimisticPost = {
      id: BigInt(0), // Will be replaced with real ID
      author: postData.author || '0x',
      contentIPFSHash: '',
      timestamp: BigInt(Math.floor(Date.now() / 1000)),
      likeCount: BigInt(0),
      totalRewards: BigInt(0),
      isAd: postData.isAd || false,
      exists: true,
      content: {
        text: postData.content,
        images: postData.images || [],
        mediaTypes: postData.mediaTypes || [],
        createdAt: Date.now(),
        authorAddress: postData.author || '0x'
      },
      authorProfile: postData.authorProfile,
      hasLiked: false,
      tempId: generateTempId()
    };

    setOptimisticPosts(prev => {
      const newPosts = [tempPost, ...prev];
      savePosts([...newPosts, ...getPosts()]);
      return newPosts;
    });

    const actionId = generateTempId();
    setPendingActions(prev => new Set([...Array.from(prev), actionId]));
    addPendingAction({
      type: 'CREATE_POST',
      id: actionId,
      tempId: tempPost.tempId,
      data: postData,
      timestamp: Date.now()
    });

    return { tempId: tempPost.tempId, actionId };
  }, [getPosts, savePosts, addPendingAction]);

  const addOptimisticLike = useCallback((postId: bigint, like: boolean) => {
    const actionId = generateTempId();
    
    setOptimisticPosts(prev => {
      const newPosts = prev.map(post => {
        if (post.id === postId || post.tempId?.includes(postId.toString())) {
          return {
            ...post,
            likeCount: post.likeCount + BigInt(like ? 1 : -1),
            hasLiked: like
          };
        }
        return post;
      });
      
      // Also update cached posts
      const allPosts = getPosts();
      const updatedAllPosts = allPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likeCount: post.likeCount + BigInt(like ? 1 : -1),
            hasLiked: like
          };
        }
        return post;
      });
      savePosts(updatedAllPosts);
      
      return newPosts;
    });

    setPendingActions(prev => new Set([...Array.from(prev), actionId]));
    addPendingAction({
      type: like ? 'LIKE_POST' : 'UNLIKE_POST',
      id: actionId,
      postId: postId.toString(),
      timestamp: Date.now()
    });

    return actionId;
  }, [getPosts, savePosts, addPendingAction]);

  const resolveOptimisticUpdate = useCallback((actionId: string) => {
    setPendingActions(prev => {
      const newSet = new Set(prev);
      newSet.delete(actionId);
      return newSet;
    });
  }, []);

  const resolveTempPost = useCallback((tempId: string, realPost: OptimisticPost) => {
    setOptimisticPosts(prev => {
      const newPosts = prev.filter(post => post.tempId !== tempId);
      savePosts([realPost, ...newPosts, ...getPosts()]);
      return newPosts;
    });
  }, [getPosts, savePosts]);

  const getMergedPosts = useCallback((realPosts: EnrichedPost[]): OptimisticPost[] => {
    const cachedPosts = getPosts();
    const allRealPosts = [...realPosts, ...cachedPosts];
    
    // Merge optimistic updates with real posts
    return optimisticPosts.reduce((merged, optimisticPost) => {
      if (optimisticPost.tempId) {
        // This is a new post not yet confirmed
        return [optimisticPost, ...merged];
      } else {
        // This is an update to an existing post
        const index = merged.findIndex(p => p.id === optimisticPost.id);
        if (index > -1) {
          merged[index] = { ...merged[index], ...optimisticPost };
        }
      }
      return merged;
    }, [...allRealPosts]).sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [optimisticPosts, getPosts]);

  return {
    optimisticPosts,
    pendingActions,
    addOptimisticPost,
    addOptimisticLike,
    resolveOptimisticUpdate,
    resolveTempPost,
    getMergedPosts,
    hasPendingActions: pendingActions.size > 0
  };
};