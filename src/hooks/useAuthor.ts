import { type NostrEvent, type NostrMetadata, NSchema as n } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from './useAppContext';

export function useAuthor(pubkey: string | undefined) {
  const { nostr } = useNostr();
  const { config } = useAppContext();

  return useQuery<{ event?: NostrEvent; metadata?: NostrMetadata }>({
    queryKey: ['author', pubkey ?? ''],
    enabled: !!pubkey, // Don't run query if no pubkey
    queryFn: async ({ signal }) => {
      if (!pubkey) {
        console.log('[useAuthor] No pubkey provided');
        return {};
      }

      console.log('[useAuthor] Fetching profile for pubkey:', pubkey);
      console.log('[useAuthor] Current relay config:', config.relayMetadata.relays);

      // Get public relays from user's relay configuration
      // Filter out the Railway relay - only use public relays for profile data
      const publicRelayUrls = config.relayMetadata.relays
        .filter(r => r.read && !r.url.includes('railway.app'))
        .map(r => r.url);

      console.log('[useAuthor] Public relays to query:', publicRelayUrls);

      // If user has public relays configured, use those
      // Otherwise fall back to default public relays
      const relaysToUse = publicRelayUrls.length > 0 
        ? publicRelayUrls
        : [
            'wss://relay.primal.net',
            'wss://relay.damus.io',
            'wss://relay.ditto.pub',
          ];

      console.log('[useAuthor] Querying relays:', relaysToUse);

      const publicRelays = nostr.group(relaysToUse);

      const [event] = await publicRelays.query(
        [{ kinds: [0], authors: [pubkey!], limit: 1 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]) },
      );

      console.log('[useAuthor] Query result:', event ? 'Found profile event' : 'No profile found');

      if (!event) {
        console.error('[useAuthor] No kind 0 event found for pubkey:', pubkey);
        throw new Error('No event found');
      }

      try {
        const metadata = n.json().pipe(n.metadata()).parse(event.content);
        console.log('[useAuthor] Profile metadata:', metadata);
        return { metadata, event };
      } catch (error) {
        console.error('[useAuthor] Failed to parse metadata:', error);
        return { event };
      }
    },
    staleTime: 5 * 60 * 1000, // Keep cached data fresh for 5 minutes
    retry: 3,
  });
}
