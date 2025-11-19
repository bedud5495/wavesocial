import { useState } from 'react';
import { useSocialWaveContract, useTokenContract } from './useContract';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { uploadPostContent, uploadProfileMetadata, fetchProfileMetadata, fetchPostContent } from '@/lib/ipfs/client';
import type { ProfileMetadata, PostContent, User, Post } from '@shared/schema';
import { parseUnits } from 'ethers';
import { TOKEN_REWARDS } from '@/lib/web3/config';

export function useSocialWave() {
  const contract = useSocialWaveContract();
  const tokenContract = useTokenContract();
  const { address, refreshBalance } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const registerUser = async (username: string, profileMetadata: ProfileMetadata, referrerAddress?: string) => {
    if (!contract || !address) {
      toast({ title: 'Error', description: 'Please connect your wallet', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const profileHash = await uploadProfileMetadata(profileMetadata);
      const tx = await contract.registerUser(username, profileHash, referrerAddress || '0x0000000000000000000000000000000000000000');
      await tx.wait();

      toast({
        title: 'Registration Successful',
        description: 'Welcome to SWAVE! You can now start creating posts and earning tokens.',
      });

      refreshBalance();
      queryClient.invalidateQueries({ queryKey: ['user', address] });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register user',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (content: string, images: string[], isAd: boolean) => {
    if (!contract || !address || !tokenContract) {
      toast({ title: 'Error', description: 'Please connect your wallet', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const postContent: PostContent = {
        text: content,
        images: images.length > 0 ? images : undefined,
        createdAt: Date.now(),
        authorAddress: address,
      };

      const contentHash = await uploadPostContent(postContent);

      if (isAd) {
        const adCost = parseUnits(TOKEN_REWARDS.AD_COST, 18);
        const approveTx = await tokenContract.approve(await contract.getAddress(), adCost);
        await approveTx.wait();
      }

      const tx = await contract.createPost(contentHash, isAd);
      const receipt = await tx.wait();

      const reward = isAd ? 0 : parseInt(TOKEN_REWARDS.POST_CREATION);

      toast({
        title: 'Post Created!',
        description: isAd 
          ? `Your promoted post is now live!` 
          : `Post created successfully! You earned ${reward.toLocaleString()} SWAVE tokens.`,
      });

      refreshBalance();
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts', address] });
      queryClient.invalidateQueries({ queryKey: ['user', address] });
      return receipt;
    } catch (error: any) {
      console.error('Create post error:', error);
      toast({
        title: 'Failed to Create Post',
        description: error.message || 'Transaction failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const likePost = async (postId: bigint) => {
    if (!contract || !address) return;

    setIsLoading(true);
    try {
      const tx = await contract.likePost(postId);
      await tx.wait();

      toast({
        title: 'Post Liked',
        description: 'Your like has been recorded on-chain',
      });

      refreshBalance();
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error: any) {
      console.error('Like post error:', error);
      toast({
        title: 'Failed to Like Post',
        description: error.message || 'Transaction failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unlikePost = async (postId: bigint) => {
    if (!contract || !address) return;

    setIsLoading(true);
    try {
      const tx = await contract.unlikePost(postId);
      await tx.wait();

      toast({
        title: 'Post Unliked',
        description: 'Your like has been removed',
      });

      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error: any) {
      console.error('Unlike post error:', error);
      toast({
        title: 'Failed to Unlike Post',
        description: error.message || 'Transaction failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const followUser = async (userAddress: string) => {
    if (!contract || !address) return;

    setIsLoading(true);
    try {
      const tx = await contract.followUser(userAddress);
      await tx.wait();

      toast({
        title: 'User Followed',
        description: 'You are now following this user',
      });

      queryClient.invalidateQueries({ queryKey: ['isFollowing', address, userAddress] });
      queryClient.invalidateQueries({ queryKey: ['user', userAddress] });
      queryClient.invalidateQueries({ queryKey: ['user', address] });
    } catch (error: any) {
      console.error('Follow user error:', error);
      toast({
        title: 'Failed to Follow User',
        description: error.message || 'Transaction failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (userAddress: string) => {
    if (!contract || !address) return;

    setIsLoading(true);
    try {
      const tx = await contract.unfollowUser(userAddress);
      await tx.wait();

      toast({
        title: 'User Unfollowed',
        description: 'You have unfollowed this user',
      });

      queryClient.invalidateQueries({ queryKey: ['isFollowing', address, userAddress] });
      queryClient.invalidateQueries({ queryKey: ['user', userAddress] });
      queryClient.invalidateQueries({ queryKey: ['user', address] });
    } catch (error: any) {
      console.error('Unfollow user error:', error);
      toast({
        title: 'Failed to Unfollow User',
        description: error.message || 'Transaction failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyProfile = async () => {
    if (!contract || !address || !tokenContract) return;

    setIsLoading(true);
    try {
      const stakeCost = parseUnits(TOKEN_REWARDS.VERIFICATION_STAKE, 18);
      const approveTx = await tokenContract.approve(await contract.getAddress(), stakeCost);
      await approveTx.wait();

      const tx = await contract.verifyProfile();
      await tx.wait();

      toast({
        title: 'Profile Verified!',
        description: `You staked ${parseInt(TOKEN_REWARDS.VERIFICATION_STAKE).toLocaleString()} SWAVE tokens and earned your verification badge.`,
      });

      refreshBalance();
      queryClient.invalidateQueries({ queryKey: ['user', address] });
    } catch (error: any) {
      console.error('Verify profile error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Transaction failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUser = async (userAddress: string): Promise<User | null> => {
    if (!contract) return null;

    try {
      const user = await contract.getUser(userAddress);
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  };

  const getPost = async (postId: bigint): Promise<Post | null> => {
    if (!contract) return null;

    try {
      const post = await contract.getPost(postId);
      return post;
    } catch (error) {
      console.error('Get post error:', error);
      return null;
    }
  };

  return {
    registerUser,
    createPost,
    likePost,
    unlikePost,
    followUser,
    unfollowUser,
    verifyProfile,
    getUser,
    getPost,
    isLoading,
  };
}
