/**
 * useFeedPosts Hooks
 * 
 * Fetches posts from ALL user's configured relays + Primal API for stats.
 * - Latest: Posts from all user's relays (people they follow)
 * - Tribes: Private posts from Railway relay
 * - New post notifications for tab badges
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useAppContext } from './useAppContext';
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
 * Get the user's configured relay URLs for reading
 */
function useReadRelays(): string[] {
  const { config } = useAppContext();
  return config.relayMetadata.relays
    .filter(r => r.read)
    .map(r => r.url);
}

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
 * Fetch stats for events from Primal's caching API
 */
async function fetchPrimalStats(
  eventIds: string[],
  userPubkey?: string,
  signal?: AbortSignal
): Promise<Map<string, { stats: PostStats; userLiked: boolean; userReposted: boolean; userZapped: boolean }>> {
  const statsMap = new Map<string, { stats: PostStats; userLiked: boolean; userReposted: boolean; userZapped: boolean }>();
  
  if (eventIds.length === 0) return statsMap;
  
  // Initialize all with empty stats
  for (const id of eventIds) {
    statsMap.set(id, { stats: { ...emptyStats }, userLiked: false, userReposted: false, userZapped: false });
  }
  
  try {
    // Batch into chunks of 50
    const chunks: string[][] = [];
    for (let i = 0; i < eventIds.length; i += 50) {
      chunks.push(eventIds.slice(i, i + 50));
    }
    
    for (const chunk of chunks) {
      const request = [
        'event_actions',
        {
          event_ids: chunk,
          ...(userPubkey ? { user_pubkey: userPubkey } : {}),
        },
      ];

      const response = await fetch('https://primal.net/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
      });

      if (!response.ok) continue;

      const data = await response.json();
      
      for (const item of data) {
        // Kind 10000100: Note stats
        if (item.kind === 10000100) {
          try {
            const noteStats = JSON.parse(item.content);
            const entry = statsMap.get(noteStats.event_id);
            if (entry) {
              entry.stats = {
                likes: noteStats.likes || 0,
                reposts: noteStats.reposts || 0,
                replies: noteStats.replies || 0,
                zaps: noteStats.zaps || 0,
                satsZapped: noteStats.satszapped || 0,
              };
            }
          } catch {
            // Ignore
          }
        }
        // Kind 10000115: User actions
        else if (item.kind === 10000115) {
          try {
            const actions = JSON.parse(item.content);
            const entry = statsMap.get(actions.event_id);
            if (entry) {
              entry.userLiked = actions.liked || false;
              entry.userReposted = actions.reposted || false;
              entry.userZapped = actions.zapped || false;
            }
          } catch {
            // Ignore
          }
        }
      }
    }
  } catch (error) {
    console.warn('[Feed] Primal stats fetch failed:', error);
  }
  
  return statsMap;
}

/**
 * Fetch user profiles from Primal (batch)
 */
async function fetchPrimalProfiles(
  pubkeys: string[],
  signal?: AbortSignal
): Promise<Map<string, NostrMetadata>> {
  const profiles = new Map<string, NostrMetadata>();
  
  if (pubkeys.length === 0) return profiles;
  
  try {
    // Dedupe and limit
    const uniquePubkeys = [...new Set(pubkeys)].slice(0, 100);
    
    const request = ['user_infos', { pubkeys: uniquePubkeys }];

    const response = await fetch('https://primal.net/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
    });

    if (!response.ok) return profiles;

    const data = await response.json();
    
    for (const item of data) {
      if (item.kind === 0) {
        try {
          profiles.set(item.pubkey, JSON.parse(item.content));
        } catch {
          // Ignore
        }
      }
    }
  } catch (error) {
    console.warn('[Feed] Primal profiles fetch failed:', error);
  }
  
  return profiles;
}

/**
 * Get the user's follow list (kind 3 contact list)
 */
