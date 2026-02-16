/**
 * TopZappers Component
 * 
 * Displays an avatar stack of top zappers with amounts.
 * Inspired by Primal's zap display.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Zapper } from '@/hooks/useZappers';

interface TopZappersProps {
  zappers: Zapper[];
  totalSats: number;
  zapCount: number;
  className?: string;
  /** Maximum number of avatars to show */
  maxAvatars?: number;
}

/** Single zapper avatar with tooltip */
function ZapperAvatar({ zapper, index }: { zapper: Zapper; index: number }) {
  const author = useAuthor(zapper.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(zapper.pubkey);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar
            className={cn(
              'h-6 w-6 border-2 border-background cursor-pointer',
              'hover:ring-2 hover:ring-orange-400/50 transition-all',
              index > 0 && '-ml-2'
            )}
            style={{ zIndex: 10 - index }}
          >
            <AvatarImage src={metadata?.picture} />
            <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px]">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="top" className="flex items-center gap-1.5 text-xs">
          <Zap className="h-3 w-3 text-orange-500" />
          <span className="font-medium">{displayName}</span>
          <span className="text-orange-500 font-bold">{formatSats(zapper.sats)} sats</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Format sats with k/M suffix */
function formatSats(sats: number): string {
  if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M`;
  if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k`;
  return sats.toString();
}

export function TopZappers({
  zappers,
  totalSats,
  zapCount,
  className,
  maxAvatars = 3,
}: TopZappersProps) {
  if (zappers.length === 0) return null;

  const visibleZappers = zappers.slice(0, maxAvatars);
  const remainingCount = Math.max(0, zapCount - maxAvatars);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Avatar stack */}
      <div className="flex items-center">
        {visibleZappers.map((zapper, index) => (
          <ZapperAvatar key={zapper.receipt.id} zapper={zapper} index={index} />
        ))}
      </div>

      {/* Total amount and count */}
      <div className="flex items-center gap-1 text-xs text-orange-500">
        <Zap className="h-3 w-3 fill-current" />
        <span className="font-semibold">{formatSats(totalSats)}</span>
        {remainingCount > 0 && (
          <span className="text-muted-foreground">+{remainingCount} more</span>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function TopZappersCompact({
  zappers,
  totalSats,
  className,
  maxAvatars = 3,
}: Omit<TopZappersProps, 'zapCount'>) {
  if (zappers.length === 0) return null;

  const visibleZappers = zappers.slice(0, maxAvatars);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1 cursor-pointer', className)}>
            {/* Tiny avatar stack */}
            <div className="flex items-center">
              {visibleZappers.map((zapper, index) => (
                <MiniAvatar key={zapper.receipt.id} zapper={zapper} index={index} />
              ))}
            </div>
            <span className="text-xs text-orange-500 font-medium">
              {formatSats(totalSats)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            {visibleZappers.map((zapper) => (
              <ZapperLine key={zapper.receipt.id} zapper={zapper} />
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Mini avatar for compact display */
function MiniAvatar({ zapper, index }: { zapper: Zapper; index: number }) {
  const author = useAuthor(zapper.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(zapper.pubkey);

  return (
    <Avatar
      className={cn(
        'h-4 w-4 border border-background',
        index > 0 && '-ml-1'
      )}
      style={{ zIndex: 10 - index }}
    >
      <AvatarImage src={metadata?.picture} />
      <AvatarFallback className="bg-orange-100 text-orange-600 text-[8px]">
        {displayName.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

/** Single line in tooltip showing zapper name and amount */
function ZapperLine({ zapper }: { zapper: Zapper }) {
  const author = useAuthor(zapper.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(zapper.pubkey);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-medium">{displayName}</span>
      <span className="text-orange-500">{formatSats(zapper.sats)} sats</span>
    </div>
  );
}
