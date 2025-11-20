import { Heart, Repeat2, Clock, Coins, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { EnrichedPost } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { IPFS_CONFIG } from '@/lib/web3/config';
import { MediaDisplay } from './MediaDisplay';

interface PostCardProps {
  post: EnrichedPost;
  onLike: (postId: bigint) => void;
  onUnlike: (postId: bigint) => void;
  isLiking?: boolean;
}

export function PostCard({ post, onLike, onUnlike, isLiking }: PostCardProps) {
  const timeAgo = formatDistanceToNow(Number(post.timestamp) * 1000, { addSuffix: true });
  
  const getImageUrl = (ipfsHash: string) => {
    const gatewayUrl = IPFS_CONFIG.gatewayUrl.endsWith('/') 
      ? IPFS_CONFIG.gatewayUrl 
      : `${IPFS_CONFIG.gatewayUrl}/`;
    return `${gatewayUrl}${ipfsHash}`;
  };

  return (
    <Card className="hover-elevate" data-testid={`card-post-${post.id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Link href={`/profile/${post.author}`}>
            <Avatar className="h-12 w-12 hover-elevate">
              <AvatarImage src={post.authorProfile?.avatarUrl} />
              <AvatarFallback>
                {post.authorProfile?.username?.slice(0, 2).toUpperCase() || 'UN'}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${post.author}`}>
                <span className="font-semibold hover:underline" data-testid={`text-author-${post.id}`}>
                  {post.authorProfile?.username || `${post.author.slice(0, 6)}...${post.author.slice(-4)}`}
                </span>
              </Link>
              {post.authorProfile?.username && (
                <code className="text-xs text-muted-foreground font-mono">
                  {post.author.slice(0, 6)}...{post.author.slice(-4)}
                </code>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
              {post.isAd && (
                <Badge variant="secondary" className="text-xs">
                  Promoted
                </Badge>
              )}
            </div>

            <div className="mt-2 space-y-2">
              <p className="text-base whitespace-pre-wrap break-words" data-testid={`text-content-${post.id}`}>
                {post.content?.text}
              </p>

              {post.content?.images && post.content.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {post.content.images.slice(0, 4).map((img, idx) => {
                    const mediaUrl = getImageUrl(img);
                    const mediaType = post.content?.mediaTypes?.[idx];
                    
                    return (
                      <MediaDisplay
                        key={idx}
                        src={mediaUrl}
                        mediaType={mediaType}
                        className="rounded-md w-full h-48 object-cover"
                        postId={post.id}
                        index={idx}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => post.hasLiked ? onUnlike(post.id) : onLike(post.id)}
            disabled={isLiking}
            className="gap-2"
            data-testid={`button-like-${post.id}`}
          >
            <Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm" data-testid={`text-likes-${post.id}`}>
              {post.likeCount.toString()}
            </span>
          </Button>

      
        </div>

        {post.totalRewards > 0n && (
          <Badge variant="secondary" className="gap-1" data-testid={`badge-rewards-${post.id}`}>
            <Coins className="h-3 w-3" />
            <span className="font-mono text-xs">
              {(Number(post.totalRewards) / 1e18).toLocaleString()} SWAVE
            </span>
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
