import { type NostrEvent, type NostrMetadata, NSchema as n } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from './useAppContext';

export function useAuthor(pubkey: string | undefined) {
  const { nostr } = useNostr();
  const { config } = useAppContext();

  return useQuery<{ event?: NostrEvent; metadata?: NostrMetadata }>({
    queryKey: ['author', pubkey ?? '', config.relayMetadata.updatedAt],
    queryFn: async ({ signal }) => {
      if (!pubkey) {
        return {};
      }

      // Get public relays from user's relay configuration
      // Filter out the Railway relay - only use public relays for profile data
      const publicRelayUrls = config.relayMetadata.relays
        .filter(r => r.read && !r.url.includes('railway.app'))
        .map(r => r.url);

      // If user has public relays configured, use those
      // Otherwise fall back to default public relays
      const relaysToUse = publicRelayUrls.length > 0 
        ? publicRelayUrls
        : [
            'wss://relay.primal.net',
            'wss://relay.damus.io',
            'wss://relay.ditto.pub',
          ];

      const publicRelays = nostr.group(relaysToUse);

      const [event] = await publicRelays.query(
        [{ kinds: [0], authors: [pubkey!], limit: 1 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]) },
      );

      if (!event) {
        throw new Error('No event found');
      }

      try {
        const metadata = n.json().pipe(n.metadata()).parse(event.content);
        return { metadata, event };
      } catch {
        return { event };
      }
    },
    staleTime: 5 * 60 * 1000, // Keep cached data fresh for 5 minutes
    retry: 3,
  });
}
