import { PostCard } from '@/components/posts/PostCard';
import { CreatePost } from '@/components/posts/CreatePost';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { useSocialWave } from '@/hooks/web3/useSocialWave';
import { usePosts } from '@/hooks/web3/useContractData';
import { useWeb3 } from '@/contexts/Web3Context';
import { queryClient } from '@/lib/queryClient';

export default function Home() {
  const { data: posts = [], isLoading, refetch } = usePosts(0, 20);
  const { likePost, unlikePost, createPost, isLoading: isTransacting } = useSocialWave();
  const { isConnected } = useWeb3();

  const handleLike = async (postId: bigint) => {
    await likePost(postId);
  };

  const handleUnlike = async (postId: bigint) => {
    await unlikePost(postId);
  };

  const handleCreatePost = async (content: string, images: string[], isAd: boolean) => {
    await createPost(content, images, isAd);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    refetch();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline</h1>
        <Button variant="ghost" size="icon" onClick={handleRefresh} data-testid="button-refresh-feed">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isConnected && (
        <CreatePost onSubmit={handleCreatePost} isSubmitting={isTransacting} />
      )}

      <div className="space-y-4">
        {isLoading ? (
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
        ) : posts.length === 0 ? (
          <div className="text-center py-12 space-y-3" data-testid="empty-timeline">
            <p className="text-muted-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? 'Create your first post to earn SWAVE tokens!'
                : 'Connect your wallet to start creating posts and earning tokens!'}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id.toString()}
              post={post}
              onLike={handleLike}
              onUnlike={handleUnlike}
              isLiking={isTransacting}
            />
          ))
        )}
      </div>
    </div>
  );
}
