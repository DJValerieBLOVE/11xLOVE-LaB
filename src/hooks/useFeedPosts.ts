/**
 * useFeedPosts Hook
 * 
 * Fetches posts for the Feed from:
 * - Private Railway relay (Tribe messages, LaB posts)
 * - Public relays (public Nostr posts from followed users)
 * 
 * Combines and sorts by timestamp, marking each post as private or public.
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { LAB_RELAY_URL, PUBLIC_RELAYS, NEVER_SHAREABLE_KINDS } from '@/lib/relays';
import type { NostrEvent } from '@nostrify/nostrify';

export interface FeedPost {
  event: NostrEvent;
  isPrivate: boolean;
  tribeName?: string;
  source: 'lab' | 'public';
}

/**
 * Fetch all feed posts (private + public combined)
 */
export function useFeedPosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['feed-posts', user?.pubkey, limit],
    queryFn: async (): Promise<FeedPost[]> => {
      const posts: FeedPost[] = [];

      // 1. Fetch from private LaB relay
      try {
        const labRelay = nostr.relay(LAB_RELAY_URL);
        
        // Get LaB-specific posts (kind 1 with LaB tags, kind 11/12 tribe messages)
        const labEvents = await labRelay.query([
          // Public-ish posts on LaB relay (kind 1)
          {
            kinds: [1],
            limit: limit,
          },
          // Tribe messages (kind 11, 12) - NIP-29
          {
            kinds: [11, 12],
            limit: limit,
          },
        ]);

        for (const event of labEvents) {
          const isPrivate = NEVER_SHAREABLE_KINDS.includes(event.kind) || 
                           event.tags.some(([name]) => name === 'h');
          
          // Get tribe name from h tag if present
          const tribeName = event.tags.find(([name]) => name === 'h')?.[1];
          
          posts.push({
            event,
            isPrivate,
            tribeName: tribeName ? formatTribeName(tribeName) : undefined,
            source: 'lab',
          });
        }
      } catch (error) {
        console.warn('[Feed] Failed to fetch from LaB relay:', error);
      }

      // 2. Fetch from public relays
      try {
        const publicRelayGroup = nostr.group(PUBLIC_RELAYS.slice(0, 3)); // Use first 3 for speed
        
        const publicEvents = await publicRelayGroup.query([
          {
            kinds: [1], // Regular notes
            limit: limit,
          },
        ]);

        for (const event of publicEvents) {
          // Skip if we already have this event from LaB relay
          if (posts.some(p => p.event.id === event.id)) {
            continue;
          }
          
          posts.push({
            event,
            isPrivate: false,
            source: 'public',
          });
        }
      } catch (error) {
        console.warn('[Feed] Failed to fetch from public relays:', error);
      }

      // 3. Sort by timestamp (newest first) and limit
      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      
      return posts.slice(0, limit);
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Fetch only Tribe posts (private)
 */
export function useTribePosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['tribe-posts', user?.pubkey, limit],
    queryFn: async (): Promise<FeedPost[]> => {
      const posts: FeedPost[] = [];

      try {
        const labRelay = nostr.relay(LAB_RELAY_URL);
        
        // Tribe messages only (kind 11, 12) - NIP-29
        const tribeEvents = await labRelay.query([
          {
            kinds: [11, 12],
            limit: limit,
          },
        ]);

        for (const event of tribeEvents) {
          const tribeName = event.tags.find(([name]) => name === 'h')?.[1];
          
          posts.push({
            event,
            isPrivate: true,
            tribeName: tribeName ? formatTribeName(tribeName) : 'Private Tribe',
            source: 'lab',
          });
        }
      } catch (error) {
        console.warn('[Feed] Failed to fetch tribe posts:', error);
      }

      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      return posts;
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

/**
 * Fetch only public posts
 */
export function usePublicPosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['public-posts', user?.pubkey, limit],
    queryFn: async (): Promise<FeedPost[]> => {
      const posts: FeedPost[] = [];

      try {
        const publicRelayGroup = nostr.group(PUBLIC_RELAYS.slice(0, 3));
        
        const publicEvents = await publicRelayGroup.query([
          {
            kinds: [1],
            limit: limit,
          },
        ]);

        for (const event of publicEvents) {
          posts.push({
            event,
            isPrivate: false,
            source: 'public',
          });
        }
      } catch (error) {
        console.warn('[Feed] Failed to fetch public posts:', error);
      }

      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      return posts;
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

/**
 * Format tribe name from h tag (e.g., "morning-risers" -> "Morning Risers")
 */
function formatTribeName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
