import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Web3Provider } from "@/contexts/Web3Context";
import { BootstrapProvider } from "@/contexts/BootstrapContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RegistrationDialog } from "@/components/web3/RegistrationDialog";
import { BootstrapLoader } from "@/components/BootstrapLoader";
import { useCacheRefresh } from "@/hooks/useCacheRefresh";
import { useWeb3 } from "@/contexts/Web3Context";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Referrals from "@/pages/referrals";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/feed" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:address" component={Profile} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isLandingPage = location === '/';
  const { isConnected } = useWeb3();

  useCacheRefresh(isConnected);

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  if (isLandingPage) {
    return (
      <>
        <Router />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto">
              <Router />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <BootstrapLoader />
      <RegistrationDialog />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <Web3Provider>
          <BootstrapProvider>
            <TooltipProvider>
              <AppContent />
            </TooltipProvider>
          </BootstrapProvider>
        </Web3Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
