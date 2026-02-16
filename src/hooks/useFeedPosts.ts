/**
 * useFeedPosts Hooks
 * 
 * Fetches posts for the Feed with engagement stats:
 * - Posts from Railway relay (Tribe messages, LaB posts)
 * - Posts from public relays (from followed users)
 * - Engagement stats: likes, reposts, zaps, replies
 * 
 * Inspired by Primal's FeedPage pattern.
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { LAB_RELAY_URL, PUBLIC_RELAYS, NEVER_SHAREABLE_KINDS } from '@/lib/relays';
import type { NostrEvent } from '@nostrify/nostrify';

/** Engagement stats for a post */
export interface PostStats {
  likes: number;
  reposts: number;
  replies: number;
  zaps: number;
  satsZapped: number;
}

/** A post with its engagement data */
export interface FeedPost {
  event: NostrEvent;
  isPrivate: boolean;
  tribeName?: string;
  source: 'lab' | 'public' | 'trending';
  stats: PostStats;
  /** Whether current user has liked this post */
  userLiked?: boolean;
  /** Whether current user has reposted this post */
  userReposted?: boolean;
  /** Whether current user has zapped this post */
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
 * Fetch engagement stats for a list of event IDs
 */
async function fetchEngagementStats(
  nostr: ReturnType<typeof useNostr>['nostr'],
  eventIds: string[],
  userPubkey?: string
): Promise<Map<string, { stats: PostStats; userLiked: boolean; userReposted: boolean; userZapped: boolean }>> {
  const statsMap = new Map<string, { stats: PostStats; userLiked: boolean; userReposted: boolean; userZapped: boolean }>();
  
  if (eventIds.length === 0) return statsMap;
  
  // Initialize all events with empty stats
  for (const id of eventIds) {
    statsMap.set(id, { 
      stats: { ...emptyStats }, 
      userLiked: false, 
      userReposted: false,
      userZapped: false,
    });
  }
  
  try {
    const relayGroup = nostr.group(PUBLIC_RELAYS.slice(0, 3));
    
    // Batch event IDs into chunks to avoid filter limits
    const chunks: string[][] = [];
    for (let i = 0; i < eventIds.length; i += 20) {
      chunks.push(eventIds.slice(i, i + 20));
    }
    
    for (const chunk of chunks) {
      // Query reactions, reposts, and replies in one request
      const engagementEvents = await relayGroup.query([
        // Likes (kind 7)
        { kinds: [7], '#e': chunk, limit: 500 },
        // Reposts (kind 6)
        { kinds: [6], '#e': chunk, limit: 100 },
        // Replies (kind 1 with e tag)
        { kinds: [1], '#e': chunk, limit: 200 },
        // Zaps (kind 9735)
        { kinds: [9735], '#e': chunk, limit: 200 },
      ]);
      
      for (const event of engagementEvents) {
        // Find which event this reaction is for
        const targetEventId = event.tags.find(([name]) => name === 'e')?.[1];
        if (!targetEventId || !statsMap.has(targetEventId)) continue;
        
        const entry = statsMap.get(targetEventId)!;
        
        if (event.kind === 7) {
          // Like/reaction
          entry.stats.likes++;
          if (userPubkey && event.pubkey === userPubkey) {
            entry.userLiked = true;
          }
        } else if (event.kind === 6) {
          // Repost
          entry.stats.reposts++;
          if (userPubkey && event.pubkey === userPubkey) {
            entry.userReposted = true;
          }
        } else if (event.kind === 1) {
          // Reply
          entry.stats.replies++;
        } else if (event.kind === 9735) {
          // Zap receipt
          entry.stats.zaps++;
          
          // Parse zap amount from bolt11 tag
          const bolt11Tag = event.tags.find(([name]) => name === 'bolt11')?.[1];
          if (bolt11Tag) {
            const amount = parseBolt11Amount(bolt11Tag);
            entry.stats.satsZapped += amount;
          }
          
          // Check if user sent this zap (from description tag)
          const descTag = event.tags.find(([name]) => name === 'description')?.[1];
          if (descTag && userPubkey) {
            try {
              const zapRequest = JSON.parse(descTag);
              if (zapRequest.pubkey === userPubkey) {
                entry.userZapped = true;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('[Feed] Failed to fetch engagement stats:', error);
  }
  
  return statsMap;
}

/**
 * Parse sats amount from bolt11 invoice
 * Simple parser - looks for amount in the invoice
 */
function parseBolt11Amount(bolt11: string): number {
  try {
    // bolt11 format: lnbc{amount}{multiplier}...
    // Amount is after 'lnbc' and before the next letter
    const match = bolt11.toLowerCase().match(/^lnbc(\d+)([munp]?)/);
    if (!match) return 0;
    
    const amount = parseInt(match[1], 10);
    const multiplier = match[2];
    
    // Convert to sats based on multiplier
    switch (multiplier) {
      case 'm': return amount * 100000; // milli-bitcoin = 100,000 sats
      case 'u': return amount * 100;    // micro-bitcoin = 100 sats
      case 'n': return Math.floor(amount / 10); // nano-bitcoin = 0.1 sats
      case 'p': return Math.floor(amount / 10000); // pico-bitcoin
      default: return amount * 100000000; // No multiplier = full bitcoin
    }
  } catch {
    return 0;
  }
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
        // Use multiple relays for better reliability
        const relays = nostr.group([
          'wss://relay.primal.net',
          'wss://relay.damus.io',
          'wss://nos.lol',
        ]);
        
        // Query kind 3 (contact list) for the current user
        const contactEvents = await relays.query([
          {
            kinds: [3],
            authors: [user.pubkey],
            limit: 1,
          },
        ]);

        if (contactEvents.length === 0) {
          console.log('[Feed] No contact list found for user');
          return [];
        }
        
        // Extract pubkeys from 'p' tags
        const follows = contactEvents[0].tags
          .filter(([name]) => name === 'p')
          .map(([, pubkey]) => pubkey)
          .filter(Boolean);
        
        console.log(`[Feed] Found ${follows.length} follows`);
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
 * Stats are fetched lazily per-post for faster initial load
 */
export function useFeedPosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { data: follows = [] } = useFollowList();

  return useQuery({
    queryKey: ['feed-posts', user?.pubkey, follows.length, limit],
    queryFn: async (): Promise<FeedPost[]> => {
      const posts: FeedPost[] = [];

      // 1. Fetch from private LaB relay (fast, single relay)
      try {
        const labRelay = nostr.relay(LAB_RELAY_URL);
        
        const labEvents = await labRelay.query([
          { kinds: [1], limit: limit },
          { kinds: [11, 12], limit: limit },
        ]);

        for (const event of labEvents) {
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
        console.warn('[Feed] Failed to fetch from LaB relay:', error);
      }

      // 2. Fetch from single fast relay for follows
      if (follows.length > 0) {
        try {
          // Use single relay for speed
          const fastRelay = nostr.relay('wss://relay.primal.net');
          
          const publicEvents = await fastRelay.query([
            {
              kinds: [1],
              authors: follows.slice(0, 100), // Limit authors for speed
              limit: limit,
            },
          ]);

          for (const event of publicEvents) {
            if (posts.some(p => p.event.id === event.id)) continue;
            
            posts.push({
              event,
              isPrivate: false,
              source: 'public',
              stats: { ...emptyStats },
            });
          }
        } catch (error) {
          console.warn('[Feed] Failed to fetch from public relay:', error);
        }
      }

      // Sort by timestamp (newest first)
      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      
      return posts.slice(0, limit);
    },
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 120000, // Less frequent refresh
  });
}

/**
 * Fetch only Tribe posts (private) with stats
 */
export function useTribePosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['tribe-posts', user?.pubkey, limit],
    queryFn: async (): Promise<FeedPost[]> => {
      const posts: FeedPost[] = [];
      const eventIds: string[] = [];

      try {
        const labRelay = nostr.relay(LAB_RELAY_URL);
        
        const tribeEvents = await labRelay.query([
          { kinds: [11, 12], limit: limit },
        ]);

        for (const event of tribeEvents) {
          const tribeName = event.tags.find(([name]) => name === 'h')?.[1];
          
          posts.push({
            event,
            isPrivate: true,
            tribeName: tribeName ? formatTribeName(tribeName) : 'Private Tribe',
            source: 'lab',
            stats: { ...emptyStats },
          });
          eventIds.push(event.id);
        }
      } catch (error) {
        console.warn('[Feed] Failed to fetch tribe posts:', error);
      }

      // Fetch stats from LaB relay for tribe posts
      // (These are internal so we query the private relay)
      try {
        const labRelay = nostr.relay(LAB_RELAY_URL);
        
        for (const chunk of chunkArray(eventIds, 20)) {
          const reactions = await labRelay.query([
            { kinds: [7], '#e': chunk, limit: 200 },
            { kinds: [9735], '#e': chunk, limit: 100 },
          ]);
          
          for (const reaction of reactions) {
            const targetId = reaction.tags.find(([n]) => n === 'e')?.[1];
            const post = posts.find(p => p.event.id === targetId);
            if (!post) continue;
            
            if (reaction.kind === 7) {
              post.stats.likes++;
              if (user?.pubkey && reaction.pubkey === user.pubkey) {
                post.userLiked = true;
              }
            } else if (reaction.kind === 9735) {
              post.stats.zaps++;
              const bolt11 = reaction.tags.find(([n]) => n === 'bolt11')?.[1];
              if (bolt11) {
                post.stats.satsZapped += parseBolt11Amount(bolt11);
              }
            }
          }
        }
      } catch (error) {
        console.warn('[Feed] Failed to fetch tribe stats:', error);
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
 * Shows latest posts from people you follow
 */
export function useFollowingPosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { data: follows = [], isLoading: followsLoading } = useFollowList();

  return useQuery({
    queryKey: ['following-posts', user?.pubkey, follows.length, limit],
    queryFn: async (): Promise<FeedPost[]> => {
      const posts: FeedPost[] = [];
      const seenIds = new Set<string>();

      if (follows.length === 0) {
        console.log('[Feed] No follows to fetch posts from');
        return posts;
      }

      console.log(`[Feed] Fetching posts from ${follows.length} follows`);

      try {
        // Use multiple relays for better coverage
        const relayGroup = nostr.group([
          'wss://relay.primal.net',
          'wss://relay.damus.io', 
          'wss://nos.lol',
          'wss://relay.nostr.band',
        ]);
        
        // Query latest posts from followed users
        const publicEvents = await relayGroup.query([
          {
            kinds: [1],
            authors: follows.slice(0, 500), // More authors
            limit: limit * 3, // Get more to account for deduplication
          },
        ]);

        console.log(`[Feed] Received ${publicEvents.length} events from relays`);

        for (const event of publicEvents) {
          // Skip duplicates
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
        console.warn('[Feed] Failed to fetch following posts:', error);
      }

      // Sort by timestamp (newest first) and limit
      posts.sort((a, b) => b.event.created_at - a.event.created_at);
      console.log(`[Feed] Returning ${Math.min(posts.length, limit)} posts`);
      return posts.slice(0, limit);
    },
    enabled: !!user && !followsLoading && follows.length > 0,
    staleTime: 30000,
  });
}

/**
 * Fetch trending/popular posts with stats
 */
export function useTrendingPosts(limit: number = 50) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['trending-posts', limit],
    queryFn: async (): Promise<FeedPost[]> => {
      const posts: FeedPost[] = [];
      const eventIds: string[] = [];

      try {
        // Use Primal relay for trending content
        const primalRelay = nostr.relay('wss://relay.primal.net');
        
        const trendingEvents = await primalRelay.query([
          { kinds: [1], limit: limit },
        ]);

        for (const event of trendingEvents) {
          posts.push({
            event,
            isPrivate: false,
            source: 'trending',
            stats: { ...emptyStats },
          });
          eventIds.push(event.id);
        }
      } catch (error) {
        console.warn('[Feed] Failed to fetch trending posts:', error);
      }

      // Fetch engagement stats
      const statsMap = await fetchEngagementStats(nostr, eventIds, user?.pubkey);
      for (const post of posts) {
        const statsEntry = statsMap.get(post.event.id);
        if (statsEntry) {
          post.stats = statsEntry.stats;
          post.userLiked = statsEntry.userLiked;
          post.userReposted = statsEntry.userReposted;
          post.userZapped = statsEntry.userZapped;
        }
      }

      // Sort by engagement (sats zapped + likes) for trending
      posts.sort((a, b) => {
        const scoreA = a.stats.satsZapped + (a.stats.likes * 100) + (a.stats.reposts * 500);
        const scoreB = b.stats.satsZapped + (b.stats.likes * 100) + (b.stats.reposts * 500);
        return scoreB - scoreA;
      });
      
      return posts.slice(0, limit);
    },
    enabled: !!user,
    staleTime: 60000,
  });
}

/**
 * @deprecated Use useFollowingPosts instead
 */
export function usePublicPosts(limit: number = 50) {
  return useFollowingPosts(limit);
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
