import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useUser } from '@/hooks/web3/useContractData';

export type BootstrapPhase = 
  | 'disconnected'
  | 'connecting'
  | 'checking_registration'
  | 'awaiting_registration'
  | 'loading_data'
  | 'ready';

export function useAppBootstrap() {
  const { address, isConnected } = useWeb3();
  const { data: user, isLoading: isLoadingUser, error: userError } = useUser(address);
  const [phase, setPhase] = useState<BootstrapPhase>('disconnected');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setPhase('disconnected');
      setIsRegistered(false);
      return;
    }

    const registeredKey = `swave_registered_${address.toLowerCase()}`;
    const cachedRegistration = localStorage.getItem(registeredKey) === 'true';

    if (isLoadingUser) {
      setPhase('checking_registration');
      return;
    }

    if (userError && !cachedRegistration) {
      setPhase('awaiting_registration');
      setIsRegistered(false);
      return;
    }

    if (user && user.username) {
      localStorage.setItem(registeredKey, 'true');
      setIsRegistered(true);
      setPhase('ready');
      return;
    }

    if (cachedRegistration) {
      setIsRegistered(true);
      setPhase('ready');
      return;
    }

    if (!user && !userError) {
      setPhase('awaiting_registration');
      setIsRegistered(false);
    }
  }, [isConnected, address, isLoadingUser, user, userError]);

  const getPhaseMessage = () => {
    switch (phase) {
      case 'connecting':
        return 'Connecting wallet...';
      case 'checking_registration':
        return 'Checking your profile...';
      case 'loading_data':
        return 'Loading posts and data...';
      case 'awaiting_registration':
        return 'Please complete registration';
      default:
        return '';
    }
  };

  return {
    phase,
    isRegistered,
    isBootstrapping: phase !== 'disconnected' && phase !== 'ready',
    phaseMessage: getPhaseMessage(),
    needsRegistration: phase === 'awaiting_registration',
  };
}
