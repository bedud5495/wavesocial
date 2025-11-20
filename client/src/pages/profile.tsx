import { useState } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from '@/components/posts/PostCard';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { BadgeCheck, Users, FileText, Coins, UserPlus, UserMinus, Pencil } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useSocialWave } from '@/hooks/web3/useSocialWave';
import { useUser, useUserPosts, useUserLikedPosts, useIsFollowing } from '@/hooks/web3/useContractData';

export default function Profile() {
  const [, params] = useRoute('/profile/:address');
  const { address: currentUserAddress } = useWeb3();
  const { followUser, unfollowUser, likePost, unlikePost, isLoading: isTransacting } = useSocialWave();
  const profileAddress = params?.address || currentUserAddress;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: user, isLoading: isLoadingUser } = useUser(profileAddress);
  const { data: posts = [], isLoading: isLoadingPosts } = useUserPosts(profileAddress);
  const { data: likedPosts = [], isLoading: isLoadingLikedPosts } = useUserLikedPosts(profileAddress, 100);
  const { data: isFollowingData = false, isLoading: isLoadingFollow } = useIsFollowing(profileAddress);

  const isOwnProfile = currentUserAddress?.toLowerCase() === profileAddress?.toLowerCase();

  const handleFollow = async () => {
    if (!profileAddress) return;
    if (isFollowingData) {
      await unfollowUser(profileAddress);
    } else {
      await followUser(profileAddress);
    }
  };

  const handleLike = async (postId: bigint) => {
    await likePost(postId);
  };

  const handleUnlike = async (postId: bigint) => {
    await unlikePost(postId);
  };

  if (isLoadingUser) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Card>
          <Skeleton className="h-48 rounded-t-lg" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <div 
          className="h-48 bg-gradient-to-r from-primary/20 to-accent/20 rounded-t-lg bg-cover bg-center"
          style={user?.profile?.coverImageUrl ? {
            backgroundImage: `url(${user.profile.coverImageUrl})`,
          } : undefined}
        />
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-24 w-24 -mt-16 border-4 border-background">
                <AvatarImage src={user?.profile?.avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {user?.profile?.username?.slice(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold" data-testid="text-profile-username">
                    {user?.profile?.username || 'Anonymous User'}
                  </h1>
                  {user?.isVerified && (
                    <Badge variant="secondary" className="gap-1" data-testid="badge-verified">
                      <BadgeCheck className="h-3 w-3 text-primary" />
                      Verified
                    </Badge>
                  )}
                </div>
                <code className="text-sm text-muted-foreground font-mono" data-testid="text-profile-address">
                  {profileAddress?.slice(0, 10)}...{profileAddress?.slice(-8)}
                </code>
                {user?.profile?.bio && (
                  <p className="text-sm text-muted-foreground max-w-md">{user.profile.bio}</p>
                )}
              </div>
            </div>

            {isOwnProfile ? (
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
                data-testid="button-edit-profile"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={isFollowingData ? 'outline' : 'default'}
                onClick={handleFollow}
                disabled={isTransacting || isLoadingFollow}
                data-testid="button-follow"
              >
                {isFollowingData ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold" data-testid="text-posts-count">
                {user?.postCount?.toString() || '0'}
              </span>
              <span className="text-muted-foreground">Posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold" data-testid="text-followers-count">
                {user?.followerCount?.toString() || '0'}
              </span>
              <span className="text-muted-foreground">Followers</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold" data-testid="text-following-count">
                {user?.followingCount?.toString() || '0'}
              </span>
              <span className="text-muted-foreground">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold font-mono" data-testid="text-earned-count">
                {user?.totalEarned ? (Number(user.totalEarned) / 1e18).toLocaleString() : '0'}
              </span>
              <span className="text-muted-foreground">SWAVE Earned</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1" data-testid="tab-posts">
            Posts
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex-1" data-testid="tab-likes">
            Likes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4 mt-4">
          {isLoadingPosts ? (
            Array.from({ length: 2 }).map((_, i) => (
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
            <div className="text-center py-12 space-y-3" data-testid="empty-posts">
              <p className="text-muted-foreground">No posts yet</p>
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
        </TabsContent>
        <TabsContent value="likes" className="space-y-4 mt-4">
          {isLoadingLikedPosts ? (
            Array.from({ length: 2 }).map((_, i) => (
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
          ) : likedPosts.length === 0 ? (
            <div className="text-center py-12 space-y-3" data-testid="empty-liked-posts">
              <p className="text-muted-foreground">No liked posts in the last 100 posts</p>
              <p className="text-xs text-muted-foreground">Only recent posts are checked for likes</p>
            </div>
          ) : (
            likedPosts.map((post) => (
              <PostCard
                key={post.id.toString()}
                post={post}
                onLike={handleLike}
                onUnlike={handleUnlike}
                isLiking={isTransacting}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentUser={user || null}
      />
    </div>
  );
}
