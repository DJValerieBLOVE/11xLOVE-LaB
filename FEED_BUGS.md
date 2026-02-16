# Feed System Bugs - RESOLVED

**Last Updated:** February 16, 2026
**Status:** ALL CRITICAL BUGS FIXED (commit 9562c31)

---

## ALL BUGS RESOLVED

### BUG 1: Feed Shows Stale/Old Data — MITIGATED
**Fix**: Direct relay queries (2-hour window) supplement Primal's 20-30 min cache lag. Auto-refresh every 60s.

### BUG 2: Raw JSON Displayed Instead of Parsed Content — FIXED
**Fix**: `processEvent()` handles both object and string event data. NoteContent has safety check for string events.

### BUG 3: Images Not Loading in Embedded Notes — FIXED
**Root Cause**: `EmbeddedNote` component dumped raw text. Created `EmbeddedNoteContent` with media extraction.
**Fix**: Image URL detection + `<img>` rendering in all embedded/quoted notes.

### BUG 4: naddr Links Showing as Raw Text — FIXED
**Root Cause**: Regex missing `naddr1` prefix.
**Fix**: Added `naddr1` to regex + decode handler that renders labeled link chips.

### BUG 5: Stats Sometimes Show, Sometimes Don't — FIXED
**THREE Root Causes**:
1. Missing `extended_response: true` on Primal `events` endpoint
2. Kind 6 reposts need stats by inner event ID, not wrapper ID
3. Relay post stats were fire-and-forget (never merged into data)

---

## PREVENTION RULES

See **AGENTS.md** sections:
- "CRITICAL: Primal API Rules (DO NOT BREAK)" — 4 rules
- "CRITICAL: NoteContent Rendering Rules (DO NOT BREAK)" — 4 rules
- "CRITICAL: Feed File Reference (READ BEFORE EDITING)" — file dependency map

---

## Files Involved

| File | Purpose | Status |
|------|---------|--------|
| `/src/lib/primalCache.ts` | WebSocket client for Primal API | STABLE |
| `/src/hooks/useFeedPosts.ts` | Feed data fetching hooks | STABLE |
| `/src/components/NoteContent.tsx` | Renders post content, links, images | STABLE |
| `/src/components/FeedPost.tsx` | Post card with stats and actions | STABLE |
| `/src/pages/Feed.tsx` | Feed page with tabs | STABLE |

---

**Last Updated:** February 16, 2026
