import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Gift } from 'lucide-react';
import { useSocialWave } from '@/hooks/web3/useSocialWave';
import { useUser } from '@/hooks/web3/useContractData';
import { useWeb3 } from '@/contexts/Web3Context';
import type { ProfileMetadata } from '@shared/schema';

export function RegistrationDialog() {
  const { address, isConnected } = useWeb3();
  const { data: user, isLoading: isLoadingUser, error: userError } = useUser(address);
  const { registerUser, isLoading: isRegistering } = useSocialWave();
  
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [referrerAddress, setReferrerAddress] = useState<string>('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  useEffect(() => {
    if (address) {
      const registeredKey = `swave_registered_${address.toLowerCase()}`;
      const isRegistered = localStorage.getItem(registeredKey) === 'true';
      setIsAlreadyRegistered(isRegistered);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && !isLoadingUser && address) {
      if (isAlreadyRegistered) {
        setOpen(false);
        return;
      }

      if (user && user.username) {
        const registeredKey = `swave_registered_${address.toLowerCase()}`;
        localStorage.setItem(registeredKey, 'true');
        setOpen(false);
      } else if (!user && !userError) {
        setOpen(true);
        
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get('ref');
        if (refParam && refParam !== address) {
          setReferrerAddress(refParam);
        }
      }
    }
  }, [isConnected, isLoadingUser, user, userError, address, isAlreadyRegistered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !address) return;

    try {
      const profileMetadata: ProfileMetadata = {
        username,
        bio: bio || undefined,
        avatarUrl: undefined,
        coverImageUrl: undefined,
        website: undefined,
        location: undefined,
      };

      await registerUser(username, profileMetadata, referrerAddress || undefined);
      
      const registeredKey = `swave_registered_${address.toLowerCase()}`;
      localStorage.setItem(registeredKey, 'true');
      setIsAlreadyRegistered(true);
      setOpen(false);
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      if (error?.reason?.includes('already registered') || error?.message?.includes('already registered')) {
        const registeredKey = `swave_registered_${address.toLowerCase()}`;
        localStorage.setItem(registeredKey, 'true');
        setIsAlreadyRegistered(true);
        setOpen(false);
      }
    }
  };

  if (!isConnected || isLoadingUser) return null;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (user?.username || isAlreadyRegistered) {
        setOpen(newOpen);
      }
    }}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-registration">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Welcome to SWAVE
          </DialogTitle>
          <DialogDescription>
            {userError 
              ? "Having trouble loading your profile. If you're already registered, try refreshing the page."
              : "Create your profile to start earning tokens and connecting with others"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={30}
              required
              data-testid="input-username"
            />
            <p className="text-xs text-muted-foreground">
              Choose a unique username for your profile
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={160}
              className="resize-none"
              data-testid="input-bio"
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/160 characters
            </p>
          </div>

          {referrerAddress && (
            <div className="rounded-lg bg-primary/10 p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Gift className="h-4 w-4 text-primary" />
                Referral Bonus
              </div>
              <p className="text-xs text-muted-foreground">
                You were referred by: <span className="font-mono">{referrerAddress.slice(0, 6)}...{referrerAddress.slice(-4)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Your referrer will earn bonus tokens when you register!
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {userError && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                data-testid="button-skip"
              >
                Skip for Now
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={isRegistering || !username.trim()}
              data-testid="button-register"
            >
              {isRegistering ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
