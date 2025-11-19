# SWAVE - Decentralized Twitter dApp

A decentralized social media platform built on opBNB testnet with token rewards, IPFS storage, and a comprehensive referral system.

## Features

### Core Functionality
- **ERC-20 SWAVE Token**: Reward system for platform engagement
- **User Registration**: On-chain profiles with IPFS metadata storage
- **Post Creation**: Earn 1,000 SWAVE tokens per post
- **Like System**: Milestone rewards (1,000 SWAVE per 1,000 likes)
- **Follow/Unfollow**: Social graph stored on-chain
- **5-Level Referral System**: Earn 100k/10k/1k/100/10 SWAVE tokens
- **Promoted Posts**: Pay 1,000 SWAVE to create ads
- **Profile Verification**: Stake 100,000 SWAVE for verified badge

### Technical Stack
- **Blockchain**: opBNB Testnet (BSC Layer 2)
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Web3**: ethers.js v6
- **Storage**: IPFS (Pinata) for content and metadata
- **State Management**: TanStack Query

## Getting Started

### Prerequisites
1. Node.js 22.x or later
2. MetaMask or another Web3 wallet
3. opBNB Testnet tBNB (get from [faucet](https://www.bnbchain.org/en/testnet-faucet))
4. WalletConnect Project ID (free from [WalletConnect Cloud](https://cloud.walletconnect.com/))
5. Optional: Pinata account for IPFS

### Installation

1. Clone the repository
```bash
git clone <your-repo>
cd <your-repo>
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your keys:
```env
# Deployment (for contract deployment only)
PRIVATE_KEY=your_wallet_private_key

# Frontend (required)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Contract addresses (after deployment)
VITE_SWAVE_TOKEN_ADDRESS=
VITE_SOCIAL_WAVE_ADDRESS=

# IPFS (optional, defaults to public gateway)
VITE_PINATA_JWT=your_pinata_jwt
```

### Deploy Smart Contracts

1. Compile contracts (requires Node.js 22.x)
```bash
npx hardhat compile
```

2. Deploy to opBNB Testnet
```bash
npx hardhat run scripts/deploy.ts --network opbnbTestnet
```

3. Update `.env` with deployed contract addresses

### Run the Application

```bash
npm run dev
```

The app will be available at http://localhost:5000

## Smart Contract Architecture

### SWAVEToken (ERC-20)
- Standard ERC-20 implementation
- Minting controlled by SocialWave contract
- Used for all platform rewards and payments

### SocialWave (Main Contract)
- User registration with referrer tracking
- Post creation with IPFS hash storage
- Like/unlike functionality with milestone rewards
- Follow/unfollow social graph
- Verification staking mechanism
- Gas-optimized with events for off-chain indexing

## Token Economics

| Action | Reward |
|--------|--------|
| Create Post | 1,000 SWAVE |
| 1,000 Likes Milestone | 1,000 SWAVE |
| Level 1 Referral | 100,000 SWAVE |
| Level 2 Referral | 10,000 SWAVE |
| Level 3 Referral | 1,000 SWAVE |
| Level 4 Referral | 100 SWAVE |
| Level 5 Referral | 10 SWAVE |

### Costs
- Create Promoted Post: 1,000 SWAVE
- Profile Verification: 100,000 SWAVE (staked, refundable)

## Project Structure

```
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment scripts
├── client/            # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── contexts/    # React contexts (Web3, Theme)
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilities (Web3, IPFS)
│   │   ├── pages/       # Route pages
│   │   └── contracts/   # Contract ABIs
├── shared/            # Shared types
└── server/            # Express backend (minimal)
```

## Development

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run check
```

## Network Configuration

### opBNB Testnet
- **RPC URL**: https://opbnb-testnet-rpc.bnbchain.org
- **Chain ID**: 5611
- **Currency**: tBNB
- **Explorer**: https://opbnb-testnet.bscscan.com

## Security Considerations

- Never commit private keys or secrets
- Smart contracts use ReentrancyGuard for protection
- All user inputs are validated on-chain
- IPFS hashes are the only data stored on-chain (gas optimization)
- Token approvals required for paid features

## Contributing

This is a demonstration project. For production use:
1. Conduct thorough smart contract audits
2. Implement comprehensive testing
3. Add admin controls and upgrade mechanisms
4. Implement content moderation
5. Add rate limiting and spam protection

## License

MIT

## Support

For issues and questions:
- Smart Contracts: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Frontend: Check browser console for Web3 errors
- Testnet tokens: Use the opBNB faucet

## Roadmap

Future enhancements:
- Repost functionality
- Comment system with threaded replies
- Token staking for premium features
- Direct messaging with encrypted IPFS
- Analytics dashboard
- NFT profile pictures
- Cross-chain bridge support
