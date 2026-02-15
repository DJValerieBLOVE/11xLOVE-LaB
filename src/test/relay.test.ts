/**
 * Private Relay Tests
 * 
 * Tests to verify that:
 * 1. LaB data goes ONLY to the private Railway relay
 * 2. Public data can go to public relays
 * 3. Never-shareable content is blocked from public
 */

import { describe, it, expect } from 'vitest';
import {
  LAB_RELAY_URL,
  PUBLIC_RELAYS,
  isLabRelay,
  isPublicRelay,
  canEverBeShared,
  shouldPublishToPublic,
  getPublishRelays,
  NEVER_SHAREABLE_KINDS,
  PRIVATE_BY_DEFAULT_KINDS,
  SHAREABLE_KINDS,
} from '@/lib/relays';

describe('Relay Configuration', () => {
  it('should have the correct LaB relay URL', () => {
    expect(LAB_RELAY_URL).toBe('wss://nostr-rs-relay-production-1569.up.railway.app');
  });

  it('should have public relays configured', () => {
    expect(PUBLIC_RELAYS.length).toBeGreaterThan(0);
    expect(PUBLIC_RELAYS).toContain('wss://relay.primal.net');
    expect(PUBLIC_RELAYS).toContain('wss://relay.damus.io');
  });
});

describe('isLabRelay', () => {
  it('should identify the LaB relay', () => {
    expect(isLabRelay(LAB_RELAY_URL)).toBe(true);
    expect(isLabRelay('wss://nostr-rs-relay-production-1569.up.railway.app')).toBe(true);
    expect(isLabRelay('wss://nostr-rs-relay-production-1569.up.railway.app/')).toBe(true);
  });

  it('should reject public relays', () => {
    expect(isLabRelay('wss://relay.damus.io')).toBe(false);
    expect(isLabRelay('wss://relay.primal.net')).toBe(false);
  });

  it('should handle invalid URLs', () => {
    expect(isLabRelay('not-a-url')).toBe(false);
    expect(isLabRelay('')).toBe(false);
  });
});

describe('isPublicRelay', () => {
  it('should identify public relays', () => {
    expect(isPublicRelay('wss://relay.damus.io')).toBe(true);
    expect(isPublicRelay('wss://relay.primal.net')).toBe(true);
  });

  it('should reject the LaB relay', () => {
    expect(isPublicRelay(LAB_RELAY_URL)).toBe(false);
  });
});

describe('Privacy Levels - Never Shareable (Tribe Messages)', () => {
  it('should block kind 11 (group message) from ever being shared', () => {
    expect(canEverBeShared(11, [])).toBe(false);
    expect(shouldPublishToPublic(11, [])).toBe(false);
  });

  it('should block kind 12 (group reply) from ever being shared', () => {
    expect(canEverBeShared(12, [])).toBe(false);
    expect(shouldPublishToPublic(12, [])).toBe(false);
  });

  it('should block kind 9 (group metadata) from ever being shared', () => {
    expect(canEverBeShared(9, [])).toBe(false);
    expect(shouldPublishToPublic(9, [])).toBe(false);
  });

  it('should block gift-wrapped events (1059, 1060)', () => {
    expect(canEverBeShared(1059, [])).toBe(false);
    expect(canEverBeShared(1060, [])).toBe(false);
  });

  it('should block events with h tag (group identifier)', () => {
    const tags: string[][] = [['h', 'morning-risers']];
    expect(canEverBeShared(1, tags)).toBe(false);
  });
});

describe('Privacy Levels - Private by Default', () => {
  it('should mark kind 30078 (app data) as private by default', () => {
    expect(PRIVATE_BY_DEFAULT_KINDS).toContain(30078);
  });

  it('should mark kind 30023 (journals) as private by default', () => {
    expect(PRIVATE_BY_DEFAULT_KINDS).toContain(30023);
  });
});

