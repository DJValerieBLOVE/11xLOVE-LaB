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
        console.log(`[Primal] Connected, sending ${method} request...`);
        
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
        
        try {
          const data = JSON.parse(jsonStr);
          const [type, msgSubId, content] = data;
          
          // Check for protocol EOSE
          if (type === 'EOSE' && msgSubId?.startsWith('protocol_')) {
            compressionEnabled = true;
            console.log('[Primal] Compression enabled, sending actual request...');
            
            // Now send the actual request
            ws?.send(JSON.stringify([
              'REQ', subId,
              { cache: [method, payload] }
            ]));
            return;
          }
          
          // Only process our request
          if (msgSubId !== subId) return;
          
          if (type === 'EVENT' && content) {
            processEvent(content, result);
          } else if (type === 'EVENTS' && Array.isArray(content)) {
            for (const item of content) {
              processEvent(item, result);
            }
          } else if (type === 'EOSE') {
            clearTimeout(timeout);
            finish();
          }
        } catch (e) {
          console.warn('[Primal] Parse error:', e);
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
  } else if (kind === 10000100) {
    // Stats
    try {
      const content = event.content as string;
      const stats = JSON.parse(content) as PrimalNoteStats;
      result.stats.set(stats.event_id, stats);
    } catch { /* ignore */ }
  } else if (kind === 10000115) {
    // User actions
    try {
      const content = event.content as string;
      const actions = JSON.parse(content) as PrimalNoteActions;
      result.actions.set(actions.event_id, actions);
    } catch { /* ignore */ }
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
    return { notes: [], profiles: new Map(), stats: new Map(), actions: new Map() };
  }
  
  const timestamp = until || Math.floor(Date.now() / 1000);
  
  console.log(`[Primal] Fetching feed for ${userPubkey.slice(0, 8)}...`);
  
  return primalRequest('feed', {
    pubkey: userPubkey,
    user_pubkey: userPubkey,
    limit,
    until: timestamp,
  });
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
    return { notes: [], profiles: new Map(), stats: new Map(), actions: new Map() };
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
  };
  if (userPubkey) {
    payload.user_pubkey = userPubkey;
  }
  
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
