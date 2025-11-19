import { z } from "zod";

// ============================================================================
// BLOCKCHAIN TYPES
// ============================================================================

export interface User {
  address: string;
  username: string;
  profileHash: string;
  referrer: string;
  isVerified: boolean;
  verificationStake: bigint;
  totalEarned: bigint;
  followerCount: bigint;
  followingCount: bigint;
  postCount: bigint;
}

export interface Post {
  id: bigint;
  author: string;
  contentIPFSHash: string;
  timestamp: bigint;
  likeCount: bigint;
  totalRewards: bigint;
  isAd: boolean;
  exists: boolean;
}

// ============================================================================
// IPFS METADATA STRUCTURES
// ============================================================================

export interface ProfileMetadata {
  username: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  website?: string;
  location?: string;
}

export interface PostContent {
  text: string;
  images?: string[];
  createdAt: number;
  authorAddress: string;
}

// Zod schemas for validation
export const profileMetadataSchema = z.object({
  username: z.string().min(3).max(30),
  bio: z.string().max(160).optional(),
  avatarUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  location: z.string().max(50).optional(),
});

export const postContentSchema = z.object({
  text: z.string().min(1).max(280),
  images: z.array(z.string().url()).max(4).optional(),
  createdAt: z.number(),
  authorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export type ProfileMetadataInput = z.infer<typeof profileMetadataSchema>;
export type PostContentInput = z.infer<typeof postContentSchema>;

// ============================================================================
// WEB3 PROVIDER TYPES
// ============================================================================

export interface Web3State {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  swaveBalance: string;
  isLoading: boolean;
}

export interface ContractAddresses {
  swaveToken: string;
  socialWave: string;
}

// ============================================================================
// FRONTEND STATE TYPES
// ============================================================================

export interface EnrichedUser extends User {
  profile?: ProfileMetadata;
  isFollowing?: boolean;
}

export interface EnrichedPost extends Post {
  content?: PostContent;
  authorProfile?: ProfileMetadata;
  hasLiked?: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface RegisterUserRequest {
  username: string;
  profileMetadata: ProfileMetadata;
  referrerAddress?: string;
}

export interface CreatePostRequest {
  content: PostContent;
  isAd: boolean;
}

export interface IPFSUploadResponse {
  ipfsHash: string;
  gatewayUrl: string;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  hash?: string;
  error?: string;
}

export interface TokenReward {
  amount: string;
  reason: 'post_creation' | 'like_milestone' | 'referral';
  level?: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: 'like' | 'follow' | 'reward' | 'milestone';
  from: string;
  postId?: bigint;
  reward?: TokenReward;
  timestamp: number;
  read: boolean;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface UserStats {
  totalPosts: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  totalEarned: string;
  joinedAt: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  totalTokensDistributed: string;
  topEarners: Array<{
    address: string;
    username: string;
    earned: string;
  }>;
}
