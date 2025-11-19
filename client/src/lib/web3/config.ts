export const CHAIN_CONFIG = {
  chainId: 5611,
  chainIdHex: '0x15eb',
  name: 'opBNB Testnet',
  currency: 'tBNB',
  explorerUrl: 'https://opbnb-testnet.bscscan.com',
  rpcUrl: 'https://opbnb-testnet-rpc.bnbchain.org',
};

export const CONTRACT_ADDRESSES = {
  swaveToken: import.meta.env.VITE_SWAVE_TOKEN_ADDRESS || '',
  socialWave: import.meta.env.VITE_SOCIAL_WAVE_ADDRESS || '',
};

export const IPFS_CONFIG = {
  pinataJWT: import.meta.env.VITE_PINATA_JWT || '',
  pinataGateway: 'https://gateway.pinata.cloud/ipfs/',
  publicGateway: 'https://ipfs.io/ipfs/',
};

export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

export const TOKEN_REWARDS = {
  POST_CREATION: '1000',
  LIKE_MILESTONE: '1000',
  AD_COST: '1000',
  VERIFICATION_STAKE: '100000',
  REFERRAL_LEVELS: ['100000', '10000', '1000', '100', '10'],
};