export function useFollowList() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const publicRelays = usePublicRelays();

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
      
      // Fallback: Query ALL user's relays
      if (publicRelays.length === 0) return [];
      
      try {
        const relayGroup = nostr.group(publicRelays);
        const contactEvents = await relayGroup.query([
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

/**
 * Fetch posts from followed users using ALL user's configured relays
 * Then enriches with stats from Primal API
 */
export function useFollowingPosts(limit: number = 40) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { data: follows = [], isLoading: followsLoading } = useFollowList();
  const publicRelays = usePublicRelays();

  return useQuery({
    queryKey: ['following-posts', user?.pubkey, follows.length, publicRelays.join(','), limit],
    queryFn: async ({ signal }): Promise<FeedPost[]> => {
      if (!user || follows.length === 0 || publicRelays.length === 0) {
        return [];
      }
      
      const posts: FeedPost[] = [];
      const seenIds = new Set<string>();
      
      try {
        // Query ALL user's configured relays
        const relayGroup = nostr.group(publicRelays);
        
        // Query posts from followed users
        const events = await relayGroup.query([
          {
            kinds: [1],
            authors: follows.slice(0, 500),
            limit: limit * 2,
          },
        ], { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });

        for (const event of events) {
          if (seenIds.has(event.id)) continue;
          seenIds.add(event.id);
          
          posts.push({
            event,
            isPrivate: false,
            source: 'public',
            stats: { ...emptyStats },
          });
        }
      } catch (error) {
        console.warn('[Feed] Relay query failed:', error);
      }

      // Sort by timestamp (newest first)
      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      const displayPosts = posts.slice(0, limit);
      
      // Enrich with stats from Primal API
      const eventIds = displayPosts.map(p => p.event.id);
      const pubkeys = [...new Set(displayPosts.map(p => p.event.pubkey))];
      
      // Fetch stats and profiles in parallel
      const [statsMap, profilesMap] = await Promise.all([
        fetchPrimalStats(eventIds, user.pubkey, signal),
        fetchPrimalProfiles(pubkeys, signal),
      ]);
      
      // Apply stats and profiles
      for (const post of displayPosts) {
        const statsEntry = statsMap.get(post.event.id);
        if (statsEntry) {
          post.stats = statsEntry.stats;
          post.userLiked = statsEntry.userLiked;
          post.userReposted = statsEntry.userReposted;
          post.userZapped = statsEntry.userZapped;
        }
        
        const profile = profilesMap.get(post.event.pubkey);
        if (profile) {
          post.author = { pubkey: post.event.pubkey, metadata: profile };
        }
      }

      return displayPosts;
    },
    enabled: !!user && !followsLoading && follows.length > 0 && publicRelays.length > 0,
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
  const { data: follows = [] } = useFollowList();
  const publicRelays = usePublicRelays();

  return useQuery({
    queryKey: ['new-posts-count', tab, user?.pubkey, lastSeenTimestamp],
    queryFn: async ({ signal }): Promise<number> => {
      if (!user || lastSeenTimestamp === 0) return 0;
      
      try {
        if (tab === 'latest') {
          if (follows.length === 0 || publicRelays.length === 0) return 0;
          
          const relayGroup = nostr.group(publicRelays);
          const newEvents = await relayGroup.query([
            {
              kinds: [1],
              authors: follows.slice(0, 200),
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
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 15000,
  });
}

/**
 * Fetch all feed posts - combines relays with LaB posts
 */
export function useFeedPosts(limit: number = 40) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { data: follows = [], isLoading: followsLoading } = useFollowList();
  const publicRelays = usePublicRelays();

  return useQuery({
    queryKey: ['feed-posts-combined', user?.pubkey, follows.length, publicRelays.join(','), limit],
    queryFn: async ({ signal }): Promise<FeedPost[]> => {
      if (!user) return [];
      
      const posts: FeedPost[] = [];
      const seenIds = new Set<string>();

      // 1. Fetch from user's configured relays
      if (follows.length > 0 && publicRelays.length > 0) {
        try {
          const relayGroup = nostr.group(publicRelays);
          
          const events = await relayGroup.query([
            {
              kinds: [1],
              authors: follows.slice(0, 500),
              limit: limit * 2,
            },
          ], { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });

          for (const event of events) {
            if (seenIds.has(event.id)) continue;
            seenIds.add(event.id);
            
            posts.push({
              event,
              isPrivate: false,
              source: 'public',
              stats: { ...emptyStats },
            });
          }
        } catch (error) {
          console.warn('[Feed] Public relays failed:', error);
        }
      }

      // 2. Also fetch from LaB relay
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
      const displayPosts = posts.slice(0, limit);
      
      // Enrich public posts with stats
      const publicPostIds = displayPosts.filter(p => !p.isPrivate).map(p => p.event.id);
      const pubkeys = [...new Set(displayPosts.map(p => p.event.pubkey))];
      
      const [statsMap, profilesMap] = await Promise.all([
        fetchPrimalStats(publicPostIds, user.pubkey, signal),
        fetchPrimalProfiles(pubkeys, signal),
      ]);
      
      for (const post of displayPosts) {
        if (!post.isPrivate) {
          const statsEntry = statsMap.get(post.event.id);
          if (statsEntry) {
            post.stats = statsEntry.stats;
            post.userLiked = statsEntry.userLiked;
            post.userReposted = statsEntry.userReposted;
            post.userZapped = statsEntry.userZapped;
          }
        }
        
        const profile = profilesMap.get(post.event.pubkey);
        if (profile) {
          post.author = { pubkey: post.event.pubkey, metadata: profile };
        }
      }
      
      return displayPosts;
    },
    enabled: !!user && !followsLoading,
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

/** Format tribe name from slug */
function formatTribeName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Re-export for backwards compatibility
export { formatTribeName };
