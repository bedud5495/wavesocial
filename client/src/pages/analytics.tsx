import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, FileText, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSocialWaveContract, useTokenContract } from '@/hooks/web3/useContract';
import { formatUnits } from 'ethers';

export default function Analytics() {
  const contract = useSocialWaveContract();
  const tokenContract = useTokenContract();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      if (!contract || !tokenContract) {
        throw new Error('Contract not initialized');
      }
      
      const [totalUsers, nextPostId, contractBalance] = await Promise.all([
        contract.totalUsers(),
        contract.nextPostId(),
        contract.getContractBalance(),
      ]);
        
      return { 
        userCount: totalUsers, 
        postCount: nextPostId > BigInt(0) ? nextPostId - BigInt(1) : BigInt(0),
        contractBalance: formatUnits(contractBalance, 18),
      };
    },
    enabled: !!contract && !!tokenContract,
    staleTime: 60000,
    retry: 3,
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track token economics and user growth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-users">
                {stats?.userCount.toString() || '0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Registered on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-posts">
                {stats?.postCount.toString() || '0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Created on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Pool</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : isError ? (
              <div className="text-sm text-destructive">Error loading</div>
            ) : (
              <div className="text-2xl font-bold font-mono" data-testid="text-contract-balance">
                {stats?.contractBalance ? Math.floor(Number(stats.contractBalance)).toLocaleString() : '0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              SWAVE tokens available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : isError ? (
              <div className="text-sm text-destructive">Error</div>
            ) : (
              <div className="text-2xl font-bold" data-testid="text-activity-rate">
                {stats ? `${stats.userCount.toString()}/${stats.postCount.toString()}` : '0/0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Users / Posts
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Earners</CardTitle>
          <CardDescription>Users who have earned the most SWAVE tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8" data-testid="empty-earners">
            <p className="text-muted-foreground">No data available yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
