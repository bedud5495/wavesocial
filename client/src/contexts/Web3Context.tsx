import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, Contract, formatUnits, JsonRpcSigner } from 'ethers';
import { createWeb3Modal, defaultConfig, useWeb3Modal } from '@web3modal/ethers/react';
import { useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers/react';
import type { WalletState } from '@/lib/web3/types';
import { CHAIN_CONFIG, CONTRACT_ADDRESSES, WALLETCONNECT_PROJECT_ID } from '@/lib/web3/config';
import SWAVETokenABI from '@/contracts/SWAVEToken.json';
import { useToast } from '@/hooks/use-toast';

// WalletConnect project ID from config
const projectId = WALLETCONNECT_PROJECT_ID;

// Define opBNB Testnet chain metadata
const opBNBTestnet = {
  chainId: CHAIN_CONFIG.chainId,
  name: CHAIN_CONFIG.name,
  currency: CHAIN_CONFIG.currency,
  explorerUrl: CHAIN_CONFIG.explorerUrl,
  rpcUrl: CHAIN_CONFIG.rpcUrl,
};

// Web3Modal metadata
const metadata = {
  name: 'SWAVE',
  description: 'Decentralized Social Platform with Token Rewards',
  url: 'https://swave.app',
  icons: ['https://swave.app/icon.png'],
};

// Create Web3Modal with WalletConnect support
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: false,
  rpcUrl: CHAIN_CONFIG.rpcUrl,
  defaultChainId: CHAIN_CONFIG.chainId,
});

createWeb3Modal({
  ethersConfig,
  chains: [opBNBTestnet],
  projectId,
  enableAnalytics: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(262.1 83.3% 57.8%)',
  },
});

interface Web3ContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  swaveBalance: string;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect: web3ModalDisconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [swaveBalance, setSwaveBalance] = useState('0');
  const { toast } = useToast();

  // Update provider and signer when wallet connects
  useEffect(() => {
    const updateProviderAndSigner = async () => {
      if (walletProvider && isConnected) {
        try {
          const ethersProvider = new BrowserProvider(walletProvider);
          const ethersSigner = await ethersProvider.getSigner();
          setProvider(ethersProvider);
          setSigner(ethersSigner);
        } catch (error) {
          console.error('Error setting up provider:', error);
        }
      } else {
        setProvider(null);
        setSigner(null);
      }
    };

    updateProviderAndSigner();
  }, [walletProvider, isConnected]);

  const refreshBalance = async () => {
    if (!address || !provider) return;

    try {
      if (!CONTRACT_ADDRESSES.swaveToken) {
        setSwaveBalance('0');
        return;
      }

      const tokenContract = new Contract(
        CONTRACT_ADDRESSES.swaveToken,
        SWAVETokenABI.abi,
        provider
      );

      const balance = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();
      setSwaveBalance(formatUnits(balance, decimals));
    } catch (error) {
      // Silently handle RPC errors - balance will retry automatically
      setSwaveBalance('0');
    }
  };

  const connect = async () => {
    // Open Web3Modal for wallet selection
    // Supports both browser extensions and WalletConnect for mobile
    await open();
  };

  const disconnect = async () => {
    await web3ModalDisconnect();
    setSwaveBalance('0');
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  const switchNetwork = async () => {
    try {
      if (!walletProvider) return;

      await walletProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_CONFIG.chainIdHex }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await walletProvider?.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CHAIN_CONFIG.chainIdHex,
                chainName: CHAIN_CONFIG.name,
                nativeCurrency: {
                  name: CHAIN_CONFIG.currency,
                  symbol: CHAIN_CONFIG.currency,
                  decimals: 18,
                },
                rpcUrls: [CHAIN_CONFIG.rpcUrl],
                blockExplorerUrls: [CHAIN_CONFIG.explorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    }
  };

  // Refresh balance when connected
  useEffect(() => {
    if (isConnected && address && provider) {
      refreshBalance();
    }
  }, [isConnected, address, provider]);

  // Check network on connection
  useEffect(() => {
    if (isConnected && chainId !== CHAIN_CONFIG.chainId) {
      toast({
        title: 'Wrong Network',
        description: `Please switch to ${CHAIN_CONFIG.name}`,
        variant: 'destructive',
      });
    }
  }, [isConnected, chainId]);

  // Build the wallet state object
  const walletState: WalletState = {
    address: address || null,
    chainId: chainId || null,
    isConnected,
    provider,
    signer,
  };

  return (
    <Web3Context.Provider 
      value={{ 
        ...walletState, 
        connect, 
        disconnect, 
        switchNetwork, 
        refreshBalance, 
        swaveBalance 
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
}
