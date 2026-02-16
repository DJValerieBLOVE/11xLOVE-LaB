/**
 * Primal Cache Client - Simple Version
 * 
 * Simple WebSocket client for Primal's cache server.
 * Each request creates a new connection for reliability.
 * 
 * Primal uses zlib compression after protocol setup.
 */

import pako from 'pako';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';

const PRIMAL_CACHE_URL = 'wss://cache.primal.net/v1';

/**
 * Primal Custom Kind Numbers
 * From: https://github.com/PrimalHQ/primal-web-app/blob/main/src/constants.ts
 */
export const PrimalKind = {
  NoteStats: 10_000_100,        // likes, reposts, replies, zaps, satszapped
  NetStats: 10_000_101,         // network stats
  LegendStats: 10_000_102,      // legend stats
  UserStats: 10_000_105,        // follower counts
  OldestEvent: 10_000_106,      // oldest event
  Mentions: 10_000_107,         // mentions info
  UserScore: 10_000_108,        // user score
  Notification: 10_000_110,     // notifications
  Timestamp: 10_000_111,        // timestamp
  NotificationStats: 10_000_112, // notification counts
  FeedRange: 10_000_113,        // pagination info (since, until, order_by)
  NoteActions: 10_000_115,      // user actions (liked, reposted, zapped)
  MessageStats: 10_000_117,     // message stats
  MessagePerSenderStats: 10_000_118, // message per sender stats
  MediaInfo: 10_000_119,        // image dimensions, thumbnails
  Upload: 10_000_120,           // upload info
  Uploaded: 10_000_121,         // uploaded status
  Releases: 10_000_124,         // releases
  ImportResponse: 10_000_127,   // import response
  LinkMetadata: 10_000_128,     // og:title, og:description, og:image
  EventZapInfo: 10_000_129,     // zap info for events
  FilteringReason: 10_000_131,  // content filtering reason
  UserFollowerCounts: 10_000_133, // follower counts
  SuggestedUsers: 10_000_134,   // suggested users
  UploadChunk: 10_000_135,      // upload chunk
  UserRelays: 10_000_139,       // user relays
  RelayHint: 10_000_141,        // relay hints for events
  NoteQuoteStats: 10_000_143,   // quote stats
  WordCount: 10_000_144,        // word count
  FeaturedAuthors: 10_000_148,  // featured authors
  DVMFollowsActions: 10_000_156, // DVM follows actions
  UserFollowerIncrease: 10_000_157, // follower increase
  VerifiedUsersDict: 10_000_158, // verified users dictionary
  DVMMetadata: 10_000_159,      // DVM metadata
  NoteTopicStat: 10_000_160,    // topic stats
  MediaStats: 10_000_163,       // media stats
  MediaList: 10_000_164,        // media list
  ContentStats: 10_000_166,     // content stats
  BroadcastStatus: 10_000_167,  // broadcast status
  LegendCustomization: 10_000_168, // legend customization
  MembershipCohortInfo: 10_000_169, // membership info
  LegendLeaderboard: 10_000_170, // legend leaderboard
  PremiumLeaderboard: 10_000_171, // premium leaderboard
  ArticlesStats: 10_000_174,    // articles stats
  LiveEventStats: 10_000_176,   // live event stats
} as const;

/** Stats for a note from Primal */
export interface PrimalNoteStats {
  event_id: string;
  likes: number;
  replies: number;
  reposts: number;
  zaps: number;
  satszapped: number;
  score: number;
  score24h: number;
}

/** User's actions on a note */
export interface PrimalNoteActions {
  event_id: string;
  liked: boolean;
  replied: boolean;
  reposted: boolean;
  zapped: boolean;
}

/** Link metadata from Primal (kind 10000128) */
export interface PrimalLinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  icon_url?: string;
  md_title?: string;
  md_description?: string;
  md_image?: string;
}

/** Media info from Primal (kind 10000119) */
export interface PrimalMediaInfo {
  event_id: string;
  resources?: Array<{
    url: string;
    variants?: Array<{
      w: number;
      h: number;
      s: string; // small/medium/large
      a: number; // aspect ratio
      media_url: string;
    }>;
  }>;
}

/** Result from fetching feed */
export interface PrimalFeedResult {
  notes: NostrEvent[];
  profiles: Map<string, NostrMetadata>;
  stats: Map<string, PrimalNoteStats>;
  actions: Map<string, PrimalNoteActions>;
  linkPreviews: Map<string, PrimalLinkMetadata>;
  mediaInfo: Map<string, PrimalMediaInfo>;
}

/**
 * Decompress zlib data
 */
function decompress(data: ArrayBuffer): string {
  try {
    return pako.inflate(new Uint8Array(data), { to: 'string' });
  } catch (e) {
    console.warn('[Primal] Decompress failed, trying as string');
    return '';
  }
}

/**
 * Make a single request to Primal cache
 */
