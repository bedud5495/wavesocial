import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Check, Users, Coins } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useUser } from '@/hooks/web3/useContractData';
import { TOKEN_REWARDS } from '@/lib/web3/config';

export default function Referrals() {
  const { address, isConnected } = useWeb3();
  const { data: user, isLoading } = useUser(address);
  const [copied, setCopied] = useState(false);
  
  const isRegistered = user && user.username;
  const referralUrl = isRegistered ? `${window.location.origin}/?ref=${address}` : '';

  const copyToClipboard = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLevels = [
    { level: 1, reward: TOKEN_REWARDS.REFERRAL_LEVELS[0], count: 0 },
    { level: 2, reward: TOKEN_REWARDS.REFERRAL_LEVELS[1], count: 0 },
    { level: 3, reward: TOKEN_REWARDS.REFERRAL_LEVELS[2], count: 0 },
    { level: 4, reward: TOKEN_REWARDS.REFERRAL_LEVELS[3], count: 0 },
    { level: 5, reward: TOKEN_REWARDS.REFERRAL_LEVELS[4], count: 0 },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground mt-2">
          Earn SWAVE tokens by inviting friends to join the platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            {isRegistered 
              ? 'Share this link to earn rewards when people sign up'
              : 'Complete your registration to get your referral link'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">Connect your wallet to view your referral link</p>
            </div>
          ) : isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : !isRegistered ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-muted-foreground text-sm">
                You need to register first to get your referral link
              </p>
              <p className="text-xs text-muted-foreground">
                Connect your wallet and complete registration to start earning referral rewards
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={referralUrl}
                readOnly
                className="font-mono text-sm"
                data-testid="input-referral-url"
              />
              <Button
                variant="outline"
                onClick={copyToClipboard}
                data-testid="button-copy-referral"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}

          <div className="bg-muted p-4 rounded-md space-y-2">
            <h3 className="font-semibold text-sm">5-Level Referral System</h3>
            <div className="space-y-1 text-sm">
              {referralLevels.map((level) => (
                <div key={level.level} className="flex items-center justify-between">
                  <span className="text-muted-foreground">Level {level.level}</span>
                  <Badge variant="secondary" className="gap-1 font-mono">
                    <Coins className="h-3 w-3" />
                    {parseInt(level.reward).toLocaleString()} SWAVE
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground">Connect your wallet to view referrals</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="text-center py-8 space-y-2" data-testid="empty-referrals">
              <p className="text-muted-foreground">Share your link to start earning referral rewards</p>
              <p className="text-xs text-muted-foreground">
                Your referrer will earn tokens across 5 levels when your referrals join
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
