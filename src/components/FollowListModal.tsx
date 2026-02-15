import { useState } from 'react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

interface FollowListModalProps {
  pubkey: string;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'followers' | 'following';
}

export function FollowListModal({ pubkey, isOpen, onClose, defaultTab = 'following' }: FollowListModalProps) {
  const { nostr } = useNostr();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Fetch the user's contact list (following)
  const { data: contactListEvent, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ['contact-list', pubkey],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [3],
          authors: [pubkey],
          limit: 1,
        },
      ]);
      return events[0];
    },
    enabled: isOpen,
  });

  // Extract pubkeys from contact list
  const followingPubkeys = contactListEvent?.tags
    .filter((tag) => tag[0] === 'p')
    .map((tag) => tag[1]) || [];

  // For followers, we'd need to query all kind 3 events that include this pubkey
  // This is expensive, so we'll use the Primal API or show a placeholder
  // For now, we'll just show a "coming soon" message for followers

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
          <DialogDescription>
            View who you follow and who follows you
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'followers' | 'following')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="flex-1 overflow-y-auto mt-4 space-y-3">
            {isLoadingFollowing ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </>
            ) : followingPubkeys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Not following anyone yet</p>
              </div>
            ) : (
              followingPubkeys.map((followPubkey) => (
                <UserListItem key={followPubkey} pubkey={followPubkey} />
              ))
            )}
          </TabsContent>

          <TabsContent value="followers" className="flex-1 overflow-y-auto mt-4">
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <p>Follower list coming soon</p>
              <p className="text-sm">
                Querying followers requires scanning all contact lists,
                which can be resource intensive.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function UserListItem({ pubkey }: { pubkey: string }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const handle = metadata?.name;
  const picture = metadata?.picture;
  const npub = nip19.npubEncode(pubkey);

  const handleViewProfile = () => {
    window.open(`/${npub}`, '_blank');
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={picture} alt={displayName} />
        <AvatarFallback className="text-sm bg-gradient-to-br from-[#6600ff] to-[#9900ff] text-white">
          {displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{displayName}</p>
        {handle && (
          <p className="text-xs text-muted-foreground truncate">@{handle}</p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewProfile}
        className="shrink-0"
      >
        View
      </Button>
    </div>
  );
}
