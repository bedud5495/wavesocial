import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CHAIN_CONFIG } from '@/lib/web3/config';
import { formatUnits } from 'ethers';

export function WalletConnection() {
  const { address, chainId, isConnected, connect, disconnect, switchNetwork, swaveBalance } = useWeb3();

  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        className="w-full"
        data-testid="button-connect-wallet"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  const isCorrectNetwork = chainId === CHAIN_CONFIG.chainId;

  return (
    <Card data-testid="card-wallet-connected">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Wallet</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnect}
            data-testid="button-disconnect-wallet"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Address</span>
            <code className="text-xs font-mono" data-testid="text-wallet-address">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </code>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Network</span>
            {isCorrectNetwork ? (
              <Badge variant="secondary" className="text-xs" data-testid="badge-network">
                {CHAIN_CONFIG.name}
              </Badge>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={switchNetwork}
                data-testid="button-switch-network"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Switch Network
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">SWAVE Balance</span>
            <span className="text-sm font-mono font-semibold" data-testid="text-swave-balance">
              {parseFloat(swaveBalance).toLocaleString()} SWAVE
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