describe('Privacy Levels - Shareable', () => {
  it('should allow kind 1 (notes) to be shared', () => {
    expect(SHAREABLE_KINDS).toContain(1);
    expect(canEverBeShared(1, [])).toBe(true);
    expect(shouldPublishToPublic(1, [])).toBe(true);
  });

  it('should allow kind 7 (reactions) to be shared', () => {
    expect(SHAREABLE_KINDS).toContain(7);
    expect(canEverBeShared(7, [])).toBe(true);
    expect(shouldPublishToPublic(7, [])).toBe(true);
  });

  it('should block kind 1 with private tags', () => {
    const journalTags: string[][] = [['t', 'journal']];
    expect(shouldPublishToPublic(1, journalTags)).toBe(false);

    const bigDreamsTags: string[][] = [['t', 'big-dreams']];
    expect(shouldPublishToPublic(1, bigDreamsTags)).toBe(false);

    const labTags: string[][] = [['d', 'lab-progress-123']];
    expect(shouldPublishToPublic(1, labTags)).toBe(false);
  });
});

describe('getPublishRelays', () => {
  it('should always include LaB relay', () => {
    const relays = getPublishRelays(1, [], false);
    expect(relays).toContain(LAB_RELAY_URL);
  });

  it('should only include LaB relay for private content', () => {
    // Tribe message - never public
    const tribeRelays = getPublishRelays(11, [], true);
    expect(tribeRelays).toEqual([LAB_RELAY_URL]);

    // Journal - private by default
    const journalRelays = getPublishRelays(1, [['t', 'journal']], true);
    expect(journalRelays).toEqual([LAB_RELAY_URL]);
  });

  it('should include public relays when user opts in for shareable content', () => {
    const relays = getPublishRelays(1, [], true);
    expect(relays).toContain(LAB_RELAY_URL);
    expect(relays.length).toBeGreaterThan(1);
    
    // Should include some public relays
    const hasPublicRelay = relays.some(r => PUBLIC_RELAYS.includes(r));
    expect(hasPublicRelay).toBe(true);
  });

  it('should NOT include public relays when user does not opt in', () => {
    const relays = getPublishRelays(1, [], false);
    expect(relays).toEqual([LAB_RELAY_URL]);
  });
});

describe('Security - Tribe Messages Can NEVER Go Public', () => {
  const tribeKinds = [9, 11, 12, 1059, 1060];

  tribeKinds.forEach(kind => {
    it(`kind ${kind} should NEVER be shareable, even if user requests public`, () => {
      // Even if user explicitly requests public...
      const relays = getPublishRelays(kind, [], true);
      
      // ...it should only go to LaB relay
      expect(relays).toEqual([LAB_RELAY_URL]);
      
      // And canEverBeShared should return false
      expect(canEverBeShared(kind, [])).toBe(false);
    });
  });

  it('posts with h tag (group identifier) should NEVER be shareable', () => {
    const tags: string[][] = [['h', 'bitcoin-builders']];
    const relays = getPublishRelays(1, tags, true);
    
    // Should only go to LaB relay because it has group tag
    expect(relays).toEqual([LAB_RELAY_URL]);
  });
});

describe('Security - User Data Protection', () => {
  it('Big Dreams should not go to public relays', () => {
    const tags: string[][] = [['d', 'big-dreams-dimension-1']];
    expect(shouldPublishToPublic(30078, tags)).toBe(false);
  });

  it('Journal entries should not go to public relays', () => {
    const tags: string[][] = [['t', 'journal']];
    expect(shouldPublishToPublic(30023, tags)).toBe(false);
  });

  it('Magic Mentor conversations should not go to public relays', () => {
    const tags: string[][] = [['t', 'magic-mentor']];
    expect(shouldPublishToPublic(30078, tags)).toBe(false);
  });

  it('Experiment progress should not go to public relays', () => {
    const tags: string[][] = [['t', 'experiment-progress']];
    expect(shouldPublishToPublic(30078, tags)).toBe(false);
  });
});
