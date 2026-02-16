/**
 * useZappers Hook
 * 
 * Fetches detailed zapper information for a post:
 * - WHO zapped (sender pubkey + profile)
 * - HOW MUCH they zapped (sats)
 * - WHEN they zapped (timestamp)
 * 
 * Inspired by Primal's zap receipt display.
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { nip57 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { LAB_RELAY_URL, PUBLIC_RELAYS } from '@/lib/relays';

/** A single zapper with their amount */
export interface Zapper {
  /** Sender's pubkey (from zap request) */
  pubkey: string;
  /** Amount in sats */
  sats: number;
  /** Comment from zap request */
  comment?: string;
  /** Timestamp of the zap */
  timestamp: number;
  /** The zap receipt event */
  receipt: NostrEvent;
}

/** Zappers data for a post */
export interface ZappersData {
  /** All zappers sorted by amount (highest first) */
  zappers: Zapper[];
  /** Top 3 zappers for avatar stack display */
  topZappers: Zapper[];
  /** Total sats zapped */
  totalSats: number;
  /** Total zap count */
  zapCount: number;
}

/**
 * Fetch detailed zapper information for a post
 * Queries both public relays and the LaB relay to ensure we get all zaps
 * for both public posts and private Tribe posts.
 */
export function useZappers(eventId: string | undefined, enabled: boolean = true) {
  const { nostr } = useNostr();

  return useQuery<ZappersData>({
    queryKey: ['zappers', eventId],
    queryFn: async (c): Promise<ZappersData> => {
      if (!eventId) {
        return { zappers: [], topZappers: [], totalSats: 0, zapCount: 0 };
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);

      // Query zap receipts from both public relays AND LaB relay
      // This ensures we get zaps for both public posts and private Tribe posts
      const allRelays = [...PUBLIC_RELAYS.slice(0, 2), LAB_RELAY_URL];
      const relayGroup = nostr.group(allRelays);
      
      const zapReceipts = await relayGroup.query([
        { kinds: [9735], '#e': [eventId], limit: 100 },
      ], { signal });
      
      // Deduplicate by event ID
      const seenIds = new Set<string>();
      const uniqueReceipts = zapReceipts.filter(r => {
        if (seenIds.has(r.id)) return false;
        seenIds.add(r.id);
        return true;
      });

      const zappers: Zapper[] = [];

      for (const receipt of uniqueReceipts) {
        // Extract sender pubkey and amount from the zap request in description tag
        const descriptionTag = receipt.tags.find(([name]) => name === 'description')?.[1];
        if (!descriptionTag) continue;

        try {
          const zapRequest = JSON.parse(descriptionTag);
          const senderPubkey = zapRequest.pubkey;
          if (!senderPubkey) continue;

          // Extract amount
          let sats = 0;
          
          // Method 1: From zap request amount tag (millisats)
          const amountTag = zapRequest.tags?.find(([name]: string[]) => name === 'amount')?.[1];
          if (amountTag) {
            sats = Math.floor(parseInt(amountTag) / 1000);
          }
          
          // Method 2: From bolt11 invoice
          if (sats === 0) {
            const bolt11Tag = receipt.tags.find(([name]) => name === 'bolt11')?.[1];
            if (bolt11Tag) {
              try {
                sats = nip57.getSatoshisAmountFromBolt11(bolt11Tag);
              } catch {
                // Ignore parse errors
              }
            }
          }

          // Extract comment
          const comment = zapRequest.content || undefined;

          zappers.push({
            pubkey: senderPubkey,
            sats,
            comment,
            timestamp: receipt.created_at,
            receipt,
          });
        } catch {
          // Ignore invalid zap requests
          continue;
        }
      }

      // Sort by amount (highest first)
      zappers.sort((a, b) => b.sats - a.sats);

      // Calculate totals
      const totalSats = zappers.reduce((sum, z) => sum + z.sats, 0);

      // Get unique top 3 zappers by pubkey (highest amount per person)
      const seenPubkeys = new Set<string>();
      const topZappers: Zapper[] = [];
      for (const zapper of zappers) {
        if (!seenPubkeys.has(zapper.pubkey)) {
          seenPubkeys.add(zapper.pubkey);
          topZappers.push(zapper);
          if (topZappers.length >= 3) break;
        }
      }

      return {
        zappers,
        topZappers,
        totalSats,
        zapCount: zappers.length,
      };
    },
    enabled: enabled && !!eventId,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // 2 minutes
  });
}
