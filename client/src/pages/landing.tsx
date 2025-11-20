import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useWeb3 } from '@/contexts/Web3Context';
import { Link } from 'wouter';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Coins, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Rocket,
  Heart,
  Share2,
  Image,
  Target,
  Gift,
  Lock,
  Database,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function Landing() {
  const { address, connect } = useWeb3();

  const smartContractFeatures = [
    {
      icon: Coins,
      title: 'Post Creation Rewards',
      detail: '1,000 SWAVE Tokens',
      description: 'Every post you create earns you 1,000 SWAVE tokens instantly. Your content has real monetary value from day one. The smart contract automatically transfers tokens to your wallet upon successful post creation.',
    },
    {
      icon: Heart,
      title: 'Like Milestone Rewards',
      detail: '1,000 SWAVE per 1,000 Likes',
      description: 'Quality content pays exponentially. When your post reaches every 1,000 likes milestone, the smart contract automatically rewards you with an additional 1,000 SWAVE tokens. Popular posts can earn unlimited rewards.',
    },
    {
      icon: Users,
      title: '5-Level Referral System',
      detail: 'Up to 111,110 SWAVE per Referral',
      description: 'Invite friends and earn from their network growth. Level 1: 100,000 SWAVE, Level 2: 10,000 SWAVE, Level 3: 1,000 SWAVE, Level 4: 100 SWAVE, Level 5: 10 SWAVE. Total potential: 111,110 SWAVE per successful referral chain.',
    },
    {
      icon: TrendingUp,
      title: 'Promoted Posts',
      detail: 'Cost: 1,000 SWAVE',
      description: 'Boost your content visibility by promoting posts. Pay 1,000 SWAVE tokens to feature your post prominently in feeds. Smart contract marks your post with a "Promoted" badge and prioritizes it in the timeline.',
    },
    {
      icon: Shield,
      title: 'Profile Verification',
      detail: 'Stake: 100,000 SWAVE',
      description: 'Stake 100,000 SWAVE tokens to get verified status. Your profile displays a verification badge, building trust and credibility. Tokens are locked in the smart contract and can be unstaked at any time.',
    },
    {
      icon: Database,
      title: 'IPFS Content Storage',
      detail: 'Decentralized & Permanent',
      description: 'All posts, images, and profile metadata are stored on IPFS (InterPlanetary File System). Content is censorship-resistant, permanent, and accessible from anywhere. Smart contract stores IPFS hashes on-chain.',
    },
    {
      icon: Lock,
      title: 'On-Chain Social Graph',
      detail: 'Immutable & Transparent',
      description: 'Follow relationships, post ownership, and like counts are stored directly on the blockchain. All social interactions are transparent, verifiable, and cannot be manipulated by any centralized authority.',
    },
    {
      icon: Gift,
      title: 'ERC-20 Token Standard',
      detail: 'SWAVE Token',
      description: 'SWAVE is a standard ERC-20 token on opBNB (BSC Layer 2). Fully compatible with all Web3 wallets, DEXs, and DeFi protocols. Trade, transfer, and use SWAVE anywhere in the crypto ecosystem.',
    },
  ];

  const faqs = [
    {
      question: 'What is SWAVE?',
      answer: 'SWAVE is a decentralized social media platform built on the opBNB testnet (Binance Smart Chain Layer 2) that rewards users with ERC-20 tokens for creating content and engaging with the community. Unlike traditional social media, you truly own your content and earn cryptocurrency for your contributions.',
    },
    {
      question: 'How do I get started?',
      answer: 'Connect your Web3 wallet (MetaMask recommended) to the opBNB testnet, register your profile, and start posting. You\'ll earn 1,000 SWAVE tokens for your first post. Make sure your wallet is on the opBNB testnet and has some tBNB for gas fees.',
    },
    {
      question: 'What is opBNB testnet?',
      answer: 'opBNB is a Layer 2 scaling solution for Binance Smart Chain, offering faster transactions and lower fees. The testnet is a testing environment where you can use test tokens (tBNB and SWAVE) to explore the platform without spending real money.',
    },
    {
      question: 'How do I earn SWAVE tokens?',
      answer: 'You earn tokens through multiple ways: 1) 1,000 SWAVE for each post you create, 2) 1,000 SWAVE for every 1,000 likes your posts receive, 3) Referral rewards when people you invite register and build their network (up to 111,110 SWAVE per referral chain).',
    },
    {
      question: 'What can I do with SWAVE tokens?',
      answer: 'SWAVE tokens can be used to: 1) Promote your posts for 1,000 SWAVE to increase visibility, 2) Stake 100,000 SWAVE to get verified status, 3) Trade or transfer to other wallets, 4) Use in future DeFi integrations and platform features.',
    },
    {
      question: 'Is my content stored on the blockchain?',
      answer: 'Your content is stored on IPFS (InterPlanetary File System), a decentralized storage network. The blockchain stores IPFS hashes (content addresses), ensuring your posts are permanent, censorship-resistant, and always accessible without relying on centralized servers.',
    },
    {
      question: 'How does the referral system work?',
      answer: 'Share your wallet address as a referral link. When someone registers using your address, you earn: Level 1 (direct): 100,000 SWAVE, Level 2: 10,000 SWAVE, Level 3: 1,000 SWAVE, Level 4: 100 SWAVE, Level 5: 10 SWAVE. You earn from 5 levels deep in your referral network.',
    },
    {
      question: 'Are there any fees?',
      answer: 'You only pay blockchain gas fees (in tBNB) for transactions like posting, liking, and following. These fees go to blockchain validators, not to SWAVE. Gas fees on opBNB are very low, typically less than $0.01 per transaction.',
    },
    {
      question: 'What happens if I unstake my verification tokens?',
      answer: 'You can unstake your 100,000 SWAVE at any time through your profile settings. The smart contract will return your tokens immediately, but your verification badge will be removed. You can re-stake anytime to regain verification status.',
    },
    {
      question: 'Is SWAVE secure?',
      answer: 'Yes. SWAVE uses audited OpenZeppelin smart contract libraries, runs on the secure opBNB blockchain, and stores content on decentralized IPFS. Your wallet keys are never shared with the platform. Always keep your private keys safe and never share them.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold">SWAVE</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {address ? (
              <Link href="/feed">
                <Button data-testid="button-nav-feed">
                  <Share2 className="h-4 w-4 mr-2" />
                  Go to Feed
                </Button>
              </Link>
            ) : (
              <Button onClick={connect} data-testid="button-nav-connect">
                <Zap className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          
          <div className="relative max-w-6xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mb-4">
              <Rocket className="h-3 w-3 mr-1" />
              Powered by opBNB Testnet (BSC Layer 2)
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Earn Crypto for Your
              <br />
              <span className="text-primary">Social Content</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              The first fully decentralized social platform where every post, like, and referral rewards you with SWAVE tokens
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {address ? (
                <Link href="/feed">
                  <Button size="lg" className="gap-2 text-lg px-8 py-6" data-testid="button-hero-feed">
                    <Share2 className="h-5 w-5" />
                    Go to Feed
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="lg" 
                  onClick={connect}
                  className="gap-2 text-lg px-8 py-6"
                  data-testid="button-hero-connect"
                >
                  <Zap className="h-5 w-5" />
                  Connect Wallet & Start Earning
                </Button>
              )}
              <a href="#features">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" data-testid="button-hero-learn">
                  Learn More
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Coins className="h-10 w-10 text-primary mx-auto mb-2" />
                  <div className="text-4xl font-bold text-primary">1,000</div>
                  <div className="text-sm text-muted-foreground mt-2">SWAVE per Post</div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Users className="h-10 w-10 text-primary mx-auto mb-2" />
                  <div className="text-4xl font-bold text-primary">111k+</div>
                  <div className="text-sm text-muted-foreground mt-2">Max Referral Rewards</div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Database className="h-10 w-10 text-primary mx-auto mb-2" />
                  <div className="text-4xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground mt-2">Decentralized Storage</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Smart Contract Features Section */}
        <section id="features" className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Smart Contract Features</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Built on Blockchain Technology
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every feature is powered by transparent, immutable smart contracts on opBNB
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {smartContractFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                          <Badge variant="secondary" className="mb-3">{feature.detail}</Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
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
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Getting Started</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Start earning SWAVE tokens in three simple steps
              </p>
            </div>

            <div className="space-y-8">
              <Card className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-3">Connect Your Wallet</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Connect MetaMask or any Web3 wallet to the opBNB testnet. Create your profile with username, bio, and avatar. Get some tBNB from the testnet faucet for gas fees. Registration is instant and completely free.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-3">Create & Share Content</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Post your thoughts, share images, and engage with the community. Each post earns you 1,000 SWAVE tokens automatically. Upload images to IPFS, like other posts, follow interesting users, and build your social presence.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-3">Earn & Grow</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Watch your SWAVE balance grow with every post, milestone reward, and referral. Use tokens to promote posts, get verified, or trade on DEXs. Invite friends and earn from their success through the 5-level referral system.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about SWAVE
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border rounded-lg px-6 bg-card"
                  data-testid={`accordion-faq-${index}`}
                >
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2">
              <CardContent className="p-12 text-center space-y-6">
                <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Start Earning?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of users earning cryptocurrency for their social content. Connect your wallet and receive 1,000 SWAVE tokens with your first post.
                </p>
                
                {address ? (
                  <Link href="/feed">
                    <Button size="lg" className="gap-2 text-lg px-8 py-6" data-testid="button-cta-feed">
                      <Share2 className="h-5 w-5" />
                      Go to Feed
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="lg" 
                    onClick={connect}
                    className="gap-2 text-lg px-8 py-6"
                    data-testid="button-cta-connect"
                  >
                    <Zap className="h-5 w-5" />
                    Connect Wallet & Start Earning
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">SWAVE</span>
                </div>
                <p className="text-muted-foreground">
                  Decentralized social platform built on opBNB testnet. Earn crypto for your content.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Smart Contracts</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-mono break-all">
                    <span className="font-semibold">SocialWave:</span><br />
                    {import.meta.env.VITE_SOCIAL_WAVE_ADDRESS || 'Not configured'}
                  </p>
                  <p className="font-mono break-all">
                    <span className="font-semibold">SWAVE Token:</span><br />
                    {import.meta.env.VITE_SWAVE_TOKEN_ADDRESS || 'Not configured'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Network</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-semibold">Chain:</span> opBNB Testnet</p>
                  <p><span className="font-semibold">Chain ID:</span> 5611</p>
                  <p><span className="font-semibold">Storage:</span> IPFS (Decentralized)</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t text-center text-sm text-muted-foreground">
              <p>© 2024 SWAVE. Built on blockchain technology. Your content, your tokens.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
