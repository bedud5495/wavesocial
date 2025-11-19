import { useMemo } from 'react';
import { Contract } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { CONTRACT_ADDRESSES } from '@/lib/web3/config';
import SWAVETokenABI from '@/contracts/SWAVEToken.json';
import SocialWaveABI from '@/contracts/SocialWave.json';

export function useTokenContract() {
  const { provider, signer } = useWeb3();

  return useMemo(() => {
    if (!CONTRACT_ADDRESSES.swaveToken || !provider) return null;

    return new Contract(
      CONTRACT_ADDRESSES.swaveToken,
      SWAVETokenABI.abi,
      signer || provider
    );
  }, [provider, signer]);
}

export function useSocialWaveContract() {
  const { provider, signer } = useWeb3();

  return useMemo(() => {
    if (!CONTRACT_ADDRESSES.socialWave || !provider) return null;

    return new Contract(
      CONTRACT_ADDRESSES.socialWave,
      SocialWaveABI.abi,
      signer || provider
    );
  }, [provider, signer]);
}
