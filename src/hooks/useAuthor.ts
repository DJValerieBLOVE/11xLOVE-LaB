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

      // Try querying ALL relays, not just a group
      // This is more reliable than nostr.group()
      console.log('[useAuthor] Starting query for kind 0 event...');
      
      const events = await nostr.query(
        [{ kinds: [0], authors: [pubkey!], limit: 1 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) },
      );

      console.log('[useAuthor] Query complete. Events returned:', events);
      console.log('[useAuthor] Number of events:', events.length);

      const event = events[0];

      if (!event) {
        console.error('[useAuthor] No kind 0 event found for pubkey:', pubkey);
        console.error('[useAuthor] Relays in config:', config.relayMetadata.relays);
        console.error('[useAuthor] This should not happen - your profile exists on Nostr!');
        console.error('[useAuthor] Trying individual relay connections...');
        
        // Try each relay individually to debug
        for (const relayUrl of relaysToUse) {
          try {
            console.log(`[useAuthor] Trying ${relayUrl}...`);
            const relay = nostr.relay(relayUrl);
            const relayEvents = await relay.query(
              [{ kinds: [0], authors: [pubkey!], limit: 1 }],
              { signal: AbortSignal.timeout(3000) }
            );
            console.log(`[useAuthor] ${relayUrl} returned:`, relayEvents);
            if (relayEvents.length > 0) {
              console.log(`[useAuthor] SUCCESS! Found profile on ${relayUrl}`);
              const foundEvent = relayEvents[0];
              try {
                const metadata = n.json().pipe(n.metadata()).parse(foundEvent.content);
                console.log('[useAuthor] Profile metadata:', metadata);
                return { metadata, event: foundEvent };
              } catch (parseError) {
                console.error('[useAuthor] Failed to parse metadata:', parseError);
                return { event: foundEvent };
              }
            }
          } catch (err) {
            console.error(`[useAuthor] ${relayUrl} failed:`, err);
          }
        }
        
        throw new Error('No event found on any relay');
      }
      
      console.log('[useAuthor] Found profile event:', event);

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
