import { useState, useCallback } from 'react';
import { Post } from '@/types';
import { useLocalCache } from './useLocalCache';

export const useOptimisticUpdates = () => {
  const [optimisticPosts, setOptimisticPosts] = useState<Post[]>([]);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const { getPosts, savePosts, addPendingAction } = useLocalCache();

  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addOptimisticPost = useCallback((postData: Partial<Post> & { content: string }) => {
    const tempPost: Post = {
      id: BigInt(0), // Will be replaced with real ID
      author: postData.author || '0x',
      content: postData.content,
      images: postData.images || [],
      likes: 0,
      isAd: postData.isAd || false,
      timestamp: Math.floor(Date.now() / 1000),
      liked: false,
      authorProfile: postData.authorProfile,
      tempId: generateTempId()
    };

    setOptimisticPosts(prev => {
      const newPosts = [tempPost, ...prev];
      savePosts([...newPosts, ...getPosts()]);
      return newPosts;
    });

    const actionId = generateTempId();
    setPendingActions(prev => new Set([...prev, actionId]));
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
            likes: post.likes + (like ? 1 : -1),
            liked: like
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
            likes: post.likes + (like ? 1 : -1),
            liked: like
          };
        }
        return post;
      });
      savePosts(updatedAllPosts);
      
      return newPosts;
    });

    setPendingActions(prev => new Set([...prev, actionId]));
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

  const resolveTempPost = useCallback((tempId: string, realPost: Post) => {
    setOptimisticPosts(prev => {
      const newPosts = prev.filter(post => post.tempId !== tempId);
      savePosts([realPost, ...newPosts, ...getPosts()]);
      return newPosts;
    });
  }, [getPosts, savePosts]);

  const getMergedPosts = useCallback((realPosts: Post[]): Post[] => {
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