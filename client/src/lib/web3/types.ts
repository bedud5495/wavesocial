import type { BrowserProvider, Eip1193Provider } from 'ethers';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  provider: BrowserProvider | null;
  signer: any | null;
}

export interface ConnectWalletResult {
  address: string;
  chainId: number;
  provider: BrowserProvider;
}

export interface ContractError {
  code: string;
  message: string;
  data?: any;
}

export type TransactionState = 'idle' | 'pending' | 'success' | 'error';

export interface TransactionResult {
  hash: string;
  status: TransactionState;
  error?: string;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
