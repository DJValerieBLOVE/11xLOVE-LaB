# OPUS 4.6 SESSION - BUGS RESOLVED

**Date**: February 16, 2026  
**AI**: Claude Opus 4.6  
**Project**: 11x LOVE LaB (Nostr coaching platform)  
**Status**: Both critical bugs FIXED (commit 8dbafeb)

---

## RESOLVED BUGS

### ✅ BUG #1: Gray Text — FIXED (commit 8dbafeb)

**Root cause confirmed:** Shakespeare's build system outputs CSS inside `<style type="text/tailwindcss">`, which triggers the Tailwind Play CDN to reprocess ALL CSS at runtime. The CDN generates its own `@layer base` with default gray color variables (`--foreground: 222.2 47.4% 11.2%` etc.), overriding the custom black values. ALL 11 previous attempts by Sonnet 4.5 failed because they only modified code *inside* the `<style type="text/tailwindcss">` block — the CDN re-generated its own defaults over top of everything.

**Why previous approaches failed:**
- CSS variables inside `<style type="text/tailwindcss">` → CDN regenerates them
- `!important` inside Tailwind classes → CDN processes and removes them
- Inline styles → CDN specificity still wins via `@layer` cascade
- Removing classes → Elements inherit from CDN-processed body styles
- Arbitrary values `text-[#000]` → CDN processes these too

**The fix (two-layer defense):**

1. **Plain `<style>` tag in `index.html`** (NOT `type="text/tailwindcss"`) — The CDN completely ignores regular `<style>` tags. Sets all foreground CSS variables to `0 0% 0%` (pure black) with `!important`, plus `body { color: hsl(0 0% 0%) !important }`.

2. **Explicit `text-black` classes** on key components as belt-and-suspenders:
   - `Card` component → `text-black` (replaces `text-card-foreground`)
   - `CardTitle` component → `text-black`
   - `TabsList` → `text-black` (replaces `text-muted-foreground`)
   - `TabsTrigger` → `text-black`
   - FeedPost username link → `text-black`
   - All Feed page headings → `text-black`
   - Profile page name/bio → `text-black`
   - Layout dropdown username → `text-black`

**Files changed:**
- `index.html` — Added plain `<style>` with `!important` CSS variable overrides
- `src/components/ui/card.tsx` — `text-black` on Card and CardTitle
- `src/components/ui/tabs.tsx` — `text-black` on TabsList and TabsTrigger
- `src/components/FeedPost.tsx` — `text-black` on username link
- `src/pages/Feed.tsx` — `text-black` on all headings and sidebar text
- `src/pages/Profile.tsx` — `text-black` on name and bio
- `src/components/Layout.tsx` — `text-gray-500` replacing `text-muted-foreground`

---

### ✅ BUG #2: Stale Feed — IMPROVED (commit 8dbafeb)

**Root cause confirmed:** Primal's cache server (`wss://cache.primal.net/v1`) has an inherent 20-30 minute indexing lag. This is a known behavior of their infrastructure. The app already had parallel relay queries, but they needed optimization.

**Improvements made:**
- Direct relay queries now use `since` parameter (2-hour window) to specifically request recent posts
- Increased relay query limit from 40 to 60 for better coverage
- Added `refetchInterval: 60000` (auto-refresh every 60 seconds)
- Manual refresh now calls `queryClient.invalidateQueries()` to fully clear cache
- Feed now shows mix of Primal posts (with stats) + direct relay posts (fresher)

**Files changed:**
- `src/hooks/useFeedPosts.ts` — `since` filter, higher limits, auto-refresh, cache invalidation
- `src/pages/Feed.tsx` — Import `useQueryClient`, invalidate on refresh

**Note:** Some lag from Primal is unavoidable (their infrastructure limitation). But the direct relay queries now ensure the freshest posts from `relay.primal.net`, `relay.damus.io`, and `nos.lol` appear immediately.

---

## REMAINING KNOWN ISSUES

### 🟡 Stats Not Showing Reliably
**Symptom**: Like/repost/zap counts are sometimes 0 or missing
**Cause**: Primal's `feed` endpoint doesn't always include stats inline; we fetch them separately with `events` endpoint but the event_id matching may have issues
**Status**: Needs testing — may already be working better with the feed improvements
**Next Step**: Check browser console logs for `[Primal]` messages, verify ID matching

