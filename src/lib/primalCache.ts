/**
 * Primal Cache Client
 * 
 * Connects to Primal's caching WebSocket server for fast feed loading.
 * Based on Primal's implementation: https://github.com/PrimalHQ/primal-web-app
 * 
 * CRITICAL: Primal uses zlib compression! Must decompress responses with pako.
 * 
 * Protocol:
 * 1. Connect to wss://cache.primal.net/v1
 * 2. Set binary type to 'arraybuffer'
 * 3. First message: Enable compression {"cache": ["set_primal_protocol", {"compression": "zlib"}]}
 * 4. All subsequent responses are compressed with zlib
 * 5. Decompress with pako.inflate(data, {to: 'string'})
 */

import pako from 'pako';
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

// Connection state
let ws: WebSocket | null = null;
let isConnected = false;
let isProtocolSet = false;
let connectPromise: Promise<WebSocket> | null = null;

// Request tracking
interface PendingRequest {
  resolve: (result: PrimalFeedResult) => void;
  result: PrimalFeedResult;
  timeout: ReturnType<typeof setTimeout>;
}
const pendingRequests = new Map<string, PendingRequest>();

/**
 * Decompress zlib data from Primal
 */
function decompressData(data: ArrayBuffer): string {
  try {
    return pako.inflate(new Uint8Array(data), { to: 'string' });
  } catch (e) {
    console.error('[Primal] Decompression failed:', e);
    return '{}';
  }
}

/**
 * Parse message data (handles both compressed binary and plain text)
 */
