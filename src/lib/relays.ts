/**
 * Relay Configuration for 11x LOVE LaB
 * 
 * CRITICAL: All LaB data stays on the private Railway relay.
 * Public relays are READ-ONLY for profiles, follows, etc.
 */

// The private Railway relay - ALL LaB data goes here
export const LAB_RELAY_URL = 'wss://nostr-rs-relay-production-1569.up.railway.app';

// Public relays for reading social data (profiles, follows, zaps)
export const PUBLIC_RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.ditto.pub',
  'wss://bitcoiner.social',
];

/**
 * Check if a URL is the LaB private relay
 */
export function isLabRelay(url: string): boolean {
  try {
    const normalized = new URL(url).href.replace(/\/$/, '');
    const labNormalized = new URL(LAB_RELAY_URL).href.replace(/\/$/, '');
    return normalized === labNormalized;
  } catch {
    return false;
  }
}

/**
 * Check if a URL is a known public relay
 */
export function isPublicRelay(url: string): boolean {
  try {
    const normalized = new URL(url).href.replace(/\/$/, '');
    return PUBLIC_RELAYS.some(pr => {
      const prNormalized = new URL(pr).href.replace(/\/$/, '');
      return normalized === prNormalized;
    });
  } catch {
    return false;
  }
}

/**
 * Event kinds that should ONLY go to the LaB relay (never public)
 * These are private/LaB-specific data
 */
export const LAB_ONLY_KINDS = [
  // LaB-specific data
  30078, // App-specific data (experiments, progress, Big Dreams, etc.)
  30023, // Long-form articles (journals) - when tagged with 't: journal'
  
  // NIP-29 Group events (Tribes)
  9,     // Group metadata
  11,    // Group message
  12,    // Group message reply
  
  // Private encrypted data
  4,     // Encrypted DMs (NIP-04) - when within LaB context
  1059,  // Gift-wrapped events (NIP-17)
];

/**
 * Event kinds that CAN go to public relays (user's choice)
 */
export const SHAREABLE_KINDS = [
  0,     // Profile metadata - user may want to sync
  1,     // Short text notes - for sharing completions
  3,     // Contact list
  7,     // Reactions
  10002, // Relay list
];

/**
 * Determine if an event should go to public relays
 */
export function shouldPublishToPublic(kind: number, tags: string[][]): boolean {
  // Never publish LaB-only kinds to public
  if (LAB_ONLY_KINDS.includes(kind)) {
    return false;
  }
  
  // Check for LaB-specific tags that indicate private data
  const hasLabTag = tags.some(([name, value]) => 
    (name === 't' && value === 'journal') ||
    (name === 't' && value === 'lab-note') ||
    (name === 't' && value === 'big-dreams') ||
    (name === 't' && value === 'daily-practice') ||
    (name === 't' && value === 'experiment-progress') ||
    (name === 'd' && value?.startsWith('lab-')) ||
    (name === 'd' && value?.startsWith('journal-')) ||
    (name === 'd' && value?.startsWith('progress-'))
  );
  
  if (hasLabTag) {
    return false;
  }
  
  // For shareable kinds, allow public publishing
  return SHAREABLE_KINDS.includes(kind);
}

/**
 * Get the relay URLs for publishing an event
 * @param kind - Nostr event kind
 * @param tags - Event tags
 * @param userWantsPublic - User explicitly wants to share to public Nostr
 */
export function getPublishRelays(
  kind: number, 
  tags: string[][], 
  userWantsPublic: boolean = false
): string[] {
  const relays: string[] = [LAB_RELAY_URL]; // Always include LaB relay
  
  // Only add public relays if explicitly requested AND event type allows it
  if (userWantsPublic && shouldPublishToPublic(kind, tags)) {
    relays.push(...PUBLIC_RELAYS);
  }
  
  return relays;
}
