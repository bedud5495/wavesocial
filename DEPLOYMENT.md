# SWAVE Deployment Guide

## ⚠️ IMPORTANT: Gas Optimization Required Before Production

### Critical Issue: Unbounded Array Iteration

The current smart contract implementation uses **dynamic arrays for followers, following, and posts**. This design has serious gas optimization concerns for production:

**Problem:**
- Every follow/unfollow operation iterates through arrays (O(n) complexity)
- As the platform grows, gas costs become prohibitive
- Potential DoS risk when arrays become very large

**Recommended Solution:**
Replace arrays with **mappings** for O(1) operations:

```solidity
// Instead of: address[] followers;
mapping(address => bool) public isFollowing;
mapping(address => bool) public hasFollower;
```

**For MVP Testing:** The current implementation works fine for small-scale testing (< 100 users).  
**For Production:** Implement mapping-based data structures before mainnet deployment.

See detailed gas optimization guide at end of this document.

---

## Prerequisites

1. **Node.js 22.x or later** (required for Hardhat compilation)
2. **opBNB Testnet BNB**: Get testnet BNB from [opBNB Testnet Faucet](https://www.bnbchain.org/en/testnet-faucet)
3. **WalletConnect Project ID**: Get free project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
4. **Pinata Account** (Optional): For IPFS storage - [Pinata Cloud](https://pinata.cloud/)

## Step 1: Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your `.env` file:
```env
# Your wallet private key (DO NOT SHARE!)
PRIVATE_KEY=your_wallet_private_key_here

# WalletConnect Project ID (required for wallet connection)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: Pinata for IPFS (can use later)
VITE_PINATA_JWT=your_pinata_jwt_token
```

## Step 2: Compile Contracts

```bash
npx hardhat compile
```

## Step 3: Deploy to opBNB Testnet

```bash
npx hardhat run scripts/deploy.ts --network opbnbTestnet
```

This will deploy:
- SWAVE ERC-20 Token contract
- SocialWave main contract

Save the deployed contract addresses to your `.env` file.

## Step 4: Verify Contracts (Optional)

You can verify your contracts on opBNBScan for transparency.

## Contract Features

### SWAVE Token
- ERC-20 standard token
- Minted by SocialWave contract for rewards
- Used for ads and verification staking

### SocialWave Contract
- **User Registration**: With referral system (5 levels)
- **Post Creation**: Earn 1,000 SWAVE per post
- **Like System**: +1,000 SWAVE per 1,000 likes milestone
- **Follow/Unfollow**: Social graph on-chain
- **Ads**: Pay 1,000 SWAVE to create promoted posts
- **Verification**: Stake 100,000 SWAVE to get verified badge
- **IPFS Integration**: Store post content off-chain, only hash on-chain

## Gas Optimization & Production Readiness

### Current MVP Implementation

**Suitable for:**
- ✅ Testing on opBNB Testnet
- ✅ Small-scale demos (< 100 users)
- ✅ Proof of concept presentations

**Current optimizations:**
- Events for off-chain indexing
- Minimal on-chain storage (IPFS hashes only)
- ReentrancyGuard protection

### Before Mainnet Deployment

**Required changes:**

1. **Replace array-based data structures with mappings:**
```solidity
// Current (inefficient)
address[] followers;
address[] following;

// Production (efficient)
mapping(address => mapping(address => bool)) public following;
mapping(address => uint256) public followerCount;
```

2. **Implement pagination for all list-returning functions**

3. **Add off-chain indexer** (The Graph or custom) for complex queries

4. **Professional security audit** recommended

5. **Gas profiling under load** with realistic user counts

### Why This Matters

- **Current design:** O(n) gas costs per operation
- **Production design:** O(1) gas costs per operation
- **Risk:** DoS attacks possible when arrays grow large
- **Impact:** Can make platform unusable without fixes

## Security Features

- ReentrancyGuard protection
- Ownership controls
- Input validation
- Safe token transfers

**Additional Recommendations:**
- Implement rate limiting
- Add content moderation hooks
- Consider upgradeable proxy pattern
- Set up multi-sig for admin operations
