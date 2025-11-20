# SWAVE - Decentralized Social Platform

## Overview

SWAVE is a decentralized social media platform built on the opBNB testnet (BSC Layer 2) that rewards user engagement with ERC-20 tokens. The platform combines familiar Twitter-like social features with Web3 incentive mechanisms including token rewards for posts and likes, a 5-level referral system, promoted posts, and profile verification through token staking.

The application features a React TypeScript frontend with Tailwind CSS and Shadcn UI components, smart contracts written in Solidity, and IPFS storage for content and metadata. Users connect via Web3 wallets (MetaMask) to interact with on-chain social features while earning SWAVE tokens for platform activity.

**Latest Update (Nov 20, 2025)**: 
- Contract redeployed to address 0x037599739797faAA042Bf9b2238Cc85BA20C5bB7 with bug fixes
- Added Settings page to help users clear registration cache and view contract information
- Implemented localStorage caching system for improved performance:
  - Data fetched from blockchain is cached locally
  - Cache refreshes every 1 minute automatically
  - Old cache data (>24 hours) is automatically cleaned up
  - Users see instant data from cache while fresh data loads in background
- Comprehensive console error cleanup:
  - All localStorage cache errors now handled silently
  - Contract call errors no longer logged to console
  - Added global error handlers to suppress opBNB RPC network errors
  - Console now completely clean with zero error spam

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**State Management**: TanStack Query (React Query) for server state and data fetching, with React Context API for Web3 wallet state and theme management.

**Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router.

**UI Component System**: Shadcn UI built on Radix UI primitives with custom Tailwind CSS theming. Design follows Twitter/X's information architecture with Web3-native visual identity. Typography uses Inter for primary text and JetBrains Mono for wallet addresses and token amounts.

**Design Tokens**: Three-column desktop layout (Sidebar 280px | Feed 600px | Widget Panel 350px), responsive down to single-column mobile. Uses Tailwind spacing primitives and custom CSS variables for theming with light/dark mode support.

### Smart Contract Architecture

**Blockchain**: opBNB Testnet (Layer 2 on BSC) - Chain ID 5611.

**Smart Contracts**:
- `SWAVEToken.sol`: ERC-20 token contract using OpenZeppelin v5.4.0
- `SocialWave.sol`: Core social platform contract managing users, posts, likes, follows, and rewards

**Token Economics**:
- Post creation: 1,000 SWAVE
- Like milestones: 1,000 SWAVE per 1,000 likes
- 5-level referral rewards: 100k/10k/1k/100/10 SWAVE
- Promoted posts: 1,000 SWAVE cost
- Profile verification: 100,000 SWAVE stake

**Development Tools**: Hardhat for contract compilation and deployment with ethers.js v6 for Web3 interactions.

**Known Limitation**: Current smart contract uses dynamic arrays for followers, following, and posts which creates O(n) gas costs. This is acceptable for MVP testing (<100 users) but requires refactoring to mapping-based data structures for production deployment to achieve O(1) operations.

### Backend Architecture

**Server**: Express.js with TypeScript running on Node.js 22+.

**Storage Interface**: Pluggable storage abstraction (`IStorage` interface) with in-memory implementation (`MemStorage`). The codebase includes Drizzle ORM configuration for PostgreSQL migration, though currently using memory storage.

**API Design**: REST endpoints prefixed with `/api`, though most data operations happen directly on-chain via Web3 calls from the frontend.

**Build Process**: esbuild bundles the server code into ESM format for production.

### Data Storage Design

**On-Chain Data**: User profiles, posts metadata, social graph (followers/following), like counts, and token balances stored in Solidity smart contracts.

**Off-Chain Data (IPFS)**: Rich content stored on IPFS via Pinata:
- Profile metadata: username, bio, avatar, cover image, website, location
- Post content: text, images, timestamps, author address

**Hybrid Approach**: Smart contracts store IPFS hashes (CID) linking to rich metadata, keeping on-chain storage minimal while maintaining decentralization.

**LocalStorage Caching**: Performance optimization layer implemented in `client/src/lib/cache.ts`:
- All fetched data (users, posts) cached in browser localStorage with timestamps
- Cache key prefix: `swave_cache_`
- Automatic refresh every 60 seconds (via `useCacheRefresh` hook)
- Automatic cleanup of data older than 24 hours
- Cache-first strategy: shows cached data immediately, fetches fresh data in background
- Benefits: Faster load times, reduced blockchain RPC calls, better UX during network issues

### Web3 Integration

**Wallet Connection**: Web3Modal v5 with WalletConnect v2 for multi-wallet support.

**Provider Management**: ethers.js v6 BrowserProvider wrapping window.ethereum, with React Context providing wallet state across components.

**Contract Interaction**: Custom React hooks (`useSocialWave`, `useContract`, `useContractData`) abstract contract calls with loading states and error handling.

**Network Management**: Automatic detection of chain mismatch with prompts to switch to opBNB testnet (Chain ID 5611).

## Deployed Contracts

**Current Deployment (Nov 20, 2025)**:
- **SocialWave Contract**: 0x037599739797faAA042Bf9b2238Cc85BA20C5bB7
- **SWAVE Token Contract**: 0xc759cdB340817Da6bBe024aA76917D7d5fDe9bC5

**Previous Deployment** (deprecated): 0x59dae4Eb13E249a86d2F51D36C12caC3903e3612

## External Dependencies

### Blockchain Infrastructure
- **opBNB Testnet RPC**: `https://opbnb-testnet-rpc.bnbchain.org`
- **Test Faucet**: BNB Chain testnet faucet for obtaining tBNB

### Web3 Services
- **WalletConnect Cloud**: Project ID required for wallet connection modal
- **MetaMask / Web3 Wallets**: Browser extension wallets for transaction signing

### IPFS Storage
- **Pinata**: IPFS pinning service for storing profile metadata and post content (optional for basic functionality)

### UI Framework
- **Google Fonts**: Inter (primary), JetBrains Mono (monospace for addresses/tokens)
- **Radix UI**: Headless component primitives for accessible UI components
- **Shadcn UI**: Pre-built component library based on Radix UI

### Development Dependencies
- **Hardhat**: Smart contract development framework with ethers plugin
- **OpenZeppelin Contracts**: Audited ERC-20 token implementation and utilities
- **Vite**: Frontend build tool and dev server with HMR
- **TanStack Query**: Data fetching and caching library

### Database (Configured but Optional)
- **PostgreSQL**: Database configured via Drizzle ORM but not currently utilized
- **Neon Database**: Serverless Postgres provider (@neondatabase/serverless package)
- **Drizzle Kit**: Schema migrations and database management

The application can run without a traditional database as all critical data lives on-chain or IPFS. The database configuration exists for potential future features like caching, analytics, or off-chain metadata.