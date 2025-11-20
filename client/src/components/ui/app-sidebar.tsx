import { Home, User, Coins, Users, TrendingUp, Settings, Wallet } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { WalletConnection } from '@/components/web3/WalletConnection';
import { CreatePost } from '@/components/posts/CreatePost';
import { useWeb3 } from '@/contexts/Web3Context';

const menuItems = [
  { title: 'Home', icon: Home, url: '/' },
  { title: 'Profile', icon: User, url: '/profile' },
  { title: 'Referrals', icon: Users, url: '/referrals' },
  { title: 'Analytics', icon: TrendingUp, url: '/analytics' },
  { title: 'Settings', icon: Settings, url: '/settings' },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { address } = useWeb3();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate p-2 rounded-md">
            <Coins className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SWAVE</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.title === 'Profile' && address ? `/profile/${address}` : item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent className="px-4 space-y-3">
            <WalletConnection />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground px-4">
          <p className="font-semibold">Contract Address:</p>
          <p className="font-mono break-all">
            {import.meta.env.VITE_SOCIAL_WAVE_ADDRESS || 'Not configured'}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
