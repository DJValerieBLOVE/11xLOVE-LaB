# BUG TRACKER - 11x LOVE LaB

**Last Updated**: February 16, 2026  
**Updated By**: Claude Opus 4.6

---

## ✅ RESOLVED BUGS

### ✅ BUG #1: TEXT COLORS RENDER GRAY — FIXED (commits 8dbafeb, 9e41e5e)

**Symptom**: Text (usernames, headings, sidebar items) rendered as gray/muted/blurry instead of crisp black.

**TWO Root Causes Found**:

#### Cause A: Tailwind CDN overriding CSS variables (commit 8dbafeb)
Shakespeare's build system outputs CSS inside `<style type="text/tailwindcss">`, which triggers Tailwind's Play CDN to reprocess ALL CSS at runtime. The CDN generates its own `@layer base` with default shadcn/ui gray color variables, overriding all custom values set in `index.css`.

#### Cause B: Marcellus font faux-bold rendering (commit 9e41e5e) ⚠️ STILL NEEDS SITE-WIDE FIX
The **Marcellus** font only ships with **weight 400 (regular)**. It has NO bold, semibold, or medium weight files. When Tailwind classes like `font-semibold` (600), `font-bold` (700), or `font-medium` (500) are applied, the browser **synthesizes a fake bold** by slightly stretching/smearing the glyphs. This causes text to look **blurry, gray, and washed out** instead of crisp black — especially at smaller sizes (text-sm, text-base).

**Why text-black alone doesn't fix it**: The color IS black, but the faux-bold rendering makes it appear gray/blurry because the browser is artificially thickening strokes that weren't designed for it.

**Solution for Cause A**:
1. Plain `<style>` tag in `index.html` with `!important` CSS variable overrides
2. Explicit `text-black` classes on key components

**Solution for Cause B** (partially applied — Feed page only):
Changed `font-semibold` and `font-medium` to `font-normal` on affected elements so Marcellus renders at its native weight 400 — crisp and clean.

**⚠️ REMAINING WORK**: Cause B exists on EVERY page across the entire app. Only the Feed page was fixed. See `MARCELLUS_FONT_FIX.md` for the full list of files and lines that need `font-medium`/`font-semibold`/`font-bold` replaced with `font-normal`.

**Important for Future Development**:
- **NEVER use `font-medium`, `font-semibold`, or `font-bold`** on any text using the Marcellus font — it only has weight 400 and faux-bold looks blurry
- **USE `font-normal`** for all Marcellus text that must look crisp
- **If you need visual weight distinction**, use `text-lg`/`text-xl` (size) or `uppercase tracking-wide` (letter-spacing) instead of font-weight
- **USE `text-black`** instead of `text-foreground` for critical text
- **The plain `<style>` tag in `index.html` MUST remain**

---

### ✅ BUG #2: FEED SHOWS 25+ MINUTE OLD DATA — IMPROVED (commit 8dbafeb)

**Symptom**: Feed displayed stale posts from 25+ minutes ago, even after refresh/cache clear.

**Root Cause**: Primal's cache server (`wss://cache.primal.net/v1`) has an inherent 20-30 minute indexing lag. This is a known limitation of their infrastructure and cannot be fixed on our end. The direct relay queries were working but not optimized for freshness.

**Solution Applied**:
1. Direct relay queries now use `since` parameter (2-hour window) to focus on recent posts
2. Increased relay query limit from 40 to 60
3. Added `refetchInterval: 60000` for auto-refresh every 60 seconds
4. Manual refresh now calls `queryClient.invalidateQueries()` to fully clear TanStack Query cache before refetching

**Files Changed**:
- `src/hooks/useFeedPosts.ts` — `since` filter, higher limits, auto-refresh interval
- `src/pages/Feed.tsx` — `useQueryClient` for cache invalidation on refresh

**Note**: Some Primal lag is unavoidable. The feed now shows a mix of:
- Primal posts (with engagement stats, slightly delayed)
- Direct relay posts (real-time fresh, but no stats)
Both sources are merged, deduped, and sorted by timestamp.

---

### ✅ BUG #4: Pink Tribe Badges — FIXED (earlier session)
Changed from pink to gray. Working correctly.

### ✅ BUG #5: Tab Notification Badge — FIXED (earlier session)
Added pink notification bubble to Latest tab when new posts available.

---

## 🟡 KNOWN ISSUES (Non-Critical)

### 🟡 BUG #3: Stats Not Showing Reliably
**Symptom**: Like/repost/zap counts are sometimes 0 or missing on some posts.
**Likely Cause**: Primal's `feed` endpoint doesn't always include stats inline. We fetch them separately with the `events` endpoint, but there may be event_id matching issues or the separate stats request may time out.
**Impact**: Low — posts still display, just without engagement counts.
**Status**: Needs testing after the feed improvements.
**Next Step**: Check browser console for `[Primal]` log messages — look for "Fetched X stats" entries. If stats are 0, the event IDs from the feed may not match what Primal has indexed.

### 🟡 Primal Cache Lag (20-30 min)
**Symptom**: Some posts appear 20-30 minutes after they're published on other clients.
**Cause**: Inherent Primal infrastructure limitation — not a bug in our code.
**Mitigation**: Direct relay queries supplement Primal with real-time data.
**Status**: Working as designed. Cannot be fully eliminated without replacing Primal.

### 🟡 Tailwind CDN Warning in Console
**Symptom**: Console shows "cdn.tailwindcss.com should not be used in production"
**Cause**: Shakespeare build system uses Tailwind Play CDN by design.
**Impact**: None — this is expected behavior. The plain `<style>` override handles it.
**Status**: Informational only. No action needed.

---

## ARCHITECTURE NOTES FOR FUTURE DEBUGGING

### CSS Cascade in Shakespeare Build

```
┌─────────────────────────────────────────────────────────────┐
│  STYLE PROCESSING ORDER (highest priority first)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Plain <style> tag in index.html (!important)    ← OURS │
│     - CSS variables with !important                         │
│     - body color with !important                            │
│     - CDN does NOT process this                             │
│                                                             │
│  2. Tailwind utility classes (text-black, etc.)             │
│     - Generated by CDN from <style type="text/tailwindcss"> │
│     - Direct color values (rgb(0 0 0)) are safe             │
│                                                             │
│  3. CDN-generated @layer base                               │
│     - Default shadcn/ui variables (GRAY!)                   │
│     - This is what was causing the bug                      │
│                                                             │
│  4. Our CSS variables in <style type="text/tailwindcss">    │
│     - CDN overwrites these with its own @layer base         │
│     - UNRELIABLE — do not depend on these alone             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Feed Data Flow

```
┌──────────────┐     ┌──────────────┐
│ Primal Cache │     │ Direct Relays│
│ (stats+lag)  │     │ (fresh, no   │
│              │     │  stats)      │
└──────┬───────┘     └──────┬───────┘
       │                    │
       └────────┬───────────┘
                │
        ┌───────▼───────┐
        │ Merge + Dedup │
        │ Sort by time  │
        └───────┬───────┘
                │
        ┌───────▼───────┐
        │  TanStack     │
        │  Query Cache  │
        │  staleTime: 0 │
        │  auto: 60s    │
        └───────┬───────┘
                │
        ┌───────▼───────┐
        │   Feed UI     │
        └───────────────┘
```
