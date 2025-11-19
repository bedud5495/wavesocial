import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, FileText, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSocialWaveContract } from '@/hooks/web3/useContract';

export default function Analytics() {
  const contract = useSocialWaveContract();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      if (!contract) return { userCount: 0n, postCount: 0n };
      
      try {
        const [userCount, postCount] = await Promise.all([
          contract.userCount(),
          contract.postCount(),
        ]);

        return { userCount, postCount };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return { userCount: 0n, postCount: 0n };
      }
    },
    enabled: !!contract,
    staleTime: 60000,
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
            <CardTitle className="text-sm font-medium">Tokens Distributed</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-total-tokens">0</div>
            <p className="text-xs text-muted-foreground">
              SWAVE tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-growth-rate">0%</div>
            <p className="text-xs text-muted-foreground">
              Week over week
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
