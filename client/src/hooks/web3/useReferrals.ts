// hooks/web3/useReferrals.ts
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useSocialWaveContract } from './useContract';

export interface Referral {
  newUser: string;
  level: number;
  reward: string;
  timestamp: number;
  transactionHash: string;
}

export function useReferrals(referrerAddress?: string) {
  const { provider } = useWeb3();
  const contract = useSocialWaveContract();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contract || !referrerAddress || !provider) {
      setReferrals([]);
      return;
    }

    const fetchReferrals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current block number to set a range
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 50000); // Adjust range as needed for testnet

        // Filter ReferralRewardPaid events where currentReferrer is the user
        const filter = contract.filters.ReferralRewardPaid(referrerAddress);
        const events = await contract.queryFilter(filter, fromBlock, currentBlock);

        const referralData: Referral[] = await Promise.all(
          events.map(async (event) => {
            if (!event.args) return null;
            
            const block = await provider.getBlock(event.blockNumber);
            return {
              newUser: event.args[1], // _newUser parameter
              level: event.args[2].toNumber(), // level parameter
              reward: event.args[3].toString(), // reward parameter
              timestamp: block.timestamp,
              transactionHash: event.transactionHash,
            };
          })
        );

        // Filter out null values and sort by timestamp (newest first)
        const validReferrals = referralData.filter(Boolean) as Referral[];
        validReferrals.sort((a, b) => b.timestamp - a.timestamp);
        
        setReferrals(validReferrals);
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError('Failed to load referral data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, [contract, referrerAddress, provider]);

  return { referrals, isLoading, error };
}