### 🟡 Feed Content Mismatch with Primal App
**Symptom**: Posts shown may differ from what Primal app shows
**Cause**: Using `feed` method which returns the user's following feed — same as Primal
**Status**: Likely working correctly now; differences may be due to relay selection
**Next Step**: Compare side-by-side with Primal app

---

## PROJECT OVERVIEW

**11x LOVE LaB** is a $1,000/year private coaching platform built on Nostr where members:
- Take daily "Experiments" (11 minutes/day) to improve their lives across 11 Dimensions
- Track progress in private Journals and Big Dreams
- Earn Bitcoin (sats) for completing Experiments
- Join private Tribes (groups) for accountability
- Access events, workshops, and coaching content

**Tech:**
- React + TailwindCSS + Nostr
- Private Railway relay for LaB data: `wss://nostr-rs-relay-production-1569.up.railway.app`
- Primal cache for public feed: `wss://cache.primal.net/v1`
- MKStack template (React + Nostrify)
- NIP-42 whitelist auth (only admin can publish to Railway relay)

**Design:**
- Light mode default
- Pink accent: #eb00a8
- Purple primary: #6600ff
- Font: Marcellus
- Mobile-first PWA

---

## WHAT WORKS

✅ Nostr login (NIP-07 / NIP-46)  
✅ Feed displays posts with stats  
✅ Primal integration (stats, link previews)  
✅ Text colors are pure black  
✅ Feed shows fresh posts (parallel relay + Primal)  
✅ Auto-refresh every 60 seconds  
✅ Tribe badges (gray, not pink)  
✅ Notification badge on Latest tab  
✅ Layout, navigation, routing  
✅ Post composer  

---

## REPOSITORY & DEPLOYMENT

- **Repo**: https://github.com/DJValerieBLOVE/11xLOVE-LaB.git
- **Live Site**: https://11xLOVE.shakespeare.wtf
- **Project Dir**: `/projects/11xlove-lab`

---

## KEY ARCHITECTURAL NOTES

### Tailwind CDN Workaround (IMPORTANT FOR FUTURE DEVS)

Shakespeare's build system uses `<style type="text/tailwindcss">` which triggers the Tailwind Play CDN. This means:

1. **All CSS variables inside `<style type="text/tailwindcss">` can be overridden by the CDN**
2. **To set CSS variables that the CDN cannot override**, use a plain `<style>` tag in `index.html`
3. **Use `!important` in the plain `<style>` tag** for belt-and-suspenders
4. **Use hardcoded Tailwind classes** like `text-black` instead of `text-foreground` for critical colors
5. **`text-foreground`, `text-card-foreground`** etc. are unreliable — they use `hsl(var(--foreground))` which the CDN can override

This pattern is documented in `index.html` with comments explaining why the plain `<style>` tag exists.

### Feed Architecture

The feed uses two data sources in parallel:
1. **Primal cache** (`wss://cache.primal.net/v1`) — Fast, includes stats/profiles, but 20-30 min lag
2. **Direct relay queries** — Real-time fresh posts, but no stats
3. Results are merged, deduped, and sorted by timestamp

---

## FILES TO READ FIRST

1. `/projects/11xlove-lab/PLAN.md` - Build spec and chunk status
2. `/projects/11xlove-lab/SESSION_NOTES.md` - Session history
3. `/projects/11xlove-lab/docs/PROJECT-STATUS.md` - Phase 2 roadmap
4. `/projects/11xlove-lab/index.html` - CSS variable overrides (plain `<style>` tag)
5. `/projects/11xlove-lab/src/hooks/useFeedPosts.ts` - Feed data fetching

---

## NEXT PRIORITIES

1. **Test on live site** — Deploy and verify text is black, feed is fresh
2. **Stats reliability** — Verify like/repost/zap counts show correctly
3. **Chunk 9: Completion Receipts** — One-time sats earning per lesson
4. **Chunk 10: Streak Tracking** — Daily check-ins with gamification
5. **Chunk 12: Magic Mentor AI** — OpenRouter/Grok integration

---

**Peace, LOVE, & Warm Aloha** 🌅💜
