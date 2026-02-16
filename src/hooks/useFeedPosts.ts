/**
 * useFeedPosts Hooks
 * 
 * Uses Primal's WebSocket cache server for fast feed loading.
 * This is the same approach Primal uses - all data comes in one WebSocket response:
 * - Notes (kind 1)
 * - Profiles (kind 0)
 * - Stats (kind 10000100)
 * - User actions (kind 10000115)
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useAppContext } from './useAppContext';
import { LAB_RELAY_URL, NEVER_SHAREABLE_KINDS } from '@/lib/relays';
import { fetchPrimalNetworkFeed, fetchPrimalEventStats, fetchPrimalProfiles } from '@/lib/primalCache';
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

  return useQuery({
    queryKey: ['following-posts-primal-ws', user?.pubkey, limit],
    queryFn: async ({ signal }): Promise<FeedPost[]> => {
      if (!user) return [];
      
      const posts: FeedPost[] = [];
      const seenIds = new Set<string>();
      
      // 1. Fetch from Primal's cache (fast, includes stats)
      const primalResult = await fetchPrimalNetworkFeed(user.pubkey, limit, undefined, signal);
      
      for (const note of primalResult.notes) {
        if (seenIds.has(note.id)) continue;
        seenIds.add(note.id);
        
        const stats = primalResult.stats.get(note.id);
        const actions = primalResult.actions.get(note.id);
        const profile = primalResult.profiles.get(note.pubkey);
        
        posts.push({
          event: note,
          author: profile ? { pubkey: note.pubkey, metadata: profile } : undefined,
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
        });
      }
      
      // 2. Also query user's custom relays (for posts Primal might not have)
      if (publicRelays.length > 0 && posts.length < limit) {
        try {
          // Get follow list first
          const contactEvents = await nostr.query([
            { kinds: [3], authors: [user.pubkey], limit: 1 },
          ], { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) });
          
          const follows = contactEvents[0]?.tags
            .filter(([name]) => name === 'p')
            .map(([, pubkey]) => pubkey)
            .filter(Boolean) || [];
          
          if (follows.length > 0) {
            const relayGroup = nostr.group(publicRelays);
            
            const relayEvents = await relayGroup.query([
              {
                kinds: [1],
                authors: follows.slice(0, 300),
                limit: limit,
              },
            ], { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) });
            
            // Collect new posts not from Primal
            const newEventIds: string[] = [];
            const newPubkeys: string[] = [];
            
            for (const event of relayEvents) {
              if (seenIds.has(event.id)) continue;
              seenIds.add(event.id);
              newEventIds.push(event.id);
              newPubkeys.push(event.pubkey);
              
              posts.push({
                event,
                isPrivate: false,
                source: 'public',
                stats: { ...emptyStats },
              });
            }
            
            // Fetch stats for new posts from Primal
            if (newEventIds.length > 0) {
              const [statsResult, profilesResult] = await Promise.all([
                fetchPrimalEventStats(newEventIds, user.pubkey, signal),
                fetchPrimalProfiles([...new Set(newPubkeys)], signal),
              ]);
              
              for (const post of posts) {
                if (post.source !== 'public') continue;
                
                const stats = statsResult.stats.get(post.event.id);
                const actions = statsResult.actions.get(post.event.id);
                const profile = profilesResult.get(post.event.pubkey);
                
                if (stats) {
                  post.stats = {
                    likes: stats.likes || 0,
                    reposts: stats.reposts || 0,
                    replies: stats.replies || 0,
                    zaps: stats.zaps || 0,
                    satsZapped: stats.satszapped || 0,
                  };
                }
                if (actions) {
                  post.userLiked = actions.liked;
                  post.userReposted = actions.reposted;
                  post.userZapped = actions.zapped;
                }
                if (profile) {
                  post.author = { pubkey: post.event.pubkey, metadata: profile };
                }
              }
            }
          }
        } catch (error) {
          console.warn('[Feed] Relay query failed:', error);
        }
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
 * Check for new posts since the last fetch (for notification badges)
 */
export function useNewPostsCount(lastSeenTimestamp: number, tab: 'latest' | 'tribes') {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const publicRelays = usePublicRelays();

  return useQuery({
    queryKey: ['new-posts-count', tab, user?.pubkey, lastSeenTimestamp],
    queryFn: async ({ signal }): Promise<number> => {
      if (!user || lastSeenTimestamp === 0) return 0;
      
      try {
        if (tab === 'latest') {
          // Get follow list
          const contactEvents = await nostr.query([
            { kinds: [3], authors: [user.pubkey], limit: 1 },
          ], { signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]) });
          
          const follows = contactEvents[0]?.tags
            .filter(([name]) => name === 'p')
            .map(([, pubkey]) => pubkey)
            .filter(Boolean) || [];
          
          if (follows.length === 0 || publicRelays.length === 0) return 0;
          
          const relayGroup = nostr.group(publicRelays.slice(0, 3)); // Use fewer relays for speed
          const newEvents = await relayGroup.query([
            {
              kinds: [1],
              authors: follows.slice(0, 100),
              since: lastSeenTimestamp,
              limit: 100,
            },
          ], { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) });
          
          return newEvents.length;
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
          author: profile ? { pubkey: note.pubkey, metadata: profile } : undefined,
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
