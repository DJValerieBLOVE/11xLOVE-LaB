import { useEffect, useRef } from 'react';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAppContext } from '@/hooks/useAppContext';

/**
 * NostrSync - Syncs user's NIP-65 relay list once on login
 */
export function NostrSync() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { config, updateConfig } = useAppContext();
  
  // Track if we've already synced for this user
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    // Only sync once per user session
    if (!user || syncedRef.current === user.pubkey) return;
    
    // Don't sync if we already have a recent config (less than 1 hour old)
    if (config.relayMetadata.updatedAt > Date.now() / 1000 - 3600) {
      syncedRef.current = user.pubkey;
      return;
    }

    const syncRelaysFromNostr = async () => {
      try {
        // Try to fetch user's NIP-65 relay list
        const publicRelays = nostr.group([
          'wss://relay.primal.net',
          'wss://relay.damus.io',
          'wss://nos.lol',
        ]);

        const events = await publicRelays.query(
          [{ kinds: [10002], authors: [user.pubkey], limit: 1 }],
          { signal: AbortSignal.timeout(5000) }
        );

        // Base relays we always include
        const baseRelays = [
          { url: 'wss://nostr-rs-relay-production-1569.up.railway.app', read: true, write: true },
          { url: 'wss://relay.primal.net', read: true, write: false },
          { url: 'wss://relay.damus.io', read: true, write: false },
          { url: 'wss://nos.lol', read: true, write: false },
        ];

        let finalRelays = [...baseRelays];

        if (events.length > 0) {
          // Add user's custom relays (read-only, skip Railway)
          const userRelays = events[0].tags
            .filter(([name]) => name === 'r')
            .map(([, url, marker]) => ({
              url,
              read: !marker || marker === 'read',
              write: false,
            }))
            .filter(r => !r.url.includes('railway.app'));

          // Merge, avoiding duplicates
          const urls = new Set(baseRelays.map(r => r.url));
          for (const relay of userRelays) {
            if (!urls.has(relay.url)) {
              finalRelays.push(relay);
              urls.add(relay.url);
            }
          }
        }

        updateConfig((current) => ({
          ...current,
          relayMetadata: {
            relays: finalRelays,
            updatedAt: Date.now() / 1000,
          },
        }));
        
        syncedRef.current = user.pubkey;
      } catch (error) {
        console.error('Failed to sync relays:', error);
        syncedRef.current = user.pubkey; // Mark as synced anyway to avoid retries
      }
    };

    syncRelaysFromNostr();
  }, [user, config.relayMetadata.updatedAt, nostr, updateConfig]);

  return null;
}
