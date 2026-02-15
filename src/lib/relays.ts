/**
 * Relay Configuration for 11x LOVE LaB
 * 
 * CRITICAL: All LaB data stays on the private Railway relay.
 * Public relays are READ-ONLY for profiles, follows, etc.
 * 
 * PRIVACY LEVELS:
 * 🔴 NEVER SHAREABLE - Tribe messages (encrypted, only group members can read)
 * 🟡 PRIVATE BY DEFAULT - Big Dreams, Journals, Magic Mentor (optional share with warning)
 * 🟢 SHAREABLE - Completion posts, Feed posts, Reactions
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
 * 🔴 NEVER SHAREABLE - These CANNOT be shared to public under any circumstances
 * Tribe/Group messages are encrypted and only group members can decrypt them
 */
export const NEVER_SHAREABLE_KINDS = [
  // NIP-29 Group events (Tribes) - LOCKED DOWN
  9,     // Group metadata
  11,    // Group message - NEVER PUBLIC
  12,    // Group message reply - NEVER PUBLIC
  
  // NIP-17 Gift-wrapped events (encrypted DMs within groups)
  1059,  // Gift-wrapped events
  1060,  // Sealed sender
];

/**
 * 🟡 PRIVATE BY DEFAULT - Can be shared with explicit user consent + warning
 */
export const PRIVATE_BY_DEFAULT_KINDS = [
  // LaB-specific data
  30078, // App-specific data (experiments, progress, Big Dreams, etc.)
  30023, // Long-form articles (journals)
  
  // Encrypted personal data
  4,     // Encrypted DMs (NIP-04)
];

/**
 * 🟢 SHAREABLE - Can go to public relays (user's choice)
 */
export const SHAREABLE_KINDS = [
  0,     // Profile metadata - user may want to sync
  1,     // Short text notes - for sharing completions
  3,     // Contact list
  7,     // Reactions
  10002, // Relay list
];

/**
 * All LaB-only kinds (union of never shareable + private by default)
 */
export const LAB_ONLY_KINDS = [
  ...NEVER_SHAREABLE_KINDS,
  ...PRIVATE_BY_DEFAULT_KINDS,
];

/**
 * Tags that indicate private LaB data (cannot be shared)
 */
export const PRIVATE_TAGS = [
  'journal',
  'lab-note', 
  'big-dreams',
  'daily-practice',
  'experiment-progress',
  'magic-mentor',
  'tribe-message',
  'group-chat',
];

/**
 * Check if content can EVER be shared (some things can NEVER go public)
 */
export function canEverBeShared(kind: number, tags: string[][]): boolean {
  // 🔴 Tribe messages can NEVER be shared - hardcoded block
  if (NEVER_SHAREABLE_KINDS.includes(kind)) {
    return false;
  }
  
  // Check for tribe/group tags
  const hasTribeTag = tags.some(([name, value]) => 
    (name === 't' && (value === 'tribe-message' || value === 'group-chat')) ||
    (name === 'h') // NIP-29 group identifier
  );
  
  if (hasTribeTag) {
    return false;
  }
  
  return true;
}

/**
 * Check if content requires a warning before sharing
 */
export function requiresShareWarning(kind: number, tags: string[][]): boolean {
  // Private by default kinds always need warning
  if (PRIVATE_BY_DEFAULT_KINDS.includes(kind)) {
    return true;
  }
  
  // Check for private LaB tags
  const hasPrivateTag = tags.some(([name, value]) => 
    name === 't' && PRIVATE_TAGS.includes(value || '') ||
    (name === 'd' && value?.startsWith('lab-')) ||
    (name === 'd' && value?.startsWith('journal-')) ||
    (name === 'd' && value?.startsWith('progress-')) ||
    (name === 'd' && value?.startsWith('big-dreams-'))
  );
  
  return hasPrivateTag;
}

/**
 * Determine if an event should go to public relays
 */
export function shouldPublishToPublic(kind: number, tags: string[][]): boolean {
  // 🔴 NEVER shareable - blocked completely
  if (!canEverBeShared(kind, tags)) {
    return false;
  }
  
  // Check for LaB-specific tags that indicate private data
  const hasLabTag = tags.some(([name, value]) => 
    (name === 't' && PRIVATE_TAGS.includes(value || '')) ||
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
