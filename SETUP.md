# SWAVE Setup Guide

## Quick Start

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# ============================================================================
# BLOCKCHAIN CONFIGURATION
# ============================================================================

# Private key for deploying contracts (KEEP THIS SECRET!)
PRIVATE_KEY=your_wallet_private_key_here

# Smart Contract Addresses (fill in AFTER deployment)
VITE_SWAVE_TOKEN_ADDRESS=0x...  # Token contract address
VITE_SOCIAL_WAVE_ADDRESS=0x...  # Main dApp contract address

# opBNB Testnet Configuration
VITE_CHAIN_ID=5611
VITE_RPC_URL=https://opbnb-testnet-rpc.bnbchain.org

# WalletConnect Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_from_walletconnect_cloud

# ============================================================================
# IPFS CONFIGURATION
# ============================================================================

# Custom IPFS Node (SkySwap) - Already configured!
VITE_IPFS_API_URL=https://5001.skyswap.online
VITE_IPFS_GATEWAY_URL=https://8080.skyswap.online/ipfs/
```

### 2. Get Required API Keys

#### WalletConnect Project ID (Required for wallet connection)
1. Go to https://cloud.walletconnect.com/
2. Sign up for free account
3. Create new project
4. Copy Project ID
5. Add to `.env` as `VITE_WALLETCONNECT_PROJECT_ID`

#### Private Key (Required for contract deployment)
1. Open MetaMask
2. Click three dots → Account Details → Export Private Key
3. Enter password
4. Copy private key
5. Add to `.env` as `PRIVATE_KEY`
6. **⚠️ NEVER commit this to git!**

### 3. Get Testnet BNB

1. Visit [opBNB Testnet Faucet](https://www.bnbchain.org/en/testnet-faucet)
2. Connect your wallet
3. Request testnet BNB
4. Wait for confirmation

### 4. Deploy Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to opBNB testnet
npx hardhat run scripts/deploy.ts --network opbnbTestnet
```

Save the output addresses:
```
SWAVE Token deployed to: 0x...
SocialWave deployed to: 0x...
```

Update `.env` with these addresses:
```env
VITE_SWAVE_TOKEN_ADDRESS=0x...  # Use your token address
VITE_SOCIAL_WAVE_ADDRESS=0x...  # Use your dApp address
```

### 5. Start the Application

```bash
npm run dev
```

Application will run on http://localhost:5000

### 6. Test the Flow

1. **Connect Wallet**: Click connect button, approve MetaMask
2. **Registration Dialog**: Auto-opens for new users
3. **Fill Profile**: Enter username and bio
4. **Complete Registration**: Transaction confirms on-chain
5. **Create Post**: Earn 1,000 SWAVE tokens
6. **Share Referral Link**: Get from Referrals page

## IPFS Configuration

The application is configured to use your custom IPFS node at SkySwap:

- **API Endpoint**: `https://5001.skyswap.online`
- **Gateway**: `https://8080.skyswap.online/ipfs/`

When users create posts or update profiles:
1. Content uploaded to IPFS via API endpoint
2. Returns IPFS hash (CID)
3. Hash stored on blockchain
4. Content retrieved via gateway when displaying

### Testing IPFS Connection

```bash
# Test upload
curl -X POST -F file=@test.json https://5001.skyswap.online/api/v0/add

# Test retrieval (replace HASH with actual CID)
curl https://8080.skyswap.online/ipfs/HASH
```

## Troubleshooting

### Wallet Connection Issues
- Make sure WalletConnect Project ID is set
- Check network is opBNB Testnet (Chain ID 5611)
- Try different wallet (MetaMask recommended)

### Contract Deployment Fails
- Ensure you have testnet BNB
- Verify private key is correct (no 0x prefix)
- Check RPC URL is accessible

### IPFS Upload Fails
- Verify IPFS API URL is accessible
- Check network connectivity
- Try alternative IPFS provider if needed

### Registration Not Working
- Clear browser cache and reload
- Check MetaMask is unlocked
- Verify you have enough tBNB for gas

## Network Details

**opBNB Testnet**
- Chain ID: 5611 (0x15eb)
- Currency: tBNB
- RPC: https://opbnb-testnet-rpc.bnbchain.org
- Explorer: https://opbnb-testnet.bscscan.com
- Faucet: https://www.bnbchain.org/en/testnet-faucet

## Security Notes

✅ **Safe to commit:**
- RPC URLs
- Chain IDs
- IPFS gateway URLs
- Contract addresses (after deployment)

❌ **NEVER commit:**
- Private keys (PRIVATE_KEY)
- API secrets
- Production credentials

The `.env` file is already in `.gitignore` to protect your secrets!

## Next Steps

After setup:
1. Deploy contracts to testnet
2. Update contract addresses in `.env`
3. Test complete user flow
4. Share with testers using referral links
5. Monitor transactions on opBNB explorer

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) for gas optimization requirements.
