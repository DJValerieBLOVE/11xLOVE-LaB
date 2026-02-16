/**
 * Primal Cache Client
 * 
 * Connects to Primal's caching WebSocket server for fast feed loading.
 * Based on Primal's implementation: https://github.com/PrimalHQ/primal-web-app
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
}

/**
 * Fetch user's following feed from Primal's cache server
 * This returns notes from people the user follows, with all stats included
 */
export async function fetchPrimalNetworkFeed(
  userPubkey: string,
  limit: number = 30,
  until?: number,
  signal?: AbortSignal
): Promise<PrimalFeedResult> {
  return new Promise((resolve) => {
    const result: PrimalFeedResult = {
      notes: [],
      profiles: new Map(),
      stats: new Map(),
      actions: new Map(),
    };
    
    const subId = `feed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let ws: WebSocket | null = null;
    let resolved = false;
    
    // Timeout after 15 seconds
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ws?.close();
        resolve(result);
      }
    }, 15000);
    
    // Handle abort signal
    signal?.addEventListener('abort', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        ws?.close();
        resolve(result);
      }
    });
    
    try {
      ws = new WebSocket(PRIMAL_CACHE_URL);
      
      ws.onopen = () => {
        // Build the feed request
        const payload: Record<string, unknown> = {
          pubkey: userPubkey,
          user_pubkey: userPubkey,
          limit,
        };
        
        if (until && until > 0) {
          payload.until = until;
        }
        
        // Send the request
        const message = JSON.stringify([
          'REQ',
          subId,
          { cache: ['feed', payload] },
        ]);
        
        ws?.send(message);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const [type, responseSubId, content] = data;
          
          if (responseSubId !== subId) return;
          
          if (type === 'EVENT' && content) {
            processEvent(content, result);
          } else if (type === 'EVENTS' && Array.isArray(content)) {
            for (const item of content) {
              processEvent(item, result);
            }
          } else if (type === 'EOSE') {
            // End of stream - resolve
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              ws?.close();
              resolve(result);
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      };
      
      ws.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(result);
        }
      };
      
      ws.onclose = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(result);
        }
      };
      
    } catch (e) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(result);
      }
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
    } catch {
      // Ignore
    }
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
    } catch {
      // Ignore
    }
  }
  // Kind 10000115: User actions
  else if (kind === 10000115) {
    try {
      const actions = JSON.parse(event.content as string) as PrimalNoteActions;
      result.actions.set(actions.event_id, actions);
    } catch {
      // Ignore
    }
  }
}

/**
 * Fetch stats for specific event IDs
 */
export async function fetchPrimalEventStats(
  eventIds: string[],
  userPubkey?: string,
  signal?: AbortSignal
): Promise<{ stats: Map<string, PrimalNoteStats>; actions: Map<string, PrimalNoteActions> }> {
  return new Promise((resolve) => {
    const result = {
      stats: new Map<string, PrimalNoteStats>(),
      actions: new Map<string, PrimalNoteActions>(),
    };
    
    if (eventIds.length === 0) {
      resolve(result);
      return;
    }
    
    const subId = `stats_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let ws: WebSocket | null = null;
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ws?.close();
        resolve(result);
      }
    }, 10000);
    
    signal?.addEventListener('abort', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        ws?.close();
        resolve(result);
      }
    });
    
    try {
      ws = new WebSocket(PRIMAL_CACHE_URL);
      
      ws.onopen = () => {
        const payload: Record<string, unknown> = {
          event_ids: eventIds,
        };
        
        if (userPubkey) {
          payload.user_pubkey = userPubkey;
        }
        
        const message = JSON.stringify([
          'REQ',
          subId,
          { cache: ['events', payload] },
        ]);
        
        ws?.send(message);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const [type, responseSubId, content] = data;
          
          if (responseSubId !== subId) return;
          
          if (type === 'EVENT' && content) {
            const kind = content.kind as number;
            
            if (kind === 10000100) {
              try {
                const stats = JSON.parse(content.content as string) as PrimalNoteStats;
                result.stats.set(stats.event_id, stats);
              } catch { /* ignore */ }
            } else if (kind === 10000115) {
              try {
                const actions = JSON.parse(content.content as string) as PrimalNoteActions;
                result.actions.set(actions.event_id, actions);
              } catch { /* ignore */ }
            }
          } else if (type === 'EVENTS' && Array.isArray(content)) {
            for (const item of content) {
              const kind = item.kind as number;
              if (kind === 10000100) {
                try {
                  const stats = JSON.parse(item.content as string) as PrimalNoteStats;
                  result.stats.set(stats.event_id, stats);
                } catch { /* ignore */ }
              } else if (kind === 10000115) {
                try {
                  const actions = JSON.parse(item.content as string) as PrimalNoteActions;
                  result.actions.set(actions.event_id, actions);
                } catch { /* ignore */ }
              }
            }
          } else if (type === 'EOSE') {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              ws?.close();
              resolve(result);
            }
          }
        } catch {
          // Ignore
        }
      };
      
      ws.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(result);
        }
      };
      
      ws.onclose = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(result);
        }
      };
      
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(result);
      }
    }
  });
}

/**
 * Fetch user profiles from Primal cache
 */
export async function fetchPrimalProfiles(
  pubkeys: string[],
  signal?: AbortSignal
): Promise<Map<string, NostrMetadata>> {
  return new Promise((resolve) => {
    const profiles = new Map<string, NostrMetadata>();
    
    if (pubkeys.length === 0) {
      resolve(profiles);
      return;
    }
    
    const subId = `profiles_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let ws: WebSocket | null = null;
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ws?.close();
        resolve(profiles);
      }
    }, 8000);
    
    signal?.addEventListener('abort', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        ws?.close();
        resolve(profiles);
      }
    });
    
    try {
      ws = new WebSocket(PRIMAL_CACHE_URL);
      
      ws.onopen = () => {
        const message = JSON.stringify([
          'REQ',
          subId,
          { cache: ['user_infos', { pubkeys: pubkeys.slice(0, 100) }] },
        ]);
        
        ws?.send(message);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const [type, responseSubId, content] = data;
          
          if (responseSubId !== subId) return;
          
          if (type === 'EVENT' && content?.kind === 0) {
            try {
              profiles.set(content.pubkey, JSON.parse(content.content));
            } catch { /* ignore */ }
          } else if (type === 'EVENTS' && Array.isArray(content)) {
            for (const item of content) {
              if (item.kind === 0) {
                try {
                  profiles.set(item.pubkey, JSON.parse(item.content));
                } catch { /* ignore */ }
              }
            }
          } else if (type === 'EOSE') {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              ws?.close();
              resolve(profiles);
            }
          }
        } catch {
          // Ignore
        }
      };
      
      ws.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(profiles);
        }
      };
      
      ws.onclose = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(profiles);
        }
      };
      
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(profiles);
      }
    }
  });
}
