import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import type { WalletState } from '@/lib/web3/types';
import { CHAIN_CONFIG, CONTRACT_ADDRESSES } from '@/lib/web3/config';
import SWAVETokenABI from '@/contracts/SWAVEToken.json';
import { useToast } from '@/hooks/use-toast';

interface Web3ContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    provider: null,
    signer: null,
  });
  const [swaveBalance, setSwaveBalance] = useState('0');
  const { toast } = useToast();

  const refreshBalance = async () => {
    if (!state.address || !state.provider) return;

    try {
      if (!CONTRACT_ADDRESSES.swaveToken) {
        setSwaveBalance('0');
        return;
      }

      const tokenContract = new Contract(
        CONTRACT_ADDRESSES.swaveToken,
        SWAVETokenABI.abi,
        state.provider
      );

      const balance = await tokenContract.balanceOf(state.address);
      const decimals = await tokenContract.decimals();
      setSwaveBalance(formatUnits(balance, decimals));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setSwaveBalance('0');
    }
  };

  const connect = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: 'Wallet not found',
          description: 'Please install MetaMask or another Web3 wallet',
          variant: 'destructive',
        });
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const signer = await provider.getSigner();

      setState({
        address: accounts[0],
        chainId: Number(network.chainId),
        isConnected: true,
        provider,
        signer,
      });

      if (Number(network.chainId) !== CHAIN_CONFIG.chainId) {
        toast({
          title: 'Wrong Network',
          description: `Please switch to ${CHAIN_CONFIG.name}`,
          variant: 'destructive',
        });
      }

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const disconnect = () => {
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      provider: null,
      signer: null,
    });
    setSwaveBalance('0');
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  const switchNetwork = async () => {
    try {
      if (!window.ethereum) return;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_CONFIG.chainIdHex }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum?.request({
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

  useEffect(() => {
    if (state.isConnected) {
      refreshBalance();
    }
  }, [state.isConnected, state.address]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== state.address) {
        setState(prev => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.address]);

  return (
    <Web3Context.Provider value={{ ...state, connect, disconnect, switchNetwork, refreshBalance, swaveBalance }}>
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
