import { useQuery } from '@tanstack/react-query';
import { useSocialWaveContract } from './useContract';
import { useWeb3 } from '@/contexts/Web3Context';
import { fetchPostContent, fetchProfileMetadata } from '@/lib/ipfs/client';
import type { EnrichedPost, EnrichedUser, Post, User } from '@shared/schema';

export function useUser(address: string | null | undefined) {
  const contract = useSocialWaveContract();

  return useQuery({
    queryKey: ['user', address],
    queryFn: async (): Promise<EnrichedUser | null> => {
      if (!contract || !address) return null;

      try {
        const userData = await contract.getUser(address);
        
        let profile = undefined;
        if (userData.profileHash) {
          const fetchedProfile = await fetchProfileMetadata(userData.profileHash);
          if (fetchedProfile) profile = fetchedProfile;
        }

        return {
          address,
          username: userData.username,
          profileHash: userData.profileHash,
          isVerified: userData.isVerified,
          postCount: userData.postCount,
          followerCount: userData.followerCount,
          followingCount: userData.followingCount,
          totalEarned: userData.totalEarned,
          referrer: userData.referrer,
          referralCount: userData.referralCount,
          registeredAt: userData.registeredAt,
          profile,
        };
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    enabled: !!contract && !!address,
    staleTime: 30000,
  });
}

export function usePost(postId: bigint | null | undefined) {
  const contract = useSocialWaveContract();
  const { address } = useWeb3();

  return useQuery({
    queryKey: ['post', postId?.toString()],
    queryFn: async (): Promise<EnrichedPost | null> => {
      if (!contract || postId === null || postId === undefined) return null;

      try {
        const postData = await contract.getPost(postId);
        
        let content = undefined;
        if (postData.contentHash) {
          const fetchedContent = await fetchPostContent(postData.contentHash);
          if (fetchedContent) content = fetchedContent;
        }

        let authorProfile = undefined;
        try {
          const authorData = await contract.getUser(postData.author);
          if (authorData.profileHash) {
            const fetchedProfile = await fetchProfileMetadata(authorData.profileHash);
            if (fetchedProfile) authorProfile = fetchedProfile;
          }
        } catch (err) {
          console.error('Error fetching author profile:', err);
        }

        let hasLiked = false;
        if (address) {
          try {
            hasLiked = await contract.hasLikedPost(address, postId);
          } catch (err) {
            console.error('Error checking like status:', err);
          }
        }

        return {
          id: postData.id,
          author: postData.author,
          contentHash: postData.contentHash,
          timestamp: postData.timestamp,
          likeCount: postData.likeCount,
          totalRewards: postData.totalRewards,
          isAd: postData.isAd,
          content,
          authorProfile,
          hasLiked,
        };
      } catch (error) {
        console.error('Error fetching post:', error);
        return null;
      }
    },
    enabled: !!contract && postId !== null && postId !== undefined,
    staleTime: 30000,
  });
}

export function usePosts(startId: number = 0, limit: number = 20) {
  const contract = useSocialWaveContract();
  const { address } = useWeb3();

  return useQuery({
    queryKey: ['posts', startId, limit],
    queryFn: async (): Promise<EnrichedPost[]> => {
      if (!contract) return [];

      try {
        const postCount = await contract.postCount();
        const totalPosts = Number(postCount);
        
        if (totalPosts === 0) return [];

        const endId = Math.max(0, totalPosts - startId);
        const fetchStartId = Math.max(0, endId - limit);
        
        const posts: EnrichedPost[] = [];
        
        for (let i = endId - 1; i >= fetchStartId; i--) {
          try {
            const postData = await contract.getPost(BigInt(i));
            
            let content = undefined;
            if (postData.contentHash) {
              const fetchedContent = await fetchPostContent(postData.contentHash);
              if (fetchedContent) content = fetchedContent;
            }

            let authorProfile = undefined;
            try {
              const authorData = await contract.getUser(postData.author);
              if (authorData.profileHash) {
                const fetchedProfile = await fetchProfileMetadata(authorData.profileHash);
                if (fetchedProfile) authorProfile = fetchedProfile;
              }
            } catch (err) {
              console.error('Error fetching author:', err);
            }

            let hasLiked = false;
            if (address) {
              try {
                hasLiked = await contract.hasLikedPost(address, BigInt(i));
              } catch (err) {
                console.error('Error checking like:', err);
              }
            }

            posts.push({
              id: postData.id,
              author: postData.author,
              contentHash: postData.contentHash,
              timestamp: postData.timestamp,
              likeCount: postData.likeCount,
              totalRewards: postData.totalRewards,
              isAd: postData.isAd,
              content,
              authorProfile,
              hasLiked,
            });
          } catch (error) {
            console.error(`Error fetching post ${i}:`, error);
          }
        }

        return posts;
      } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
      }
    },
    enabled: !!contract,
    staleTime: 30000,
  });
}

export function useUserPosts(userAddress: string | null | undefined) {
  const contract = useSocialWaveContract();
  const { address: currentUser } = useWeb3();

  return useQuery({
    queryKey: ['userPosts', userAddress],
    queryFn: async (): Promise<EnrichedPost[]> => {
      if (!contract || !userAddress) return [];

      try {
        const userData = await contract.getUser(userAddress);
        const userPostCount = Number(userData.postCount);
        
        if (userPostCount === 0) return [];

        const postCount = await contract.postCount();
        const totalPosts = Number(postCount);
        
        const posts: EnrichedPost[] = [];
        
        for (let i = totalPosts - 1; i >= 0; i--) {
          try {
            const postData = await contract.getPost(BigInt(i));
            
            if (postData.author.toLowerCase() !== userAddress.toLowerCase()) {
              continue;
            }

            let content = undefined;
            if (postData.contentHash) {
              const fetchedContent = await fetchPostContent(postData.contentHash);
              if (fetchedContent) content = fetchedContent;
            }

            let authorProfile = undefined;
            try {
              if (userData.profileHash) {
                const fetchedProfile = await fetchProfileMetadata(userData.profileHash);
                if (fetchedProfile) authorProfile = fetchedProfile;
              }
            } catch (err) {
              console.error('Error fetching profile:', err);
            }

            let hasLiked = false;
            if (currentUser) {
              try {
                hasLiked = await contract.hasLikedPost(currentUser, BigInt(i));
              } catch (err) {
                console.error('Error checking like:', err);
              }
            }

            posts.push({
              id: postData.id,
              author: postData.author,
              contentHash: postData.contentHash,
              timestamp: postData.timestamp,
              likeCount: postData.likeCount,
              totalRewards: postData.totalRewards,
              isAd: postData.isAd,
              content,
              authorProfile,
              hasLiked,
            });

            if (posts.length >= userPostCount) break;
          } catch (error) {
            console.error(`Error fetching post ${i}:`, error);
          }
        }

        return posts;
      } catch (error) {
        console.error('Error fetching user posts:', error);
        return [];
      }
    },
    enabled: !!contract && !!userAddress,
    staleTime: 30000,
  });
}

export function useIsFollowing(targetAddress: string | null | undefined) {
  const contract = useSocialWaveContract();
  const { address } = useWeb3();

  return useQuery({
    queryKey: ['isFollowing', address, targetAddress],
    queryFn: async (): Promise<boolean> => {
      if (!contract || !address || !targetAddress) return false;

      try {
        return await contract.isFollowing(address, targetAddress);
      } catch (error) {
        console.error('Error checking follow status:', error);
        return false;
      }
    },
    enabled: !!contract && !!address && !!targetAddress && address.toLowerCase() !== targetAddress.toLowerCase(),
    staleTime: 30000,
  });
}
