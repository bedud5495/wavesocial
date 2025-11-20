import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trash2, CheckCircle, AlertCircle, RefreshCw, Coins } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { CONTRACT_ADDRESSES } from '@/lib/web3/config';
import { useToast } from '@/hooks/use-toast';
import { useSocialWaveContract, useTokenContract } from '@/hooks/web3/useContract';
import { parseUnits } from 'ethers';
import { useState } from 'react';

export default function Settings() {
  const { address } = useWeb3();
  const { toast } = useToast();
  const contract = useSocialWaveContract();
  const tokenContract = useTokenContract();
  const [fundAmount, setFundAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);

  const handleClearRegistration = () => {
    if (!address) {
      toast({
        title: 'No wallet connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    const registeredKey = `swave_registered_${address.toLowerCase()}`;
    localStorage.removeItem(registeredKey);
    
    toast({
      title: 'Registration status cleared',
      description: 'The app will now check your registration status again. Refresh the page to see the registration dialog if you need to register.',
    });

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    
    toast({
      title: 'All local data cleared',
      description: 'Refreshing page...',
    });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleFundContract = async () => {
    if (!address || !contract || !tokenContract) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    setIsFunding(true);

    try {
      const amount = parseUnits(fundAmount, 18);
      
      toast({
        title: 'Step 1: Approving tokens',
        description: 'Please confirm the approval transaction...',
      });

      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.socialWave, amount);
      await approveTx.wait();

      toast({
        title: 'Step 2: Funding contract',
        description: 'Please confirm the funding transaction...',
      });

      const fundTx = await contract.fundContract(amount);
      await fundTx.wait();

      toast({
        title: 'Contract funded successfully!',
        description: `Added ${fundAmount} SWAVE tokens to the reward pool`,
      });

      setFundAmount('');
    } catch (error: any) {
      toast({
        title: 'Funding failed',
        description: error.message || 'Failed to fund contract',
        variant: 'destructive',
      });
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your SWAVE application settings and local data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Contract Information
          </CardTitle>
          <CardDescription>
            Current smart contract addresses being used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SocialWave Contract:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {CONTRACT_ADDRESSES.socialWave || 'Not configured'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SWAVE Token Contract:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {CONTRACT_ADDRESSES.swaveToken || 'Not configured'}
              </Badge>
            </div>
          </div>
          {!CONTRACT_ADDRESSES.socialWave && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Contract address not configured in environment variables</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Fund Contract
          </CardTitle>
          <CardDescription>
            Add SWAVE tokens to the contract reward pool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Add SWAVE tokens to the smart contract so it can distribute rewards to users for posts, likes, and referrals.
              You need to be the contract owner to perform this action.
            </p>
            {address && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium">Your wallet:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Badge>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="fundAmount" className="text-sm font-medium">
              Amount (SWAVE tokens)
            </label>
            <Input
              id="fundAmount"
              type="number"
              placeholder="10000"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              disabled={!address || isFunding}
              min="0"
              step="1000"
              data-testid="input-fund-amount"
            />
          </div>
          <Button
            onClick={handleFundContract}
            disabled={!address || isFunding || !fundAmount}
            data-testid="button-fund-contract"
          >
            {isFunding ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Funding Contract...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Fund Contract
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Registration Status
          </CardTitle>
          <CardDescription>
            Clear your local registration cache if you're having issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              If you're already registered but the app keeps asking you to create a profile, 
              this will clear the cached registration status and check again with the blockchain.
            </p>
            {address && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium">Your wallet:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Badge>
              </div>
            )}
          </div>
          <Button
            onClick={handleClearRegistration}
            variant="outline"
            disabled={!address}
            data-testid="button-clear-registration"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Registration Status
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Clear All Local Data
          </CardTitle>
          <CardDescription>
            Remove all cached data from your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will clear all local storage data including registration status, 
            preferences, and any cached information. This won't affect your on-chain data.
          </p>
          <Button
            onClick={handleClearAllData}
            variant="destructive"
            data-testid="button-clear-all"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
