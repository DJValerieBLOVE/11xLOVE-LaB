/**
 * useBigDreams Hook
 * 
 * Manages Big Dreams for all 11 dimensions
 * - One kind 30078 event per dimension (d-tag = big-dream-${dimensionNumber})
 * - NIP-44 encrypted (PRIVATE BY DEFAULT)
 * - Stored on Railway relay only
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useEncryptedStorage } from '@/hooks/useEncryptedStorage';
import { LAB_RELAY_URL } from '@/lib/relays';
import type { Dimension } from '@/lib/dimensions';

export interface BigDream {
  dimensionId: number;
  content: string;
  updatedAt: number;
}

/**
 * Fetch all Big Dreams for the current user
 */
export function useBigDreams() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { decrypt, isAvailable } = useEncryptedStorage();

  return useQuery({
    queryKey: ['big-dreams', user?.pubkey],
    queryFn: async () => {
      if (!user || !isAvailable) return [];

      // Query all Big Dream events (one per dimension)
      const labRelay = nostr.relay(LAB_RELAY_URL);
      
      // Build filters for all 11 dimensions
      const dTags = Array.from({ length: 11 }, (_, i) => `big-dream-${i + 1}`);
      
      const events = await labRelay.query([
        {
          kinds: [30078],
          authors: [user.pubkey],
          '#d': dTags,
          limit: 11,
        },
      ]);

      // Decrypt and parse each event
      const bigDreams: BigDream[] = [];
      
      for (const event of events) {
        try {
          // Extract dimension ID from d-tag
          const dTag = event.tags.find(([name]) => name === 'd')?.[1];
          if (!dTag) continue;
          
          const dimensionId = parseInt(dTag.replace('big-dream-', ''));
          if (isNaN(dimensionId)) continue;

          // Decrypt the content
          const decrypted = await decrypt(event.content);
          const content = typeof decrypted === 'string' ? decrypted : JSON.stringify(decrypted);

          bigDreams.push({
            dimensionId,
            content,
            updatedAt: event.created_at,
          });
        } catch (error) {
          console.error(`Failed to decrypt Big Dream for dimension:`, error);
        }
      }

      return bigDreams;
    },
    enabled: !!user && isAvailable,
  });
}

/**
 * Get a specific Big Dream by dimension ID
 */
export function useBigDream(dimensionId: number) {
  const { data: bigDreams = [] } = useBigDreams();
  return bigDreams.find((bd) => bd.dimensionId === dimensionId);
}

/**
 * Save or update a Big Dream for a specific dimension
 */
export function useSaveBigDream() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { encrypt, isAvailable } = useEncryptedStorage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dimension,
      content,
    }: {
      dimension: Dimension;
      content: string;
    }) => {
      if (!user?.signer) {
        throw new Error('You must be logged in to save Big Dreams');
      }

      if (!isAvailable) {
        throw new Error('NIP-44 encryption not available. Please upgrade your signer.');
      }

      // Encrypt the content
      const encrypted = await encrypt(content);

      // Create event tags
      const tags = [
        ['d', `big-dream-${dimension.id}`],
        ['dimension', dimension.id.toString()],
        ['dimension-name', dimension.name],
        ['t', 'big-dreams'],
        ['t', `dimension-${dimension.id}`],
      ];

      // Add client tag if on HTTPS
      if (location.protocol === 'https:') {
        tags.push(['client', location.hostname]);
      }

      // Sign the event
      const event = await user.signer.signEvent({
        kind: 30078,
        content: encrypted,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });

      // Publish to Railway relay only
      const labRelay = nostr.relay(LAB_RELAY_URL);
      await labRelay.event(event, { signal: AbortSignal.timeout(5000) });

      console.log(`[Big Dreams] Saved for dimension ${dimension.id}: ${dimension.name}`);
      return event;
    },
    onSuccess: () => {
      // Invalidate Big Dreams query to refetch
      queryClient.invalidateQueries({
        queryKey: ['big-dreams', user?.pubkey],
      });
    },
    onError: (error) => {
      console.error('[Big Dreams] Failed to save:', error);
    },
  });
}

/**
 * Check if user has completed onboarding (has at least one Big Dream)
 */
export function useHasCompletedOnboarding() {
  const { data: bigDreams = [], isLoading } = useBigDreams();
  
  return {
    hasCompleted: bigDreams.length > 0,
    isLoading,
  };
}
