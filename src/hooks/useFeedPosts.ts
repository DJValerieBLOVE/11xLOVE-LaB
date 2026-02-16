/**
 * useFeedPosts Hooks
 * 
 * Uses Primal's WebSocket cache server for fast feed loading.
 * This is the same approach Primal uses - all data comes in one WebSocket response:
 * - Notes (kind 1)
 * - Profiles (kind 0)
 * - Stats (kind 10000100)
 * - User actions (kind 10000115)
 * 
 * Key improvements:
 * - Reuses single WebSocket connection
 * - Uses proper until/since parameters for pagination
 * - Parallel queries to user's relays for posts Primal might miss
 */

import { useNostr } from '@nostrify/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useAppContext } from './useAppContext';
import { LAB_RELAY_URL, NEVER_SHAREABLE_KINDS } from '@/lib/relays';
import { 
  fetchPrimalNetworkFeed, 
  fetchPrimalFutureFeed,
  fetchPrimalEventStats, 
  fetchPrimalProfiles,
  type PrimalLinkMetadata,
} from '@/lib/primalCache';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';

/** Engagement stats for a post */
export interface PostStats {
  likes: number;
  reposts: number;
  replies: number;
  zaps: number;
  satsZapped: number;
}

/** Author info */
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
  /** Link previews for URLs in the post (from Primal) */
  linkPreviews?: Map<string, PrimalLinkMetadata>;
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
 * Get public relays (excluding Railway)
 */
function usePublicRelays(): string[] {
  const { config } = useAppContext();
  return config.relayMetadata.relays
    .filter(r => r.read && !r.url.includes('railway.app'))
    .map(r => r.url);
}

/**
 * Fetch posts from followed users using Primal's WebSocket cache
 * This is FAST - all data comes in one response
 */
export function useFollowingPosts(limit: number = 40) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const publicRelays = usePublicRelays();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['following-posts-v4', user?.pubkey, limit],
    queryFn: async ({ signal }): Promise<FeedPost[]> => {
      const now = Math.ceil(Date.now() / 1000);
      console.log('[Feed] Starting feed fetch, user:', user?.pubkey?.slice(0, 8), 'at:', now);
      if (!user) {
        console.log('[Feed] No user, returning empty');
        return [];
      }
      
      const posts: FeedPost[] = [];
      const seenIds = new Set<string>();
      
      // 1. Fetch from Primal's cache (fast, includes stats)
      // Pass current timestamp to ensure we get latest posts
      console.log('[Feed] Calling Primal with until:', now);
      console.time('[Feed] Primal fetch');
      const primalResult = await fetchPrimalNetworkFeed(user.pubkey, limit, now, signal);
      console.timeEnd('[Feed] Primal fetch');
      console.log('[Feed] Got', primalResult.notes.length, 'notes,', primalResult.stats.size, 'stats,', primalResult.profiles.size, 'profiles from Primal');
      
      for (const note of primalResult.notes) {
        if (seenIds.has(note.id)) continue;
        seenIds.add(note.id);
        
        const stats = primalResult.stats.get(note.id);
        const actions = primalResult.actions.get(note.id);
        const profile = primalResult.profiles.get(note.pubkey);
        
        posts.push({
          event: note,
          author: profile ? { pubkey: note.pubkey, metadata: profile } : { pubkey: note.pubkey },
          isPrivate: false,
          source: 'primal',
          stats: stats ? {
            likes: stats.likes || 0,
            reposts: stats.reposts || 0,
            replies: stats.replies || 0,
            zaps: stats.zaps || 0,
            satsZapped: stats.satszapped || 0,
          } : { ...emptyStats },
          userLiked: actions?.liked || false,
          userReposted: actions?.reposted || false,
          userZapped: actions?.zapped || false,
          linkPreviews: primalResult.linkPreviews.size > 0 ? primalResult.linkPreviews : undefined,
        });
      }
      
      // 2. Query user's custom relays in BACKGROUND (don't block initial render)
      // This runs after Primal results are already returned
      if (publicRelays.length > 0 && !signal?.aborted) {
        // Fire and forget - don't await, let it update in background
        (async () => {
          try {
            console.time('[Feed] Relay fetch (background)');
            
            // Get follow list first (quick query)
            const contactEvents = await nostr.query([
              { kinds: [3], authors: [user.pubkey], limit: 1 },
            ], { signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]) });
            
            const follows = contactEvents[0]?.tags
              .filter(([name]) => name === 'p')
              .map(([, pubkey]) => pubkey)
              .filter(Boolean) || [];
            
            if (follows.length > 0) {
              // Query relays for recent posts from follows
              const relayGroup = nostr.group(publicRelays.slice(0, 2)); // Use top 2 relays only
              
              const relayEvents = await relayGroup.query([
                {
                  kinds: [1],
                  authors: follows.slice(0, 100), // Top 100 follows only
                  limit: 20, // Fewer posts
                },
              ], { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) }); // Shorter timeout
            
            console.timeEnd('[Feed] Relay fetch (background)');
            console.log('[Feed] Got', relayEvents.length, 'notes from relays (background)');
            
            // Collect new posts not from Primal
            const newPosts: FeedPost[] = [];
            const newEventIds: string[] = [];
            const newPubkeys = new Set<string>();
            
            for (const event of relayEvents) {
              if (seenIds.has(event.id)) continue;
              seenIds.add(event.id);
              newEventIds.push(event.id);
              newPubkeys.add(event.pubkey);
              
              newPosts.push({
                event,
                isPrivate: false,
                source: 'public',
                stats: { ...emptyStats },
              });
            }
            
            if (newPosts.length > 0) {
              // Get current posts from cache
              const currentPosts = queryClient.getQueryData<FeedPost[]>(['following-posts-v4', user.pubkey, limit]) || [];
              
              // Merge new posts, dedupe, sort
              const mergedPosts = [...currentPosts];
              const existingIds = new Set(currentPosts.map(p => p.event.id));
              
              for (const post of newPosts) {
                if (!existingIds.has(post.event.id)) {
                  mergedPosts.push(post);
                }
              }
              
              mergedPosts.sort((a, b) => b.event.created_at - a.event.created_at);
              
              // Update cache with merged posts
              queryClient.setQueryData(['following-posts-v4', user.pubkey, limit], mergedPosts.slice(0, limit));
              
              // Fetch stats for new posts (optional, don't await)
              if (newEventIds.length > 0) {
                fetchPrimalEventStats(newEventIds, user.pubkey).catch(() => {});
              }
            }
          }
        } catch (error) {
          console.warn('[Feed] Background relay query failed:', error);
        }
        })(); // End of background async function
      }

      // Sort by timestamp (newest first) and return IMMEDIATELY
      // Don't wait for relay query - it runs in background
      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      console.log('[Feed] Returning', posts.length, 'posts from Primal (relays loading in background)');
      return posts.slice(0, limit);
    },
    enabled: !!user,
    staleTime: 0, // Always consider stale - fetch fresh
    gcTime: 60000, // 1 minute garbage collection
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    networkMode: 'always', // Always fetch from network
  });
}

