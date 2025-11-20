import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useBootstrap } from '@/contexts/BootstrapContext';

export function BootstrapLoader() {
  const { isBootstrapping, phaseMessage, needsRegistration } = useBootstrap();

  if (needsRegistration || !isBootstrapping) return null;

  return (
    <Dialog open={isBootstrapping}>
      <DialogContent 
        className="sm:max-w-[400px]" 
        data-testid="dialog-loading"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading SWAVE
          </DialogTitle>
          <DialogDescription className="pt-4">
            {phaseMessage}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
