import { useQuery } from '@tanstack/react-query';
import { useSocialWaveContract } from './useContract';
import { useWeb3 } from '@/contexts/Web3Context';
import { fetchPostContent, fetchProfileMetadata } from '@/lib/ipfs/client';
import { LocalCache } from '@/lib/cache';
import type { EnrichedPost, EnrichedUser, Post, User } from '@shared/schema';

export function useUser(address: string | null | undefined) {
  const contract = useSocialWaveContract();

  return useQuery({
    queryKey: ['user', address],
    queryFn: async (): Promise<EnrichedUser | null> => {
      if (!contract || !address) return null;

      const cacheKey = `user_${address.toLowerCase()}`;
      const cached = LocalCache.get<EnrichedUser>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const userData = await contract.getUser(address);
        
        if (!userData.exists) {
          return null;
        }
        
        let profile = undefined;
        if (userData.profileIPFSHash) {
          const fetchedProfile = await fetchProfileMetadata(userData.profileIPFSHash);
          if (fetchedProfile) profile = fetchedProfile;
        }

        const enrichedUser = {
          address,
          username: userData.username,
          profileHash: userData.profileIPFSHash,
          isVerified: userData.isVerified,
          postCount: userData.postCount,
          followerCount: userData.followerCount,
          followingCount: userData.followingCount,
          totalEarned: userData.totalEarned,
          referrer: userData.referrer,
          verificationStake: userData.verificationStake,
          profile,
        };

        LocalCache.set(cacheKey, enrichedUser);
        return enrichedUser;
      } catch (error) {
        // Silently handle RPC errors
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
        
        if (!postData.exists) {
          return null;
        }
        
        let content = undefined;
        if (postData.contentIPFSHash) {
          const fetchedContent = await fetchPostContent(postData.contentIPFSHash);
          if (fetchedContent) content = fetchedContent;
        }

        let authorProfile = undefined;
        try {
          const authorData = await contract.getUser(postData.author);
          if (authorData.exists && authorData.profileIPFSHash) {
            const fetchedProfile = await fetchProfileMetadata(authorData.profileIPFSHash);
            if (fetchedProfile) authorProfile = fetchedProfile;
          }
        } catch (err) {
          // Silently handle
        }

        let hasLiked = false;
        if (address) {
          try {
            hasLiked = await contract.hasLikedPost(address, postId);
          } catch (err) {
            // Silently handle
          }
        }

        return {
          id: postData.id,
          author: postData.author,
          contentIPFSHash: postData.contentIPFSHash,
          timestamp: postData.timestamp,
          likeCount: postData.likeCount,
          totalRewards: postData.totalRewards,
          isAd: postData.isAd,
          exists: postData.exists,
          content,
          authorProfile,
          hasLiked,
        };
      } catch (error) {
        // Silently handle RPC errors
        return null;
      }
    },
    enabled: !!contract && postId !== null && postId !== undefined,
    staleTime: 30000,
  });
}

export function usePosts(startId: number = 0, limit: number = 50) {
  const contract = useSocialWaveContract();
  const { address } = useWeb3();

  return useQuery({
    queryKey: ['posts', startId, limit],
    queryFn: async (): Promise<EnrichedPost[]> => {
      if (!contract) return [];

      const cacheKey = `posts_${startId}_${limit}`;
      const cached = LocalCache.get<EnrichedPost[]>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const nextPostId = await contract.nextPostId();
        const totalPosts = Number(nextPostId) - 1;
        
        if (totalPosts <= 0) return [];

        const effectiveEnd = totalPosts - startId;
        if (effectiveEnd <= 0) return [];
        
        const endId = effectiveEnd;
        const fetchStartId = Math.max(1, endId - limit + 1);
        
        const posts: EnrichedPost[] = [];
        
        for (let i = endId; i >= fetchStartId; i--) {
          try {
            const postData = await contract.getPost(BigInt(i));
            
            if (!postData.exists) continue;
            
            let content = undefined;
            if (postData.contentIPFSHash) {
              const fetchedContent = await fetchPostContent(postData.contentIPFSHash);
              if (fetchedContent) content = fetchedContent;
            }

            let authorProfile = undefined;
            try {
              const authorData = await contract.getUser(postData.author);
              if (authorData.exists && authorData.profileIPFSHash) {
                const fetchedProfile = await fetchProfileMetadata(authorData.profileIPFSHash);
                if (fetchedProfile) authorProfile = fetchedProfile;
              }
            } catch (err) {
              // Silently handle
            }

            let hasLiked = false;
            if (address) {
              try {
                hasLiked = await contract.hasLikedPost(BigInt(i), address);
              } catch (err) {
                // Silently handle
              }
            }

            posts.push({
              id: postData.id,
              author: postData.author,
              contentIPFSHash: postData.contentIPFSHash,
              timestamp: postData.timestamp,
              likeCount: postData.likeCount,
              totalRewards: postData.totalRewards,
              isAd: postData.isAd,
              exists: postData.exists,
              content,
              authorProfile,
              hasLiked,
            });
          } catch (error) {
            // Silently handle - continue fetching other posts
          }
        }

        LocalCache.set(cacheKey, posts);
        return posts;
      } catch (error) {
        // Silently handle RPC errors
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

        const nextPostId = await contract.nextPostId();
        const totalPosts = Number(nextPostId) - 1;
        
        const posts: EnrichedPost[] = [];
        
        for (let i = totalPosts - 1; i >= 0; i--) {
          try {
            const postData = await contract.getPost(BigInt(i));
            
            if (!postData.exists || postData.author.toLowerCase() !== userAddress.toLowerCase()) {
              continue;
            }

            let content = undefined;
            if (postData.contentIPFSHash) {
              const fetchedContent = await fetchPostContent(postData.contentIPFSHash);
              if (fetchedContent) content = fetchedContent;
            }

            let authorProfile = undefined;
            try {
              if (userData.exists && userData.profileIPFSHash) {
                const fetchedProfile = await fetchProfileMetadata(userData.profileIPFSHash);
                if (fetchedProfile) authorProfile = fetchedProfile;
              }
            } catch (err) {
              // Silently handle
            }

            let hasLiked = false;
            if (currentUser) {
              try {
                hasLiked = await contract.hasLikedPost(BigInt(i), currentUser);
              } catch (err) {
                // Silently handle
              }
            }

            posts.push({
              id: postData.id,
              author: postData.author,
              contentIPFSHash: postData.contentIPFSHash,
              timestamp: postData.timestamp,
              likeCount: postData.likeCount,
              totalRewards: postData.totalRewards,
              isAd: postData.isAd,
              exists: postData.exists,
              content,
              authorProfile,
              hasLiked,
            });

            if (posts.length >= userPostCount) break;
          } catch (error) {
            // Silently handle - continue fetching other posts
          }
        }

        return posts;
      } catch (error) {
        // Silently handle RPC errors
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
        // Silently handle RPC errors
        return false;
      }
    },
    enabled: !!contract && !!address && !!targetAddress && address.toLowerCase() !== targetAddress.toLowerCase(),
    staleTime: 30000,
  });
}
