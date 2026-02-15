import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

interface ZapStats {
  zapsReceived: number; // Total sats received
  zapsReceivedCount: number; // Number of zaps received
  zapsSent: number; // Total sats sent
  zapsSentCount: number; // Number of zaps sent
  isLoading: boolean;
}

/**
 * Fetches zap statistics for a user from Nostr relays
 * Queries kind 9735 (zap receipts) to calculate totals
 */
export function useZapStats(pubkey: string | undefined): ZapStats {
  const { nostr } = useNostr();

  const { data, isLoading } = useQuery({
    queryKey: ['zap-stats', pubkey],
    enabled: !!pubkey,
    queryFn: async ({ signal }) => {
      if (!pubkey) {
        return { zapsReceived: 0, zapsReceivedCount: 0, zapsSent: 0, zapsSentCount: 0 };
      }

      // Try Primal API first for accurate cached stats
      try {
        const response = await fetch('https://primal.net/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(['user_profile', { pubkey }]),
          signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
        });

        if (response.ok) {
          const data = await response.json();
          for (const item of data) {
            if (item.kind === 10000105 && item.content) {
              try {
                const stats = JSON.parse(item.content);
                return {
                  zapsReceived: stats.total_zap_amount || 0,
                  zapsReceivedCount: stats.zaps_received || 0,
                  zapsSent: stats.total_satszapped || 0,
                  zapsSentCount: stats.zaps_sent || 0,
                };
              } catch {
                // Continue to fallback
              }
            }
          }
        }
      } catch {
        // Fallback to relay query
      }

      // Fallback: Query relays directly for zap receipts
      try {
        // Zaps received (where user is tagged with 'p')
        const receivedEvents = await nostr.query(
          [{ kinds: [9735], '#p': [pubkey], limit: 500 }],
          { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) }
        );

        let totalReceived = 0;
        for (const event of receivedEvents) {
          const amountTag = event.tags.find(([name]) => name === 'amount');
          if (amountTag?.[1]) {
            // Amount is in millisatoshis
            totalReceived += Math.floor(parseInt(amountTag[1]) / 1000);
          }
        }

        // Zaps sent (where user is the sender - tagged with 'P')
        const sentEvents = await nostr.query(
          [{ kinds: [9735], '#P': [pubkey], limit: 500 }],
          { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) }
        );

        let totalSent = 0;
        for (const event of sentEvents) {
          const amountTag = event.tags.find(([name]) => name === 'amount');
          if (amountTag?.[1]) {
            totalSent += Math.floor(parseInt(amountTag[1]) / 1000);
          }
        }

        return {
          zapsReceived: totalReceived,
          zapsReceivedCount: receivedEvents.length,
          zapsSent: totalSent,
          zapsSentCount: sentEvents.length,
        };
      } catch {
        return { zapsReceived: 0, zapsReceivedCount: 0, zapsSent: 0, zapsSentCount: 0 };
      }
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  return {
    zapsReceived: data?.zapsReceived || 0,
    zapsReceivedCount: data?.zapsReceivedCount || 0,
    zapsSent: data?.zapsSent || 0,
    zapsSentCount: data?.zapsSentCount || 0,
    isLoading,
  };
}
