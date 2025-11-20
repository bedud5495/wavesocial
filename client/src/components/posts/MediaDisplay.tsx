import { useState, useEffect } from 'react';

interface MediaDisplayProps {
  src: string;
  mediaType?: string;
  className?: string;
  postId: bigint;
  index: number;
}

export function MediaDisplay({ src, mediaType, className, postId, index }: MediaDisplayProps) {
  const [detectedType, setDetectedType] = useState<string | null>(mediaType || null);
  const [isLoading, setIsLoading] = useState(!mediaType);

  useEffect(() => {
    if (mediaType) {
      setDetectedType(mediaType);
      setIsLoading(false);
      return;
    }

    const detectMediaType = async () => {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        if (contentType) {
          setDetectedType(contentType);
        } else {
          setDetectedType('image/jpeg');
        }
      } catch (error) {
        setDetectedType('image/jpeg');
      } finally {
        setIsLoading(false);
      }
    };

    detectMediaType();
  }, [src, mediaType]);

  if (isLoading) {
    return (
      <div className={className + ' bg-muted animate-pulse'} data-testid={`loading-media-${postId}-${index}`}>
        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  const isVideo = detectedType?.startsWith('video/');

  return isVideo ? (
    <video
      src={src}
      controls
      className={className}
      data-testid={`video-post-${postId}-${index}`}
    />
  ) : (
    <img
      src={src}
      alt=""
      className={className}
      data-testid={`img-post-${postId}-${index}`}
    />
  );
}
