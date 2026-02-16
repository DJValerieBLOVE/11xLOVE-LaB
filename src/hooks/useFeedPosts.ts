/**
 * useFeedPosts Hooks
 * 
 * Uses Primal's caching API for fast feed loading with stats included.
 * Falls back to direct relay queries when needed.
 * 
 * - Latest: Uses Primal API for user's following feed (fast, with stats)
 * - Tribes: Uses Railway relay for private posts
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { LAB_RELAY_URL, NEVER_SHAREABLE_KINDS } from '@/lib/relays';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';

/** Engagement stats for a post */
export interface PostStats {
  likes: number;
  reposts: number;
  replies: number;
  zaps: number;
  satsZapped: number;
}

/** Author info from Primal */
export interface PostAuthor {
  pubkey: string;
  metadata?: NostrMetadata;
}

/** A post with its engagement data */
export interface FeedPost {
  event: NostrEvent;
  author?: PostAuthor;
  isPrivate: boolean;
  tribeName?: string;
  source: 'lab' | 'public' | 'primal';
  stats: PostStats;
  userLiked?: boolean;
  userReposted?: boolean;
  userZapped?: boolean;
}

/** Default empty stats */
const emptyStats: PostStats = {
  likes: 0,
  reposts: 0,
  replies: 0,
  zaps: 0,
  satsZapped: 0,
};

/**
 * Primal API response types
 */
interface PrimalNoteStats {
  event_id: string;
  likes: number;
  replies: number;
  reposts: number;
  zaps: number;
  satszapped: number;
  score: number;
  score24h: number;
}

interface PrimalNoteActions {
  event_id: string;
  liked: boolean;
  replied: boolean;
  reposted: boolean;
  zapped: boolean;
}

/**
 * Fetch feed from Primal's caching API
 * This is MUCH faster than querying relays directly and includes all stats
 */