async function primalRequest(
  method: string,
  payload: Record<string, unknown>,
  timeoutMs: number = 15000
): Promise<PrimalFeedResult> {
  return new Promise((resolve) => {
    const result: PrimalFeedResult = {
      notes: [],
      profiles: new Map(),
      stats: new Map(),
      actions: new Map(),
      linkPreviews: new Map(),
      mediaInfo: new Map(),
    };
    
    const subId = `${method}_${Date.now()}`;
    let ws: WebSocket | null = null;
    let compressionEnabled = false;
    let resolved = false;
    
    const cleanup = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
    
    const finish = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      console.log(`[Primal] ${method}: ${result.notes.length} notes, ${result.profiles.size} profiles, ${result.stats.size} stats`);
      resolve(result);
    };
    
    // Timeout
    const timeout = setTimeout(() => {
      console.warn(`[Primal] ${method} timed out after ${timeoutMs}ms`);
      finish();
    }, timeoutMs);
    
    try {
      ws = new WebSocket(PRIMAL_CACHE_URL);
      ws.binaryType = 'arraybuffer';
      
      ws.onopen = () => {
        // First enable compression
        const protocolId = `protocol_${Date.now()}`;
        ws?.send(JSON.stringify([
          'REQ', protocolId,
          { cache: ['set_primal_protocol', { compression: 'zlib' }] }
        ]));
      };
      
      ws.onmessage = async (event) => {
        let jsonStr: string;
        
        if (event.data instanceof ArrayBuffer) {
          if (compressionEnabled) {
            jsonStr = decompress(event.data);
          } else {
            // First message might be uncompressed
            try {
              const decoder = new TextDecoder();
              jsonStr = decoder.decode(event.data);
            } catch {
              jsonStr = decompress(event.data);
            }
          }
        } else {
          jsonStr = event.data;
        }
        
        if (!jsonStr) return;
        
        // Compressed responses may contain multiple JSON messages separated by newlines
        const messages = jsonStr.split('\n').filter(s => s.trim());
        
        for (const msg of messages) {
          try {
            const data = JSON.parse(msg);
            const [type, msgSubId, content] = data;
            
            // Check for protocol EOSE
            if (type === 'EOSE' && msgSubId?.startsWith('protocol_')) {
              compressionEnabled = true;
              
              // Now send the actual request
              ws?.send(JSON.stringify([
                'REQ', subId,
                { cache: [method, payload] }
              ]));
              continue;
            }
            
            // Only process our request
            if (msgSubId !== subId) continue;
            
            if (type === 'EVENT' && content) {
              processEvent(content, result);
            } else if (type === 'EVENTS' && Array.isArray(content)) {
              for (const item of content) {
                processEvent(item, result);
              }
            } else if (type === 'EOSE') {
              clearTimeout(timeout);
              finish();
              return; // Stop processing further messages after EOSE
            }
          } catch (e) {
            console.warn('[Primal] Parse error:', e);
          }
        }
      };
      
      ws.onerror = (e) => {
        console.error('[Primal] WebSocket error:', e);
        clearTimeout(timeout);
        finish();
      };
      
      ws.onclose = () => {
        clearTimeout(timeout);
        if (!resolved) finish();
      };
      
    } catch (e) {
      console.error('[Primal] Connection error:', e);
      clearTimeout(timeout);
      finish();
    }
  });
}

/**
 * Process an event from Primal
 * Events might come as objects or as JSON strings
 */
function processEvent(eventData: unknown, result: PrimalFeedResult) {
  // Handle case where event is a JSON string
  let event: Record<string, unknown>;
  if (typeof eventData === 'string') {
    try {
      event = JSON.parse(eventData);
    } catch {
      console.warn('[Primal] Failed to parse event string:', eventData.slice(0, 100));
      return;
    }
  } else if (typeof eventData === 'object' && eventData !== null) {
    event = eventData as Record<string, unknown>;
  } else {
    return;
  }
  
  const kind = event.kind as number;
  
  // Standard Nostr kinds
  if (kind === 0) {
    // Profile
    try {
      const pubkey = event.pubkey as string;
      const content = event.content as string;
      const metadata = JSON.parse(content) as NostrMetadata;
      result.profiles.set(pubkey, metadata);
    } catch { /* ignore */ }
  } else if (kind === 1 || kind === 6) {
    // Note or repost - ensure it's a proper object
    result.notes.push(event as unknown as NostrEvent);
  } 
  // Primal custom kinds
  else if (kind === PrimalKind.NoteStats) {
    // Stats from Primal (10000100)
    try {
      const content = event.content as string;
      const stats = JSON.parse(content) as PrimalNoteStats;
      if (stats.event_id) {
        result.stats.set(stats.event_id, stats);
      }
    } catch { /* ignore */ }
  } else if (kind === PrimalKind.NoteActions) {
    // User actions from Primal (10000115)
    try {
      const content = event.content as string;
      const actions = JSON.parse(content) as PrimalNoteActions;
      if (actions.event_id) {
        result.actions.set(actions.event_id, actions);
      }
    } catch { /* ignore */ }
  } else if (kind === PrimalKind.LinkMetadata) {
    // Link previews (10000128)
    try {
      const content = event.content as string;
      const linkData = JSON.parse(content) as PrimalLinkMetadata;
      if (linkData.url) {
        result.linkPreviews.set(linkData.url, linkData);
      }
    } catch { /* ignore */ }
  } else if (kind === PrimalKind.MediaInfo) {
    // Media info (10000119) - image dimensions, variants
    try {
      const content = event.content as string;
      const mediaData = JSON.parse(content) as PrimalMediaInfo;
      if (mediaData.event_id) {
        result.mediaInfo.set(mediaData.event_id, mediaData);
      }
    } catch { /* ignore */ }
  }
  // All other Primal-specific kinds (pagination, mentions, scores, etc.)
  // are silently ignored - they provide supplementary data we don't need
  else {
    // No-op: silently ignore known and unknown supplementary kinds
  }
}

