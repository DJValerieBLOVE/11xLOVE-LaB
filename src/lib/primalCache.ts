/**
 * Primal Cache Client
 * 
 * Connects to Primal's caching WebSocket server for fast feed loading.
 * Based on Primal's implementation: https://github.com/PrimalHQ/primal-web-app
 * 
 * Key endpoints:
 * - "feed": User's following feed (pass pubkey)
 * - "mega_feed_directive": Custom feeds (pass spec JSON)
 * - "events": Get specific events with stats
 * - "user_infos": Get user profiles
 * 
 * The cache server returns all data in one response:
 * - Kind 0: User profiles
 * - Kind 1: Notes
 * - Kind 10000100: Note stats (likes, reposts, replies, zaps)
 * - Kind 10000113: Feed range/pagination
 * - Kind 10000115: User actions (did I like/repost/zap this?)
 */

import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';

// Primal cache server
const PRIMAL_CACHE_URL = 'wss://cache.primal.net/v1';

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

/** Result from fetching feed */
export interface PrimalFeedResult {
  notes: NostrEvent[];
  profiles: Map<string, NostrMetadata>;
  stats: Map<string, PrimalNoteStats>;
  actions: Map<string, PrimalNoteActions>;
  paging: { since: number; until: number };
}

// Reuse WebSocket connections
let sharedWs: WebSocket | null = null;
let wsReady = false;
const pendingRequests = new Map<string, {
  resolve: (result: PrimalFeedResult) => void;
  result: PrimalFeedResult;
  timeout: ReturnType<typeof setTimeout>;
}>();

/**
 * Get or create a shared WebSocket connection
 */
function getWebSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    if (sharedWs && wsReady && sharedWs.readyState === WebSocket.OPEN) {
      resolve(sharedWs);
      return;
    }
    
    // Close old connection if exists
    if (sharedWs) {
      try { sharedWs.close(); } catch { /* ignore */ }
    }
    
    const ws = new WebSocket(PRIMAL_CACHE_URL);
    sharedWs = ws;
    wsReady = false;
    
    const connectTimeout = setTimeout(() => {
      reject(new Error('WebSocket connection timeout'));
      ws.close();
    }, 5000);
    
    ws.onopen = () => {
      clearTimeout(connectTimeout);
      wsReady = true;
      resolve(ws);
    };
    
    ws.onerror = () => {
      clearTimeout(connectTimeout);
      wsReady = false;
      reject(new Error('WebSocket connection error'));
    };
    
    ws.onclose = () => {
      wsReady = false;
      sharedWs = null;
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const [type, subId, content] = data;
        
        const request = pendingRequests.get(subId);
        if (!request) return;
        
        if (type === 'EVENT' && content) {
          processEvent(content, request.result);
        } else if (type === 'EVENTS' && Array.isArray(content)) {
          for (const item of content) {
            processEvent(item, request.result);
          }
        } else if (type === 'EOSE') {
          clearTimeout(request.timeout);
          pendingRequests.delete(subId);
          request.resolve(request.result);
        }
      } catch {
        // Ignore parse errors
      }
    };
  });
}

/**
 * Send a request to Primal cache and wait for response
 */
async function sendRequest(
  subId: string,
  cacheMethod: string,
  payload: Record<string, unknown>,
  timeoutMs: number = 10000,
  signal?: AbortSignal
): Promise<PrimalFeedResult> {
  const result: PrimalFeedResult = {
    notes: [],
    profiles: new Map(),
    stats: new Map(),
    actions: new Map(),
    paging: { since: 0, until: 0 },
  };
  
  return new Promise(async (resolve) => {
    // Handle abort
    if (signal?.aborted) {
      resolve(result);
      return;
    }
    
    signal?.addEventListener('abort', () => {
      const request = pendingRequests.get(subId);
      if (request) {
        clearTimeout(request.timeout);
        pendingRequests.delete(subId);
        resolve(result);
      }
    });
    
    try {
      const ws = await getWebSocket();
      
      const timeout = setTimeout(() => {
        pendingRequests.delete(subId);
        resolve(result);
      }, timeoutMs);
      
      pendingRequests.set(subId, { resolve, result, timeout });
      
      const message = JSON.stringify([
        'REQ',
        subId,
        { cache: [cacheMethod, payload] },
      ]);
      
      ws.send(message);
    } catch (error) {
      console.warn('[PrimalCache] Connection error:', error);
      resolve(result);
    }
  });
}

