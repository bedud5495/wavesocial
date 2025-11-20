import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWeb3 } from '@/contexts/Web3Context';
import { Link } from 'wouter';
import { 
  Coins, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Rocket,
  Heart,
  Share2
} from 'lucide-react';

export default function Landing() {
  const { address, connect } = useWeb3();

  const features = [
    {
      icon: Coins,
      title: 'Earn Tokens for Posts',
      description: 'Get 1,000 SWAVE tokens for every post you create. Your content has real value.',
    },
    {
      icon: Heart,
      title: 'Milestone Rewards',
      description: 'Earn bonus tokens when your posts reach like milestones. Quality content pays off.',
    },
    {
      icon: Users,
      title: '5-Level Referral System',
      description: 'Earn up to 111,110 SWAVE tokens per referral through our multi-level reward structure.',
    },
    {
      icon: TrendingUp,
      title: 'Promoted Posts',
      description: 'Boost your content visibility for 1,000 SWAVE. Reach more users and grow your influence.',
    },
    {
      icon: Shield,
      title: 'Profile Verification',
      description: 'Stake 100k SWAVE to get verified badge. Build trust and credibility.',
    },
    {
      icon: Zap,
      title: 'IPFS Storage',
      description: 'Your content is stored on IPFS - decentralized, permanent, and censorship-resistant.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="mb-4">
            <Rocket className="h-3 w-3 mr-1" />
            Powered by opBNB Testnet
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Welcome to <span className="text-primary">SWAVE</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            The decentralized social platform where your content earns you real crypto rewards
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {address ? (
              <Link href="/feed">
                <Button size="lg" className="gap-2" data-testid="button-goto-feed">
                  <Share2 className="h-5 w-5" />
                  Go to Feed
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                onClick={connect}
                className="gap-2"
                data-testid="button-connect-wallet"
              >
                <Zap className="h-5 w-5" />
                Connect Wallet & Get Started
              </Button>
            )}
            <a href="#features">
              <Button variant="outline" size="lg" data-testid="button-learn-more">
                Learn More
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">1,000</div>
                <div className="text-sm text-muted-foreground mt-1">SWAVE per Post</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">111k+</div>
                <div className="text-sm text-muted-foreground mt-1">Referral Rewards</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground mt-1">Decentralized</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose SWAVE?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A social platform built on blockchain technology with real economic incentives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Start earning SWAVE tokens in three simple steps
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your MetaMask or any Web3 wallet to the opBNB testnet and register your profile.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create & Share Content</h3>
                <p className="text-muted-foreground">
                  Post your thoughts, share images, and engage with the community. Every post earns you 1,000 SWAVE tokens.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Earn & Grow</h3>
                <p className="text-muted-foreground">
                  Get rewarded for engagement, refer friends, and watch your token balance grow as you build your presence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Start Earning?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join the decentralized social revolution and get rewarded for your content
          </p>
          
          {address ? (
            <Link href="/feed">
              <Button size="lg" className="gap-2" data-testid="button-cta-feed">
                <Share2 className="h-5 w-5" />
                Go to Feed
              </Button>
            </Link>
          ) : (
            <Button 
              size="lg" 
              onClick={connect}
              className="gap-2"
              data-testid="button-cta-connect"
            >
              <Zap className="h-5 w-5" />
              Connect Wallet Now
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
