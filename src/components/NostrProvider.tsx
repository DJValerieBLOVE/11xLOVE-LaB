import React, { useEffect, useRef } from 'react';
import { NostrEvent, NostrFilter, NPool, NRelay1, NMessage } from '@nostrify/nostrify';
import { NostrContext } from '@nostrify/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '@/hooks/useAppContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface NostrProviderProps {
  children: React.ReactNode;
}

// Custom relay class that handles NIP-42 AUTH challenges
class AuthenticatedRelay extends NRelay1 {
  private user: any = null;

  setUser(user: any) {
    this.user = user;
  }

  protected async handleMessage(message: NMessage): Promise<void> {
    // Handle AUTH challenge (NIP-42)
    if (message[0] === 'AUTH') {
      const challenge = message[1] as string;
      await this.sendAuthResponse(challenge);
      return;
    }

    // Handle other messages normally
    await super.handleMessage(message);
  }

  private async sendAuthResponse(challenge: string): Promise<void> {
    if (!this.user?.signer) {
      console.warn('Received AUTH challenge but no user signer available');
      return;
    }

    try {
      // Create AUTH event (kind 22242)
      const authEvent = await this.user.signer.signEvent({
        kind: 22242,
        content: '',
        tags: [
          ['relay', this.url],
          ['challenge', challenge]
        ],
        created_at: Math.floor(Date.now() / 1000)
      });

      // Send AUTH response
      await this.send(['AUTH', authEvent]);
      console.log('Sent AUTH response to relay:', this.url);
    } catch (error) {
      console.error('Failed to send AUTH response:', error);
    }
  }
}

const NostrProvider: React.FC<NostrProviderProps> = (props) => {
  const { children } = props;
  const { config } = useAppContext();
  const { user } = useCurrentUser();

  const queryClient = useQueryClient();

  // Create NPool instance only once
  const pool = useRef<NPool | undefined>(undefined);

  // Use refs so the pool always has the latest data
  const relayMetadata = useRef(config.relayMetadata);

  // Invalidate Nostr queries when relay metadata changes
  useEffect(() => {
    relayMetadata.current = config.relayMetadata;
    queryClient.invalidateQueries({ queryKey: ['nostr'] });
  }, [config.relayMetadata, queryClient]);

  // Update user in all relay instances when user changes
  useEffect(() => {
    if (pool.current) {
      // Update user in existing relays
      pool.current.relays.forEach(relay => {
        if (relay instanceof AuthenticatedRelay) {
          relay.setUser(user);
        }
      });
    }
  }, [user]);

  // Initialize NPool only once
  if (!pool.current) {
    pool.current = new NPool({
      open(url: string) {
        const relay = new AuthenticatedRelay(url);
        relay.setUser(user);
        return relay;
      },
      reqRouter(filters: NostrFilter[]) {
        const routes = new Map<string, NostrFilter[]>();

        // Route to all read relays
        const readRelays = relayMetadata.current.relays
          .filter(r => r.read)
          .map(r => r.url);

        for (const url of readRelays) {
          routes.set(url, filters);
        }

        return routes;
      },
      eventRouter(_event: NostrEvent) {
        // Get write relays from metadata
        const writeRelays = relayMetadata.current.relays
          .filter(r => r.write)
          .map(r => r.url);

        const allRelays = new Set<string>(writeRelays);

        return [...allRelays];
      },
    });
  }

  return (
    <NostrContext.Provider value={{ nostr: pool.current }}>
      {children}
    </NostrContext.Provider>
  );
};

export default NostrProvider;