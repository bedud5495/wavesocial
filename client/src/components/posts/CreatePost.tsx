import { useState } from 'react';
import { ImagePlus, Coins, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TOKEN_REWARDS } from '@/lib/web3/config';

interface CreatePostProps {
  onSubmit: (content: string, images: string[], isAd: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreatePost({ onSubmit, isSubmitting }: CreatePostProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isAd, setIsAd] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await onSubmit(content, selectedImages, isAd);
      setContent('');
      setSelectedImages([]);
      setIsAd(false);
      setOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg" data-testid="button-create-post">
          <Coins className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-create-post">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={280}
            data-testid="input-post-content"
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span data-testid="text-char-count">{content.length}/280</span>
            <Badge variant="secondary" className="gap-1">
              <Coins className="h-3 w-3" />
              Earn {isAd ? '0' : TOKEN_REWARDS.POST_CREATION} SWAVE
            </Badge>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" size="sm" disabled data-testid="button-add-image">
              <ImagePlus className="h-4 w-4 mr-2" />
              Add Image (IPFS)
            </Button>

            <div className="flex items-center gap-2">
              <Switch
                id="ad-mode"
                checked={isAd}
                onCheckedChange={setIsAd}
                data-testid="switch-ad-mode"
              />
              <Label htmlFor="ad-mode" className="text-sm cursor-pointer">
                Promoted Post ({TOKEN_REWARDS.AD_COST} SWAVE)
              </Label>
            </div>
          </div>

          {isAd && (
            <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
              <p>Promoted posts are highlighted and reach more users. Costs {TOKEN_REWARDS.AD_COST} SWAVE tokens.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="w-full"
            data-testid="button-submit-post"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Publish Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
