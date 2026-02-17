# BUG TRACKER - 11x LOVE LaB

**Last Updated**: February 16, 2026
**Updated By**: Claude Opus 4.6

---

## ALL CRITICAL BUGS RESOLVED

### BUG #1: TEXT COLORS RENDER GRAY — FIXED (commits 8dbafeb, 9e41e5e, f1f7ba2)

**TWO Root Causes**:
- **Cause A**: Tailwind CDN overriding CSS variables. Fixed with plain `<style>` tag + `!important`.
- **Cause B**: Marcellus font faux-bold. Fixed by replacing all `font-bold`/`font-semibold`/`font-medium` with `font-normal`.

**Prevention Rules** (in AGENTS.md):
- NEVER use `font-bold`, `font-semibold`, `font-medium` — Marcellus only has weight 400
- Use `text-black` instead of `text-foreground` for critical text
- Keep the plain `<style>` tag in `index.html`

---

### BUG #2: FEED SHOWS STALE DATA — IMPROVED (commit 8dbafeb)

**Root Cause**: Primal cache has 20-30 min inherent lag.
**Mitigation**: Direct relay queries (2-hour window) supplement Primal with real-time data. Auto-refresh every 60s.

---

### BUG #3: STATS NOT SHOWING (likes, zaps, reposts) — FIXED (commit 9562c31)

**THREE Root Causes Found**:

#### Cause A: Missing `extended_response: true`
Primal's `events` cache method requires `extended_response: true` in the payload to return stats (kind 10000100) and user actions (kind 10000115). Without it, only the raw events are returned.

**File**: `/src/lib/primalCache.ts` — `fetchPrimalEventStats()`
```typescript
// MUST include this:
const payload = {
  event_ids: eventIds,
  user_pubkey: userPubkey,
  extended_response: true,  // WITHOUT THIS = NO STATS
};
```

#### Cause B: Kind 6 repost stats lookup by wrong ID
A kind 6 repost wraps the original note as JSON in `content`. Stats belong to the INNER event, not the repost wrapper. Looking up `stats.get(repost.id)` always returns nothing.

**File**: `/src/hooks/useFeedPosts.ts` — `useFollowingPosts()` and `useFeedPosts()`
```typescript
// Extract inner event ID for stats lookup:
let statsId = note.id;
if (note.kind === 6 && note.content) {
  try {
    const inner = JSON.parse(note.content);
    if (inner.id) statsId = inner.id;
  } catch { /* fallback to note.id */ }
}
const stats = primalResult.stats.get(statsId) || primalResult.stats.get(note.id);
```

#### Cause C: Fire-and-forget stats for relay posts
Posts from direct relay queries had stats fetched but the result was thrown away: `fetchPrimalEventStats(...).catch(() => {})`. Changed to `await` + merge into posts array.

**File**: `/src/hooks/useFeedPosts.ts` — relay post processing
```typescript
// MUST await and merge:
const statsResult = await fetchPrimalEventStats(newEventIds, user.pubkey, signal);
for (const [id, stats] of statsResult.stats) {
  // merge into posts array
}
```

---

### BUG #4: naddr1 REFERENCES SHOWING AS RAW TEXT — FIXED (commit 9562c31)

**Root Cause**: NoteContent regex only had `npub1|note1|nprofile1|nevent1` — missing `naddr1`.

**File**: `/src/components/NoteContent.tsx`
```typescript
// MUST include ALL NIP-19 prefixes:
const regex = /(https?:\/\/[^\s]+)|nostr:(npub1|note1|nprofile1|nevent1|naddr1)(...)/g;
```

---

### BUG #5: EMBEDDED NOTES SHOWING RAW URLs — FIXED (commit 9562c31)

**Root Cause**: `EmbeddedNote` component used `<p>{content}</p>` — no media processing at all.

**Fix**: Created `EmbeddedNoteContent` component that extracts image URLs, renders `<img>` tags, and replaces nostr references with compact labels.

**File**: `/src/components/NoteContent.tsx` — `EmbeddedNoteContent` function

---

## KNOWN NON-CRITICAL ISSUES

### Primal Cache Lag (20-30 min)
By design. Cannot be fixed. Direct relay queries supplement.

### Tailwind CDN Warning in Console
Expected behavior. Plain `<style>` override handles it.

---

## PREVENTION RULES (Also in AGENTS.md)

### Primal API Rules
1. **`extended_response: true`** on events endpoint — REQUIRED for stats
2. **Kind 6 inner ID lookup** — stats belong to inner event, not repost wrapper
3. **Never fire-and-forget** — always await and merge stats
4. **Always fetch stats separately** — feed endpoint doesn't always include them

### NoteContent Rules
1. **ALL NIP-19 prefixes in regex** — `npub1|note1|nprofile1|nevent1|naddr1`
2. **Each prefix needs a handler** — link chip, embedded card, etc.
3. **Embedded notes render media** — use `EmbeddedNoteContent`, not raw text
4. **Image hosts list covers all CDNs** — Blossom, nostr.build, void.cat, etc.

### Font Rules
1. **ZERO `font-bold`/`font-semibold`/`font-medium`** — Marcellus only has weight 400
2. **Use `text-black`** — not `text-foreground` for critical text

---

**Last Updated:** February 16, 2026