/**
 * Check for new posts since the last fetch (for notification badges)
 */
export function useNewPostsCount(lastSeenTimestamp: number, tab: 'latest' | 'tribes') {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['new-posts-count', tab, user?.pubkey, lastSeenTimestamp],
    queryFn: async ({ signal }): Promise<number> => {
      if (!user || lastSeenTimestamp === 0) return 0;
      
      try {
        if (tab === 'latest') {
          // Use Primal's future feed endpoint for efficiency
          const result = await fetchPrimalFutureFeed(user.pubkey, lastSeenTimestamp, signal);
          return result.notes.length;
        } else if (tab === 'tribes') {
          const labRelay = nostr.relay(LAB_RELAY_URL);
          const newEvents = await labRelay.query([
            {
              kinds: [11, 12],
              since: lastSeenTimestamp,
              limit: 100,
            },
          ], { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) });
          
          return newEvents.length;
        }
      } catch {
        return 0;
      }
      
      return 0;
    },
    enabled: !!user && lastSeenTimestamp > 0,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

/**
 * Fetch all feed posts - combines Primal with LaB posts
 */
export function useFeedPosts(limit: number = 40) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['feed-posts-combined', user?.pubkey, limit],
    queryFn: async ({ signal }): Promise<FeedPost[]> => {
      if (!user) return [];
      
      const posts: FeedPost[] = [];
      const seenIds = new Set<string>();

      // 1. Fetch from Primal's cache (fast)
      const primalResult = await fetchPrimalNetworkFeed(user.pubkey, limit, undefined, signal);
      
      for (const note of primalResult.notes) {
        if (seenIds.has(note.id)) continue;
        seenIds.add(note.id);
        
        const stats = primalResult.stats.get(note.id);
        const actions = primalResult.actions.get(note.id);
        const profile = primalResult.profiles.get(note.pubkey);
        
        posts.push({
          event: note,
          author: profile ? { pubkey: note.pubkey, metadata: profile } : { pubkey: note.pubkey },
          isPrivate: false,
          source: 'primal',
          stats: stats ? {
            likes: stats.likes || 0,
            reposts: stats.reposts || 0,
            replies: stats.replies || 0,
            zaps: stats.zaps || 0,
            satsZapped: stats.satszapped || 0,
          } : { ...emptyStats },
          userLiked: actions?.liked || false,
          userReposted: actions?.reposted || false,
          userZapped: actions?.zapped || false,
          linkPreviews: primalResult.linkPreviews.size > 0 ? primalResult.linkPreviews : undefined,
        });
      }

      // 2. Also fetch from LaB relay for private posts
      try {
        const labRelay = nostr.relay(LAB_RELAY_URL);
        
        const labEvents = await labRelay.query([
          { kinds: [1], limit: 20 },
        ], { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) });

        for (const event of labEvents) {
          if (seenIds.has(event.id)) continue;
          seenIds.add(event.id);
          
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

      // Sort by timestamp
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
 * Get the user's follow list
 */
export function useFollowList() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['follow-list', user?.pubkey],
    queryFn: async ({ signal }): Promise<string[]> => {
      if (!user) return [];
      
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

/** Format tribe name from slug */
function formatTribeName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export { formatTribeName };
