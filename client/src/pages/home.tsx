import { PostCard } from '@/components/posts/PostCard';
import { CreatePost } from '@/components/posts/CreatePost';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useSocialWave } from '@/hooks/web3/useSocialWave';
import { usePosts } from '@/hooks/web3/useContractData';
import { useWeb3 } from '@/contexts/Web3Context';
import { queryClient } from '@/lib/queryClient';
import { useLocalCache } from '@/hooks/useLocalCache';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { useWebSocketSync } from '@/hooks/useWebSocketSync';
import { Post } from '@/types';
import { useEffect, useState, useMemo } from 'react';

export default function Home() {
  const { data: posts = [], isLoading, error, refetch } = usePosts(0, 20);
  const { likePost, unlikePost, createPost, isLoading: isTransacting } = useSocialWave();
  const { isConnected, address } = useWeb3();
  
  // Enhanced hooks
  const { getPosts: getCachedPosts, savePosts: saveToCache } = useLocalCache();
  const {
    addOptimisticPost,
    addOptimisticLike,
    resolveOptimisticUpdate,
    resolveTempPost,
    getMergedPosts,
    hasPendingActions
  } = useOptimisticUpdates();

  const [mergedPosts, setMergedPosts] = useState<Post[]>([]);

  // Background sync
  useBackgroundSync({
    refetch,
    enabled: isConnected,
    interval: 15000, // 15 seconds
    onFocus: true,
    onVisibilityChange: true
  });

  // WebSocket for real-time updates (if your backend supports it)
  const { isConnected: isWsConnected } = useWebSocketSync(
    'wss://your-backend.com/ws',
    (message) => {
      switch (message.type) {
        case 'NEW_POST':
          handleNewPostFromWS(message.data);
          break;
        case 'POST_LIKED':
          handleLikeFromWS(message.data);
          break;
        case 'POST_UPDATED':
          handlePostUpdateFromWS(message.data);
          break;
      }
    }
  );

  // Deduplicate posts - remove cached posts that exist in on-chain data
  const deduplicatedPosts = useMemo(() => {
    if (posts.length === 0) return [];
    
    const onChainPostIds = new Set(posts.map(post => post.id.toString()));
    
    // Only include cached posts that don't exist in on-chain data
    const cachedPosts = getCachedPosts();
    const uniqueCachedPosts = cachedPosts.filter(cachedPost => 
      !onChainPostIds.has(cachedPost.id.toString())
    );
    
    return [...posts, ...uniqueCachedPosts];
  }, [posts, getCachedPosts]);

  // Merge real posts with optimistic updates
  useEffect(() => {
    if (deduplicatedPosts.length > 0) {
      const merged = getMergedPosts(deduplicatedPosts);
      setMergedPosts(merged);
      
      // Update cache with fresh on-chain data only (no duplicates)
      saveToCache(posts);
    } else if (getCachedPosts().length > 0) {
      // Only show cached posts if no on-chain data
      const cached = getCachedPosts();
      setMergedPosts(cached);
    }
  }, [deduplicatedPosts, getMergedPosts, getCachedPosts, saveToCache, posts]);

  const handleNewPostFromWS = (postData: Post) => {
    // Check if we already have this post (from optimistic update)
    const existingTempPost = mergedPosts.find(p => 
      p.tempId && p.content === postData.content && p.author === postData.author
    );

    if (existingTempPost) {
      resolveTempPost(existingTempPost.tempId!, postData);
    } else {
      // Add new post from WebSocket and remove from cache if it exists there
      const cachedPosts = getCachedPosts();
      const updatedCachedPosts = cachedPosts.filter(p => p.id.toString() !== postData.id.toString());
      saveToCache([postData, ...updatedCachedPosts]);
      
      setMergedPosts(prev => {
        const filtered = prev.filter(p => p.id.toString() !== postData.id.toString());
        return [postData, ...filtered];
      });
    }
  };

  const handleLikeFromWS = ({ postId, likes, liked }: { postId: bigint; likes: number; liked: boolean }) => {
    setMergedPosts(prev => 
      prev.map(post => 
        post.id === postId ? { ...post, likes, liked } : post
      )
    );
  };

  const handlePostUpdateFromWS = (updatedPost: Post) => {
    setMergedPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

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

  // Load cached posts only if no on-chain data
  useEffect(() => {
    if (!isLoading && posts.length === 0) {
      const cached = getCachedPosts();
      if (cached.length > 0) {
        setMergedPosts(cached);
      }
    }
  }, [isLoading, posts.length, getCachedPosts]);

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline</h1>
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className="flex items-center gap-1 text-xs">
            {isWsConnected ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-yellow-500" />
            )}
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