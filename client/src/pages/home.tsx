import { PostCard } from '@/components/posts/PostCard';
import { CreatePost } from '@/components/posts/CreatePost';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { useSocialWave } from '@/hooks/web3/useSocialWave';
import { usePosts } from '@/hooks/web3/useContractData';
import { useWeb3 } from '@/contexts/Web3Context';
import { queryClient } from '@/lib/queryClient';
import { useLocalCache } from '@/hooks/useLocalCache';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { Post } from '@/types';
import { useEffect, useState, useMemo } from 'react';

export default function Home() {
  const { data: posts = [], isLoading, error, refetch } = usePosts(0, 20);
  const { likePost, unlikePost, createPost, isLoading: isTransacting } = useSocialWave();
  const { isConnected, address } = useWeb3();
  
  // Enhanced hooks
  const { getPosts: getCachedPosts, savePosts: saveToCache, clearCache } = useLocalCache();
  const {
    addOptimisticPost,
    addOptimisticLike,
    resolveOptimisticUpdate,
    resolveTempPost,
    getMergedPosts,
    hasPendingActions
  } = useOptimisticUpdates();

  const [mergedPosts, setMergedPosts] = useState<Post[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Background sync (polling-based as fallback)
  useBackgroundSync({
    refetch,
    enabled: isConnected,
    interval: 15000, // 15 seconds
    onFocus: true,
    onVisibilityChange: true
  });

  // Improved deduplication logic
  const deduplicatedPosts = useMemo(() => {
    if (posts.length === 0) return [];
    
    const onChainPostIds = new Set(posts.map(post => post.id.toString()));
    const cachedPosts = getCachedPosts();
    
    // Only include cached posts that don't exist in on-chain data
    const uniqueCachedPosts = cachedPosts.filter(cachedPost => 
      !onChainPostIds.has(cachedPost.id.toString())
    );
    
    return [...posts, ...uniqueCachedPosts];
  }, [posts, getCachedPosts]);

  // Merge real posts with optimistic updates - improved logic
  useEffect(() => {
    // If we have on-chain posts, use them (with deduplication)
    if (posts.length > 0) {
      const merged = getMergedPosts(deduplicatedPosts);
      setMergedPosts(merged);
      
      // Update cache with fresh on-chain data only (no duplicates)
      saveToCache(posts);
      
      // Clear cached posts that are now available on-chain
      const cachedPosts = getCachedPosts();
      const onChainIds = new Set(posts.map(p => p.id.toString()));
      const remainingCachedPosts = cachedPosts.filter(p => !onChainIds.has(p.id.toString()));
      
      if (remainingCachedPosts.length !== cachedPosts.length) {
        saveToCache(remainingCachedPosts);
      }
    } 
    // Only use cached posts if we have no on-chain data AND it's not loading
    else if (!isLoading && getCachedPosts().length > 0) {
      const cached = getCachedPosts();
      const merged = getMergedPosts(cached);
      setMergedPosts(merged);
    }
    // Reset if no data at all
    else if (!isLoading && posts.length === 0 && getCachedPosts().length === 0) {
      setMergedPosts([]);
    }
  }, [deduplicatedPosts, getMergedPosts, getCachedPosts, saveToCache, posts, isLoading]);

  // Clear cache and reset when wallet connects/disconnects
  useEffect(() => {
    if (isConnected) {
      // When wallet connects, clear cache and refetch fresh data
      saveToCache([]);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      refetch();
    } else {
      // When wallet disconnects, show only cached posts
      const cached = getCachedPosts();
      const merged = getMergedPosts(cached);
      setMergedPosts(merged);
    }
  }, [isConnected]);

  // Handle initial load
  useEffect(() => {
    if (isFirstLoad && !isLoading) {
      if (posts.length > 0) {
        // We have on-chain data, use it and update cache
        const merged = getMergedPosts(posts);
        setMergedPosts(merged);
        saveToCache(posts);
      } else if (getCachedPosts().length > 0) {
        // No on-chain data but we have cached posts
        const cached = getCachedPosts();
        const merged = getMergedPosts(cached);
        setMergedPosts(merged);
      }
      setIsFirstLoad(false);
    }
  }, [isLoading, posts, isFirstLoad, getMergedPosts, getCachedPosts, saveToCache]);

  const handleLike = async (postId: bigint) => {
    const actionId = addOptimisticLike(postId, true);
    
    try {
      await likePost(postId);
      resolveOptimisticUpdate(actionId);
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      addOptimisticLike(postId, false);
      resolveOptimisticUpdate(actionId);
    }
  };

  const handleUnlike = async (postId: bigint) => {
    const actionId = addOptimisticLike(postId, false);
    
    try {
      await unlikePost(postId);
      resolveOptimisticUpdate(actionId);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error unliking post:', error);
      // Revert optimistic update on error
      addOptimisticLike(postId, true);
      resolveOptimisticUpdate(actionId);
    }
  };

  const handleCreatePost = async (content: string, images: string[], isAd: boolean) => {
    const { tempId, actionId } = addOptimisticPost({
      content,
      images,
      isAd,
      author: address,
      timestamp: Math.floor(Date.now() / 1000)
    });

    try {
      const result = await createPost(content, images, isAd);
      resolveOptimisticUpdate(actionId);
      
      // If your createPost returns the new post ID, use it to resolve the temp post
      if (result?.postId) {
        // You might need to fetch the complete post data here
        const newPost: Post = {
          id: result.postId,
          author: address!,
          content,
          images,
          isAd,
          likes: 0,
          timestamp: Math.floor(Date.now() / 1000),
          liked: false
        };
        resolveTempPost(tempId, newPost);
      }
      
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error creating post:', error);
      resolveOptimisticUpdate(actionId);
      throw error;
    }
  };

  const handleRefresh = () => {
    // Clear cache and refetch fresh data
    saveToCache([]);
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    refetch();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline</h1>
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className="flex items-center gap-1 text-xs">
            {hasPendingActions && (
              <span className="text-yellow-500">Syncing...</span>
            )}
          </div>

          {isConnected && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Connected: {address?.slice(0, 8)}...
            </span>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh} 
            data-testid="button-refresh-feed"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {isConnected && (
        <CreatePost onSubmit={handleCreatePost} isSubmitting={isTransacting} />
      )}

      <div className="space-y-4">
        {isLoading && mergedPosts.length === 0 ? (
          // Show skeletons only if no cached posts
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          ))
        ) : mergedPosts.length === 0 ? (
          <div className="text-center py-12 space-y-3" data-testid="empty-timeline">
            <p className="text-muted-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? 'Create your first post to earn SWAVE tokens!'
                : 'Connect your wallet to start creating posts and earning tokens!'}
            </p>
            {isConnected && (
              <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
                {isLoading ? 'Refreshing...' : 'Refresh Posts'}
              </Button>
            )}
          </div>
        ) : (
          mergedPosts.map((post) => (
            <PostCard
              key={post.tempId || post.id.toString()}
              post={post}
              onLike={handleLike}
              onUnlike={handleUnlike}
              isLiking={isTransacting}
              isOptimistic={!!post.tempId}
            />
          ))
        )}
      </div>
    </div>
  );
}