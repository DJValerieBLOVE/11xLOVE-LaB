import { useEffect } from 'react';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAppContext } from '@/hooks/useAppContext';

/**
 * NostrSync - Syncs user's Nostr data
 *
 * This component runs globally to sync various Nostr data when the user logs in.
 * Currently syncs:
 * - NIP-65 relay list (kind 10002)
 */
export function NostrSync() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { config, updateConfig } = useAppContext();

  useEffect(() => {
    if (!user) return;

    const syncRelaysFromNostr = async () => {
      try {
        // ALWAYS keep Railway relay as primary write relay
        const railwayRelay = {
          url: 'wss://nostr-rs-relay-production-1569.up.railway.app',
          read: true,
          write: true,
        };
        
        // Default popular public relays (always available)
        const defaultPublicRelays = [
          { url: 'wss://relay.ditto.pub', read: true, write: false },
          { url: 'wss://relay.primal.net', read: true, write: false },
          { url: 'wss://relay.damus.io', read: true, write: false },
          { url: 'wss://nos.lol', read: true, write: false },
        ];

        // Try to fetch user's NIP-65 relay list from public relays
        const publicRelays = nostr.group([
          'wss://relay.primal.net',
          'wss://relay.damus.io',
          'wss://relay.ditto.pub',
        ]);

        const events = await publicRelays.query(
          [{ kinds: [10002], authors: [user.pubkey], limit: 1 }],
          { signal: AbortSignal.timeout(5000) }
        );

        let userCustomRelays: { url: string; read: boolean; write: boolean }[] = [];

        if (events.length > 0) {
          const event = events[0];
          console.log('Found user NIP-65 relay list:', event);

          const fetchedRelays = event.tags
            .filter(([name]) => name === 'r')
            .map(([_, url, marker]) => ({
              url,
              read: !marker || marker === 'read',
              write: false, // All public relays are read-only in our app
            }));

          userCustomRelays = fetchedRelays.filter(r => !r.url.includes('railway.app'));
        } else {
          console.log('No NIP-65 relay list found - using defaults only');
        }

        // Merge: Railway first, then defaults, then user's custom relays
        // Remove duplicates by URL
        const allRelays = [railwayRelay, ...defaultPublicRelays, ...userCustomRelays];
        const uniqueRelays = Array.from(
          new Map(allRelays.map(r => [r.url, r])).values()
        );

        console.log('Final relay configuration:', uniqueRelays);

        updateConfig((current) => ({
          ...current,
          relayMetadata: {
            relays: uniqueRelays,
            updatedAt: Date.now() / 1000,
          },
        }));
      } catch (error) {
        console.error('Failed to sync relays from Nostr:', error);
        
        // On error, ensure defaults are set
        const railwayRelay = {
          url: 'wss://nostr-rs-relay-production-1569.up.railway.app',
          read: true,
          write: true,
        };
        
        const defaultPublicRelays = [
          { url: 'wss://relay.ditto.pub', read: true, write: false },
          { url: 'wss://relay.primal.net', read: true, write: false },
          { url: 'wss://relay.damus.io', read: true, write: false },
          { url: 'wss://nos.lol', read: true, write: false },
        ];
        
        updateConfig((current) => ({
          ...current,
          relayMetadata: {
            relays: [railwayRelay, ...defaultPublicRelays],
            updatedAt: Date.now() / 1000,
          },
        }));
      }
    };

    syncRelaysFromNostr();
  }, [user, config.relayMetadata.updatedAt, nostr, updateConfig]);

  return null;
}