async function fetchPrimalFeed(
  pubkey: string,
  limit: number = 30,
  until?: number,
  signal?: AbortSignal
): Promise<FeedPost[]> {
  const posts: FeedPost[] = [];
  
  try {
    // Build the request - use user's network feed
    const request = [
      'feed',
      {
        pubkey,
        kind: 'network',  // Posts from people the user follows
        limit,
        ...(until ? { until } : {}),
      },
    ];

    const response = await fetch('https://primal.net/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Primal API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the response - it's an array of Nostr events plus metadata
    const events: NostrEvent[] = [];
    const users: Record<string, NostrMetadata> = {};
    const stats: Record<string, PrimalNoteStats> = {};
    const actions: Record<string, PrimalNoteActions> = {};
    
    for (const item of data) {
      if (!item.kind) continue;
      
      // Kind 0: User metadata
      if (item.kind === 0) {
        try {
          users[item.pubkey] = JSON.parse(item.content);
        } catch {
          // Ignore parse errors
        }
      }
      // Kind 1: Notes
      else if (item.kind === 1) {
        events.push(item as NostrEvent);
      }
      // Kind 6: Reposts
      else if (item.kind === 6) {
        events.push(item as NostrEvent);
      }
      // Kind 10000100: Note stats (Primal custom)
      else if (item.kind === 10000100) {
        try {
          const noteStats = JSON.parse(item.content) as PrimalNoteStats;
          stats[noteStats.event_id] = noteStats;
        } catch {
          // Ignore
        }
      }
      // Kind 10000115: Note actions (user's interactions)
      else if (item.kind === 10000115) {
        try {
          const noteActions = JSON.parse(item.content) as PrimalNoteActions;
          actions[noteActions.event_id] = noteActions;
        } catch {
          // Ignore
        }
      }
    }
    
    // Convert to FeedPost objects
    for (const event of events) {
      const eventStats = stats[event.id] || {};
      const eventActions = actions[event.id] || {};
      const authorMetadata = users[event.pubkey];
      
      posts.push({
        event,
        author: authorMetadata ? {
          pubkey: event.pubkey,
          metadata: authorMetadata,
        } : undefined,
        isPrivate: false,
        source: 'primal',
        stats: {
          likes: eventStats.likes || 0,
          reposts: eventStats.reposts || 0,
          replies: eventStats.replies || 0,
          zaps: eventStats.zaps || 0,
          satsZapped: eventStats.satszapped || 0,
        },
        userLiked: eventActions.liked || false,
        userReposted: eventActions.reposted || false,
        userZapped: eventActions.zapped || false,
      });
    }
    
    // Sort by created_at (newest first)
    posts.sort((a, b) => b.event.created_at - a.event.created_at);
    
  } catch (error) {
    console.warn('[Feed] Primal API failed:', error);
  }
  
  return posts;
}

/**
 * Fetch posts from followed users using Primal's fast caching API
 * This gives us instant feed loading with all stats included
 */
export function useFollowingPosts(limit: number = 30) {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['following-posts-primal', user?.pubkey, limit],
    queryFn: async ({ signal }): Promise<FeedPost[]> => {
      if (!user) return [];
      
      // Use Primal's caching API for fast feed with stats
      const posts = await fetchPrimalFeed(user.pubkey, limit, undefined, signal);
      
      return posts;
    },
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Fetch all feed posts - combines Primal feed with LaB posts
 */
export function useFeedPosts(limit: number = 30) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['feed-posts-combined', user?.pubkey, limit],
    queryFn: async ({ signal }): Promise<FeedPost[]> => {
      if (!user) return [];
      
      const posts: FeedPost[] = [];

      // 1. Fetch from Primal API (fast, with stats)
      const primalPosts = await fetchPrimalFeed(user.pubkey, limit, undefined, signal);
      posts.push(...primalPosts);

      // 2. Also fetch from LaB relay for private posts
      try {
        const labRelay = nostr.relay(LAB_RELAY_URL);
        
        const labEvents = await labRelay.query([
          { kinds: [1], limit: 20 },
        ], { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) });

        for (const event of labEvents) {
          // Skip duplicates
          if (posts.some(p => p.event.id === event.id)) continue;
          
          const isPrivate = NEVER_SHAREABLE_KINDS.includes(event.kind) || 
                           event.tags.some(([name]) => name === 'h');
          const tribeName = event.tags.find(([name]) => name === 'h')?.[1];
          
          posts.push({
            event,
            isPrivate,
            tribeName: tribeName ? formatTribeName(tribeName) : undefined,
            source: 'lab',
            stats: { ...emptyStats },
          });
        }
      } catch (error) {
        console.warn('[Feed] LaB relay failed:', error);
      }

      // Sort by timestamp (newest first)
      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      
      return posts.slice(0, limit);
    },
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Fetch only Tribe posts (private) from Railway relay
 */
export function useTribePosts(limit: number = 30) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['tribe-posts', user?.pubkey, limit],
    queryFn: async ({ signal }): Promise<FeedPost[]> => {
      if (!user) return [];
      
      const posts: FeedPost[] = [];

      try {
        const labRelay = nostr.relay(LAB_RELAY_URL);
        
        const tribeEvents = await labRelay.query([
          { kinds: [11, 12], limit: limit },
        ], { signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]) });

        for (const event of tribeEvents) {
          const tribeName = event.tags.find(([name]) => name === 'h')?.[1];
          
          posts.push({
            event,
            isPrivate: true,
            tribeName: tribeName ? formatTribeName(tribeName) : 'Private Tribe',
            source: 'lab',
            stats: { ...emptyStats },
          });
        }
      } catch (error) {
        console.warn('[Feed] Tribe posts failed:', error);
      }

      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      return posts;
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

/**
 * Get the user's follow list (kind 3 contact list)
 */
export function useFollowList() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['follow-list', user?.pubkey],
    queryFn: async ({ signal }): Promise<string[]> => {
      if (!user) return [];
      
      try {
        // Try Primal API first for faster response
        const response = await fetch('https://primal.net/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(['contact_list', { pubkey: user.pubkey }]),
          signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
        });
        
        if (response.ok) {
          const data = await response.json();
          const follows: string[] = [];
          
          for (const item of data) {
            if (item.kind === 3 && item.pubkey === user.pubkey) {
              for (const tag of item.tags || []) {
                if (tag[0] === 'p' && tag[1]) {
                  follows.push(tag[1]);
                }
              }
              break;
            }
          }
          
          if (follows.length > 0) {
            return follows;
          }
        }
      } catch {
        // Fallback to relay query
      }
      
      // Fallback: Query relays directly
      try {
        const contactEvents = await nostr.query([
          { kinds: [3], authors: [user.pubkey], limit: 1 },
        ], { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) });

        if (contactEvents.length > 0) {
          return contactEvents[0].tags
            .filter(([name]) => name === 'p')
            .map(([, pubkey]) => pubkey)
            .filter(Boolean);
        }
      } catch (error) {
        console.warn('[Feed] Follow list query failed:', error);
      }
      
      return [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

/** Helper to chunk an array */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Format tribe name from slug */
function formatTribeName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Re-export for backwards compatibility
export { chunkArray, formatTribeName };
