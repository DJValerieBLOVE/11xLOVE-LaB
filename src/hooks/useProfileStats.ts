import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

interface ProfileStats {
  followers: number;
  following: number;
  isLoading: boolean;
}

/**
 * Fetches real follower/following counts from Nostr relays
 * - Followers: Count of kind 3 events that have the user's pubkey in a 'p' tag
 * - Following: Count of 'p' tags in the user's own kind 3 event
 */
export function useProfileStats(pubkey: string | undefined): ProfileStats {
  const { nostr } = useNostr();

  // Query for the user's own contact list (kind 3) to get following count
  const { data: followingCount = 0, isLoading: followingLoading } = useQuery({
    queryKey: ['profile-following', pubkey],
    enabled: !!pubkey,
    queryFn: async ({ signal }) => {
      if (!pubkey) return 0;

      const events = await nostr.query(
        [{ kinds: [3], authors: [pubkey], limit: 1 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) }
      );

      if (events.length === 0) return 0;

      // Count 'p' tags in the contact list
      const pTags = events[0].tags.filter(([name]) => name === 'p');
      return pTags.length;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Query for followers - this is expensive as we need to count kind 3 events
  // that reference this pubkey. We use a relay that supports COUNT or estimate.
  const { data: followersCount = 0, isLoading: followersLoading } = useQuery({
    queryKey: ['profile-followers', pubkey],
    enabled: !!pubkey,
    queryFn: async ({ signal }) => {
      if (!pubkey) return 0;

      // Try to get follower count from Primal's cache API for accurate counts
      // Primal indexes this data and provides accurate follower counts
      try {
        const response = await fetch('https://primal.net/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(['user_profile', { pubkey }]),
          signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
        });

        if (response.ok) {
          const data = await response.json();
          // Primal returns an array of events, look for the stats event
          for (const item of data) {
            if (item.kind === 10000105 && item.content) {
              try {
                const stats = JSON.parse(item.content);
                if (stats.followers_count !== undefined) {
                  return stats.followers_count;
                }
              } catch {
                // Continue to fallback
              }
            }
          }
        }
      } catch {
        // Fallback to relay query if Primal API fails
      }

      // Fallback: Query relays directly (may not be complete count)
      // This queries kind 3 events with #p tag containing user's pubkey
      // Note: Many relays don't index this efficiently
      try {
        const events = await nostr.query(
          [{ kinds: [3], '#p': [pubkey], limit: 500 }],
          { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) }
        );

        // Count unique authors (each author can only follow once)
        const uniqueFollowers = new Set(events.map(e => e.pubkey));
        return uniqueFollowers.size;
      } catch {
        return 0;
      }
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (followers change less often)
  });

  return {
    followers: followersCount,
    following: followingCount,
    isLoading: followingLoading || followersLoading,
  };
}
