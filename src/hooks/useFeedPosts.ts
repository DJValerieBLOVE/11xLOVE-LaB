/**
 * useFeedPosts Hooks
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
  source: 'lab' | 'public' | 'trending';
}

/**
 * Get the user's follow list (kind 3 contact list)
 */
export function useFollowList() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['follow-list', user?.pubkey],
    queryFn: async (): Promise<string[]> => {
      if (!user) return [];
      
      try {
        const publicRelayGroup = nostr.group(PUBLIC_RELAYS.slice(0, 3));
        
        // Query kind 3 (contact list) for the current user
        const contactEvents = await publicRelayGroup.query([
          {
            kinds: [3],
            authors: [user.pubkey],
            limit: 1,
          },
        ]);

        if (contactEvents.length === 0) return [];
        
        // Extract pubkeys from 'p' tags
        const follows = contactEvents[0].tags
          .filter(([name]) => name === 'p')
          .map(([, pubkey]) => pubkey)
          .filter(Boolean);
        
        return follows;
      } catch (error) {
        console.warn('[Feed] Failed to fetch follow list:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all feed posts (private + public from follows)
 */
export function useFeedPosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { data: follows = [] } = useFollowList();

  return useQuery({
    queryKey: ['feed-posts', user?.pubkey, follows.length, limit],
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

      // 2. Fetch from public relays - ONLY from followed users
      if (follows.length > 0) {
        try {
          const publicRelayGroup = nostr.group(PUBLIC_RELAYS.slice(0, 3));
          
          // Batch follows into chunks of 50 to avoid filter limits
          const followChunks = [];
          for (let i = 0; i < follows.length; i += 50) {
            followChunks.push(follows.slice(i, i + 50));
          }
          
          for (const chunk of followChunks) {
            const publicEvents = await publicRelayGroup.query([
              {
                kinds: [1], // Regular notes
                authors: chunk, // Only from followed users!
                limit: Math.ceil(limit / followChunks.length),
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
          }
        } catch (error) {
          console.warn('[Feed] Failed to fetch from public relays:', error);
        }
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
 * Fetch posts from followed users only
 */
export function useFollowingPosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { data: follows = [] } = useFollowList();

  return useQuery({
    queryKey: ['following-posts', user?.pubkey, follows.length, limit],
    queryFn: async (): Promise<FeedPost[]> => {
      const posts: FeedPost[] = [];

      if (follows.length === 0) {
        return posts;
      }

      try {
        const publicRelayGroup = nostr.group(PUBLIC_RELAYS.slice(0, 3));
        
        // Batch follows into chunks of 50
        const followChunks = [];
        for (let i = 0; i < follows.length; i += 50) {
          followChunks.push(follows.slice(i, i + 50));
        }
        
        for (const chunk of followChunks) {
          const publicEvents = await publicRelayGroup.query([
            {
              kinds: [1],
              authors: chunk,
              limit: Math.ceil(limit / followChunks.length),
            },
          ]);

          for (const event of publicEvents) {
            if (posts.some(p => p.event.id === event.id)) continue;
            
            posts.push({
              event,
              isPrivate: false,
              source: 'public',
            });
          }
        }
      } catch (error) {
        console.warn('[Feed] Failed to fetch following posts:', error);
      }

      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      return posts.slice(0, limit);
    },
    enabled: !!user && follows.length > 0,
    staleTime: 30000,
  });
}

/**
 * Fetch trending/popular posts (high engagement)
 * Uses primal.net's cache for performance
 */
export function useTrendingPosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['trending-posts', limit],
    queryFn: async (): Promise<FeedPost[]> => {
      const posts: FeedPost[] = [];

      try {
        // Use Primal relay for trending content
        const primalRelay = nostr.relay('wss://relay.primal.net');
        
        // Query recent notes - Primal's relay naturally returns popular content
        const trendingEvents = await primalRelay.query([
          {
            kinds: [1],
            limit: limit,
          },
        ]);

        for (const event of trendingEvents) {
          posts.push({
            event,
            isPrivate: false,
            source: 'trending',
          });
        }
      } catch (error) {
        console.warn('[Feed] Failed to fetch trending posts:', error);
      }

      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      return posts.slice(0, limit);
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute for trending
  });
}

/**
 * Fetch only public posts (now from follows instead of global)
 * @deprecated Use useFollowingPosts instead
 */
export function usePublicPosts(limit: number = 50) {
  return useFollowingPosts(limit);
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
