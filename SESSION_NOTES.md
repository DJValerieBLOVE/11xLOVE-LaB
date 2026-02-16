# Session Notes - February 16, 2026

> **STATUS: Feed stats + content rendering FIXED** — Three root causes found and resolved. See AGENTS.md "Primal API Rules" and "NoteContent Rendering Rules" for prevention.

---

## CURRENT SESSION SUMMARY (Opus 4.6 — Session 3)

### Bugs Fixed This Session (commit 9562c31)

1. **FIXED: Stats not showing (likes, reposts, zaps, replies)**
   - **Root Cause A**: Primal's `events` endpoint needs `extended_response: true` to return stats (kind 10000100) and actions (kind 10000115). Without it, only events are returned.
   - **Root Cause B**: Kind 6 reposts need stats looked up by the INNER event ID, not the repost wrapper ID. The inner event is embedded as JSON in the repost's `content` field.
   - **Root Cause C**: Relay-sourced posts called `fetchPrimalEventStats()` but threw away the result with `.catch(() => {})`. Changed to await + merge.

2. **FIXED: `naddr1` references showing as raw text**
   - **Root Cause**: NoteContent's nostr regex was missing `naddr1` prefix. Only had `npub1|note1|nprofile1|nevent1`.
   - **Fix**: Added `naddr1` to regex + handler that renders labeled link chips.

3. **FIXED: Embedded/quoted notes showing raw URLs instead of images**
   - **Root Cause**: `EmbeddedNote` component dumped `event.content` as plain text `<p>{content}</p>` with zero media processing.
   - **Fix**: Created `EmbeddedNoteContent` component that extracts image URLs, renders `<img>` tags, and replaces nostr references with compact labels.

### Prevention: AGENTS.md Updated

Added three new CRITICAL sections to AGENTS.md to prevent regressions:
- **Primal API Rules** — 4 rules with code examples
- **NoteContent Rendering Rules** — 4 rules with code examples
- **Feed File Reference** — dependency map of all feed files

### Previous Sessions

4. **Session 2 (Opus 4.6)**: Root cause of blurry text = Marcellus font faux-bold. Fixed on Feed page.
5. **Session 1 (Opus 4.6)**: Fixed gray text from Tailwind CDN overrides. Added feed freshness improvements.
6. **Earlier (Sonnet 4.5)**: Built feed system, added link previews, documented Primal kinds.

---

## GIT HISTORY (Most Recent First)

```
9562c31 - fix: stats not showing + raw naddr/image URLs in feed posts
f1f7ba2 - fix: eliminate all pink brand accents, enforce no-bold rules in AGENTS.md
4769e36 - Fix blurry text site-wide: replace faux-bold with font-normal
9e41e5e - Fix blurry gray text on Feed page - username, My Tribes, etc.
8dbafeb - Fix gray text bug + improve feed freshness
```

---

## REMAINING ISSUES

### All Clear

- Stats: **RESOLVED** (extended_response + inner ID lookup + await stats)
- naddr rendering: **RESOLVED** (regex + handler)
- Embedded media: **RESOLVED** (EmbeddedNoteContent component)
- Blurry text: **RESOLVED** (font-normal everywhere)
- Gray text: **RESOLVED** (plain style tag + text-black)
- Stale data: **MITIGATED** (Primal lag is by design, direct relays supplement)

### Primal Cache Lag (20-30 min)

**Status**: By design — Primal infrastructure limitation. Not fixable.
**Mitigation**: Direct relay queries provide real-time fresh posts alongside Primal's cached data.

---

## FILES CHANGED THIS SESSION

| File | Changes |
|------|---------|
| `src/lib/primalCache.ts` | Added `extended_response: true` to events payload, always fetch stats separately as safety net, handle newline-separated compressed responses |
| `src/hooks/useFeedPosts.ts` | Look up stats by inner event ID for kind 6 reposts, await stats for relay posts instead of fire-and-forget |
| `src/components/NoteContent.tsx` | Added `naddr1` to nostr regex, added naddr decode handler, created `EmbeddedNoteContent` component for rich media in quoted notes |
| `src/components/FeedPost.tsx` | Removed noisy debug logging |
| `AGENTS.md` | Added Primal API Rules, NoteContent Rendering Rules, Feed File Reference |

---

## KEY TECHNICAL LESSONS (Updated)

### Primal API — The Three Rules That Matter

1. **`extended_response: true`** on `events` endpoint or you get NO stats
2. **Kind 6 inner ID** — stats belong to the original note, not the repost
3. **Await stats** — never fire-and-forget, always merge into the data

### NoteContent — Never Show Raw Text

1. **Regex must have ALL NIP-19 prefixes** — `npub1|note1|nprofile1|nevent1|naddr1`
2. **Every prefix needs a decode handler** — link chip, embedded card, etc.
3. **Embedded notes MUST render media** — use `EmbeddedNoteContent`, not raw `{content}`
4. **Image hosts list must be comprehensive** — Blossom subdomains, CDN URLs, hash filenames

### Shakespeare + Tailwind CDN Workaround

- Use `text-black` instead of `text-foreground` for critical text
- Keep the plain `<style>` tag in `index.html` — CDN ignores it
- NEVER use `font-bold`/`font-semibold`/`font-medium` — Marcellus only has weight 400

---

## NEXT STEPS

1. **Chunk 9: Completion Receipts** — One-time sats earning per lesson
2. **Chunk 10: Streak Tracking** — Daily check-ins, calendar, milestones
3. **Chunk 12: Magic Mentor AI** — OpenRouter/Grok integration

---

**Last Updated:** February 16, 2026

**Peace, LOVE, & Warm Aloha**