/**
 * Process an event from Primal cache
 */
function processEvent(event: Record<string, unknown>, result: PrimalFeedResult) {
  const kind = event.kind as number;
  
  // Kind 0: Profile metadata
  if (kind === 0) {
    try {
      const pubkey = event.pubkey as string;
      const metadata = JSON.parse(event.content as string) as NostrMetadata;
      result.profiles.set(pubkey, metadata);
    } catch { /* ignore */ }
  }
  // Kind 1: Notes
  else if (kind === 1) {
    result.notes.push(event as unknown as NostrEvent);
  }
  // Kind 6: Reposts
  else if (kind === 6) {
    result.notes.push(event as unknown as NostrEvent);
  }
  // Kind 10000100: Note stats
  else if (kind === 10000100) {
    try {
      const stats = JSON.parse(event.content as string) as PrimalNoteStats;
      result.stats.set(stats.event_id, stats);
    } catch { /* ignore */ }
  }
  // Kind 10000113: Feed range/paging
  else if (kind === 10000113) {
    try {
      const range = JSON.parse(event.content as string) as { since: number; until: number };
      result.paging = range;
    } catch { /* ignore */ }
  }
  // Kind 10000115: User actions
  else if (kind === 10000115) {
    try {
      const actions = JSON.parse(event.content as string) as PrimalNoteActions;
      result.actions.set(actions.event_id, actions);
    } catch { /* ignore */ }
  }
}

/**
 * Fetch user's following feed from Primal's cache server
 * This is the most common feed type - posts from people the user follows
 */
export async function fetchPrimalNetworkFeed(
  userPubkey: string,
  limit: number = 30,
  until?: number,
  signal?: AbortSignal
): Promise<PrimalFeedResult> {
  const subId = `feed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  // Use current timestamp if not specified
  const timestamp = until || Math.ceil(Date.now() / 1000);
  
  const payload: Record<string, unknown> = {
    pubkey: userPubkey,
    user_pubkey: userPubkey,
    limit,
    until: timestamp,
  };
  
  return sendRequest(subId, 'feed', payload, 10000, signal);
}

/**
 * Fetch latest posts (for checking new posts)
 */
export async function fetchPrimalFutureFeed(
  userPubkey: string,
  since: number,
  signal?: AbortSignal
): Promise<PrimalFeedResult> {
  const subId = `future_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  const payload: Record<string, unknown> = {
    pubkey: userPubkey,
    user_pubkey: userPubkey,
    since,
    limit: 100,
  };
  
  return sendRequest(subId, 'feed', payload, 5000, signal);
}

/**
 * Fetch stats for specific event IDs
 */
export async function fetchPrimalEventStats(
  eventIds: string[],
  userPubkey?: string,
  signal?: AbortSignal
): Promise<{ stats: Map<string, PrimalNoteStats>; actions: Map<string, PrimalNoteActions> }> {
  if (eventIds.length === 0) {
    return { stats: new Map(), actions: new Map() };
  }
  
  const subId = `stats_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  const payload: Record<string, unknown> = {
    event_ids: eventIds.slice(0, 100), // Limit to 100
  };
  
  if (userPubkey) {
    payload.user_pubkey = userPubkey;
  }
  
  const result = await sendRequest(subId, 'events', payload, 8000, signal);
  return { stats: result.stats, actions: result.actions };
}

/**
 * Fetch user profiles from Primal cache
 */
export async function fetchPrimalProfiles(
  pubkeys: string[],
  signal?: AbortSignal
): Promise<Map<string, NostrMetadata>> {
  if (pubkeys.length === 0) {
    return new Map();
  }
  
  const subId = `profiles_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  const payload = {
    pubkeys: [...new Set(pubkeys)].slice(0, 100), // Dedupe and limit
  };
  
  const result = await sendRequest(subId, 'user_infos', payload, 6000, signal);
  return result.profiles;
}

/**
 * Close shared WebSocket (call on unmount if needed)
 */
export function closePrimalConnection() {
  if (sharedWs) {
    try { sharedWs.close(); } catch { /* ignore */ }
    sharedWs = null;
    wsReady = false;
  }
}
