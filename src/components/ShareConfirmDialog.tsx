/**
 * Share Confirmation Dialog
 * 
 * Shows a warning when users try to share private content publicly.
 * Tribe messages CANNOT be shared - this dialog won't even appear for them.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Globe, Lock, Share2 } from 'lucide-react';
import { canEverBeShared, requiresShareWarning } from '@/lib/relays';

interface ShareConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  contentType: 'big-dreams' | 'journal' | 'progress' | 'completion' | 'other';
  title?: string;
}

const contentTypeLabels: Record<string, { label: string; description: string }> = {
  'big-dreams': {
    label: 'Big Dream',
    description: 'Your goals and dreams are personal. Sharing publicly means anyone on Nostr can see them.',
  },
  'journal': {
    label: 'Journal Entry',
    description: 'Journal entries are private reflections. This will be visible to everyone on Nostr.',
  },
  'progress': {
    label: 'Progress Update',
    description: 'Your progress data is normally private. Sharing will make it visible on public Nostr.',
  },
  'completion': {
    label: 'Completion',
    description: 'Share your achievement with the Nostr community! This is a great way to inspire others.',
  },
  'other': {
    label: 'Content',
    description: 'This content is normally private. Sharing will make it visible on public Nostr.',
  },
};

export function ShareConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  contentType,
  title,
}: ShareConfirmDialogProps) {
  const { label, description } = contentTypeLabels[contentType] || contentTypeLabels.other;
  const isCompletion = contentType === 'completion';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isCompletion ? (
              <div className="p-2 bg-green-100 rounded-full">
                <Share2 className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            )}
            <AlertDialogTitle>
              {isCompletion ? 'Share Your Achievement?' : 'Share Publicly?'}
            </AlertDialogTitle>
          </div>
          
          <AlertDialogDescription className="space-y-3">
            <p>{description}</p>
            
            {title && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  {label}: "{title}"
                </p>
              </div>
            )}
            
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm">
              <Globe className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">What this means:</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>• Visible on Nostr clients (Primal, Snort, etc.)</li>
                  <li>• Cannot be deleted once shared</li>
                  <li>• Others can react, reply, and zap</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Keep Private
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={isCompletion 
              ? 'bg-green-600 hover:bg-green-700 flex items-center gap-2' 
              : 'bg-amber-600 hover:bg-amber-700 flex items-center gap-2'
            }
          >
            <Globe className="h-4 w-4" />
            Yes, Share Publicly
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook to determine if share warning is needed
 */
export function useShareWarning(kind: number, tags: string[][]) {
  const canShare = canEverBeShared(kind, tags);
  const needsWarning = requiresShareWarning(kind, tags);
  
  return {
    /** Whether this content can ever be shared (false for Tribe messages) */
    canShare,
    /** Whether a warning dialog should be shown before sharing */
    needsWarning,
    /** Reason why sharing is blocked (if canShare is false) */
    blockReason: !canShare ? 'Tribe messages cannot be shared publicly for privacy.' : undefined,
  };
}
