import { useState, useRef } from 'react';
import { ImagePlus, Coins, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TOKEN_REWARDS, IPFS_CONFIG } from '@/lib/web3/config';
import { uploadImage } from '@/lib/ipfs/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePostProps {
  onSubmit: (content: string, images: string[], mediaTypes: string[], isAd: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreatePost({ onSubmit, isSubmitting }: CreatePostProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isAd, setIsAd] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const file = files[0];
      
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image or video file',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 50MB',
          variant: 'destructive',
        });
        return;
      }

      const cid = await uploadImage(file);
      setSelectedImages([...selectedImages, cid]);
      setMediaTypes([...mediaTypes, file.type]);
      
      toast({
        title: 'Upload successful',
        description: 'Your media has been uploaded to IPFS',
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload media to IPFS. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setMediaTypes(mediaTypes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await onSubmit(content, selectedImages, mediaTypes, isAd);
      setContent('');
      setSelectedImages([]);
      setMediaTypes([]);
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

          {selectedImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Uploaded Media</Label>
              <div className="flex flex-wrap gap-2">
                {selectedImages.map((cid, index) => {
                  const gatewayUrl = IPFS_CONFIG.gatewayUrl.endsWith('/') 
                    ? IPFS_CONFIG.gatewayUrl 
                    : `${IPFS_CONFIG.gatewayUrl}/`;
                  const mediaUrl = `${gatewayUrl}${cid}`;
                  const isVideo = mediaTypes[index]?.startsWith('video/');
                  
                  return (
                    <div key={index} className="relative group">
                      {isVideo ? (
                        <video
                          src={mediaUrl}
                          className="h-20 w-20 object-cover rounded border"
                          muted
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Upload preview"
                          className="h-20 w-20 object-cover rounded border"
                        />
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        data-testid={`button-remove-image-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleImageUpload}
                className="hidden"
                data-testid="input-file-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingImage || selectedImages.length >= 4}
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-add-image"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Add Media
                  </>
                )}
              </Button>
            </div>

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