async function parseMessage(data: ArrayBuffer | string): Promise<unknown[]> {
  let jsonStr: string;
  
  if (typeof data === 'string') {
    jsonStr = data;
  } else {
    // Binary data - needs decompression
    jsonStr = decompressData(data);
  }
  
  try {
    return JSON.parse(jsonStr);
  } catch {
    console.error('[Primal] JSON parse failed:', jsonStr.slice(0, 100));
    return [];
  }
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
 * Handle incoming WebSocket message
 */
async function handleMessage(event: MessageEvent) {
  const data = await parseMessage(event.data);
  if (data.length < 2) return;
  
  const [type, subId, content] = data;
  
  // Check if this is for a pending request
  const request = pendingRequests.get(subId as string);
  if (!request) return;
  
  if (type === 'EVENT' && content) {
    processEvent(content as Record<string, unknown>, request.result);
  } else if (type === 'EVENTS' && Array.isArray(content)) {
    // EVENTS contains array of events
    for (const item of content) {
      processEvent(item as Record<string, unknown>, request.result);
    }
  } else if (type === 'EOSE') {
    // End of stream - resolve the request
    clearTimeout(request.timeout);
    pendingRequests.delete(subId as string);
    console.log(`[Primal] ${subId}: Got ${request.result.notes.length} notes, ${request.result.profiles.size} profiles, ${request.result.stats.size} stats`);
    request.resolve(request.result);
  }
}

/**
 * Connect to Primal cache server with compression enabled
 */
function connect(): Promise<WebSocket> {
  if (connectPromise) return connectPromise;
  
  connectPromise = new Promise((resolve, reject) => {
    console.log('[Primal] Connecting to', PRIMAL_CACHE_URL);
    
    const socket = new WebSocket(PRIMAL_CACHE_URL);
    socket.binaryType = 'arraybuffer'; // Required for zlib compression
    
    const connectTimeout = setTimeout(() => {
      reject(new Error('Connection timeout'));
      socket.close();
    }, 10000);
    
    socket.onopen = () => {
      console.log('[Primal] Connected, enabling compression...');
      clearTimeout(connectTimeout);
      ws = socket;
      
      // Set up message handler
      socket.onmessage = handleMessage;
      
      // Enable zlib compression (like Primal does)
      const protocolSubId = `protocol_${Date.now()}`;
      
      // Listen for EOSE on protocol setup
      const protocolListener = async (event: MessageEvent) => {
        const data = await parseMessage(event.data);
        if (data[0] === 'EOSE' && data[1] === protocolSubId) {
          console.log('[Primal] Compression enabled');
          isProtocolSet = true;
          isConnected = true;
          resolve(socket);
        }
      };
      socket.addEventListener('message', protocolListener);
      
      // Send protocol setup request
      socket.send(JSON.stringify([
        'REQ',
        protocolSubId,
        { cache: ['set_primal_protocol', { compression: 'zlib' }] }
      ]));
    };
    
    socket.onerror = (err) => {
      console.error('[Primal] Connection error:', err);
      clearTimeout(connectTimeout);
      connectPromise = null;
      reject(new Error('Connection failed'));
    };
    
    socket.onclose = () => {
      console.log('[Primal] Connection closed');
      isConnected = false;
      isProtocolSet = false;
      ws = null;
      connectPromise = null;
    };
  });
  
  return connectPromise;
}

/**
 * Send a request and wait for response
 */
async function sendRequest(
  cacheMethod: string,
  payload: Record<string, unknown>,
  timeoutMs: number = 15000,
  signal?: AbortSignal
): Promise<PrimalFeedResult> {
  const result: PrimalFeedResult = {
    notes: [],
    profiles: new Map(),
    stats: new Map(),
    actions: new Map(),
    paging: { since: 0, until: 0 },
  };
  
  if (signal?.aborted) return result;
  
  const subId = `${cacheMethod}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  
  return new Promise(async (resolve) => {
    // Handle abort
    const abortHandler = () => {
      const req = pendingRequests.get(subId);
      if (req) {
        clearTimeout(req.timeout);
        pendingRequests.delete(subId);
        resolve(result);
      }
    };
    signal?.addEventListener('abort', abortHandler);
    
    try {
      const socket = await connect();
      
      // Set up timeout
      const timeout = setTimeout(() => {
        console.warn(`[Primal] Request ${subId} timed out`);
        pendingRequests.delete(subId);
        signal?.removeEventListener('abort', abortHandler);
        resolve(result);
      }, timeoutMs);
      
      // Register request
      pendingRequests.set(subId, { resolve: (r) => {
        signal?.removeEventListener('abort', abortHandler);
        resolve(r);
      }, result, timeout });
      
      // Send request
      const message = JSON.stringify([
        'REQ',
        subId,
        { cache: [cacheMethod, payload] }
      ]);
      console.log(`[Primal] Sending ${cacheMethod} request:`, subId);
      socket.send(message);
      
    } catch (error) {
      console.error('[Primal] Request failed:', error);
      signal?.removeEventListener('abort', abortHandler);
      resolve(result);
    }
  });
}

/**
 * Fetch user's following feed from Primal's cache server
 */
export async function fetchPrimalNetworkFeed(
  userPubkey: string,
  limit: number = 30,
  until?: number,
  signal?: AbortSignal
): Promise<PrimalFeedResult> {
  const timestamp = until || Math.ceil(Date.now() / 1000);
  
  console.log(`[Primal] Fetching feed for ${userPubkey.slice(0, 8)}... limit=${limit} until=${timestamp}`);
  
  return sendRequest('feed', {
    pubkey: userPubkey,
    user_pubkey: userPubkey,
    limit,
    until: timestamp,
  }, 15000, signal);
}

/**
 * Fetch latest posts (for checking new posts)
 */
export async function fetchPrimalFutureFeed(
  userPubkey: string,
  since: number,
  signal?: AbortSignal
): Promise<PrimalFeedResult> {
  return sendRequest('feed', {
    pubkey: userPubkey,
    user_pubkey: userPubkey,
    since,
    limit: 100,
  }, 8000, signal);
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
  
  const payload: Record<string, unknown> = {
    event_ids: eventIds.slice(0, 100),
  };
  if (userPubkey) {
    payload.user_pubkey = userPubkey;
  }
  
  const result = await sendRequest('events', payload, 10000, signal);
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
  
  const result = await sendRequest('user_infos', {
    pubkeys: [...new Set(pubkeys)].slice(0, 100),
  }, 8000, signal);
  
  return result.profiles;
}

/**
 * Close connection (call on app unmount if needed)
 */
export function closePrimalConnection() {
  if (ws) {
    ws.close();
    ws = null;
  }
  isConnected = false;
  isProtocolSet = false;
  connectPromise = null;
  pendingRequests.clear();
}