/**
 * Fetch user's following feed
 */
export async function fetchPrimalNetworkFeed(
  userPubkey: string,
  limit: number = 30,
  until?: number,
  signal?: AbortSignal
): Promise<PrimalFeedResult> {
  if (signal?.aborted) {
    return { notes: [], profiles: new Map(), stats: new Map(), actions: new Map(), linkPreviews: new Map(), mediaInfo: new Map() };
  }
  
  const timestamp = until ?? Math.ceil(Date.now() / 1000);
  
  console.log(`[Primal] Fetching feed for ${userPubkey.slice(0, 8)} with limit ${limit}, until ${timestamp}...`);
  
  const result = await primalRequest('feed', {
    pubkey: userPubkey,
    user_pubkey: userPubkey,
    limit,
    until: timestamp,
    include_replies: true,
  });
  
  // Always fetch stats separately for reliable results
  // Primal's feed endpoint sometimes includes stats, sometimes doesn't
  if (result.notes.length > 0) {
    console.log(`[Primal] Feed: ${result.notes.length} notes, ${result.stats.size} inline stats`);
    
    // Get event IDs that are missing stats
    const noteIds = result.notes.map(n => n.id);
    // For kind 6 reposts, also get the inner event's ID
    const repostInnerIds: string[] = [];
    for (const note of result.notes) {
      if (note.kind === 6 && note.content) {
        try {
          const inner = JSON.parse(note.content);
          if (inner.id) repostInnerIds.push(inner.id);
        } catch { /* ignore */ }
      }
    }
    
    const allIds = [...new Set([...noteIds, ...repostInnerIds])];
    const missingIds = allIds.filter(id => !result.stats.has(id));
    
    if (missingIds.length > 0) {
      console.log(`[Primal] Fetching stats for ${missingIds.length} posts...`);
      try {
        const statsResult = await fetchPrimalEventStats(missingIds, userPubkey, signal);
        
        // Merge stats into result
        for (const [id, stats] of statsResult.stats) {
          result.stats.set(id, stats);
        }
        for (const [id, actions] of statsResult.actions) {
          result.actions.set(id, actions);
        }
        console.log(`[Primal] Total stats: ${result.stats.size}, actions: ${result.actions.size}`);
      } catch (err) {
        console.warn('[Primal] Stats fetch failed:', err);
      }
    }
  }
  
  return result;
}

/**
 * Fetch latest posts since timestamp
 */
export async function fetchPrimalFutureFeed(
  userPubkey: string,
  since: number,
  signal?: AbortSignal
): Promise<PrimalFeedResult> {
  if (signal?.aborted) {
    return { notes: [], profiles: new Map(), stats: new Map(), actions: new Map(), linkPreviews: new Map(), mediaInfo: new Map() };
  }
  
  return primalRequest('feed', {
    pubkey: userPubkey,
    user_pubkey: userPubkey,
    since,
    limit: 100,
  }, 8000);
}

/**
 * Fetch stats for specific events
 */
export async function fetchPrimalEventStats(
  eventIds: string[],
  userPubkey?: string,
  signal?: AbortSignal
): Promise<{ stats: Map<string, PrimalNoteStats>; actions: Map<string, PrimalNoteActions> }> {
  if (signal?.aborted || eventIds.length === 0) {
    return { stats: new Map(), actions: new Map() };
  }
  
  const payload: Record<string, unknown> = {
    event_ids: eventIds.slice(0, 100),
    extended_response: true,
  };
  if (userPubkey) {
    payload.user_pubkey = userPubkey;
  }
  
  // Use events method with extended_response to get stats + actions
  const result = await primalRequest('events', payload, 10000);
  return { stats: result.stats, actions: result.actions };
}

/**
 * Fetch user profiles
 */
export async function fetchPrimalProfiles(
  pubkeys: string[],
  signal?: AbortSignal
): Promise<Map<string, NostrMetadata>> {
  if (signal?.aborted || pubkeys.length === 0) {
    return new Map();
  }
  
  const result = await primalRequest('user_infos', {
    pubkeys: [...new Set(pubkeys)].slice(0, 100),
  }, 8000);
  
  return result.profiles;
}

// No-op for compatibility
export function closePrimalConnection() {}
