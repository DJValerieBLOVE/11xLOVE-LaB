# BUG TRACKER - 11x LOVE LaB

**Last Updated**: February 16, 2026  
**Updated By**: Claude Opus 4.6

---

## ✅ RESOLVED BUGS

### ✅ BUG #1: TEXT COLORS RENDER GRAY — FIXED (commit 8dbafeb)

**Symptom**: ALL text (usernames, headings, sidebar items) rendered as gray/muted instead of black.

**Root Cause**: Shakespeare's build system outputs CSS inside `<style type="text/tailwindcss">`, which triggers Tailwind's Play CDN to reprocess ALL CSS at runtime. The CDN generates its own `@layer base` with default shadcn/ui gray color variables, overriding all custom values set in `index.css`. Because the CDN reprocesses the entire `<style type="text/tailwindcss">` block, any CSS variable changes inside it were ineffective.

**Why 11+ Previous Attempts Failed**:
All previous fixes modified code *inside* the `<style type="text/tailwindcss">` block (CSS variables, inline styles, !important classes, arbitrary values). The CDN regenerated its own defaults over top of everything. The key insight was that a **plain `<style>` tag** (without `type="text/tailwindcss"`) is **not processed by the CDN** at all.

**Solution Applied**:
1. Added a **plain `<style>` tag** in `index.html` (before the tailwindcss block) with `!important` overrides for all foreground CSS variables: `--foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent-foreground` — all set to `0 0% 0%` (pure black)
2. Added `body { color: hsl(0 0% 0%) !important; }` in the same plain `<style>` tag
3. Applied explicit `text-black` classes on key components (`Card`, `CardTitle`, `TabsList`, `TabsTrigger`, FeedPost username, Feed headings, Profile name/bio) as belt-and-suspenders

**Files Changed**:
- `index.html` — Plain `<style>` with `!important` variable overrides
- `src/components/ui/card.tsx` — `text-black` on Card and CardTitle
- `src/components/ui/tabs.tsx` — `text-black` on TabsList and TabsTrigger
- `src/components/FeedPost.tsx` — `text-black` on username
- `src/pages/Feed.tsx` — `text-black` on headings and sidebar text
- `src/pages/Profile.tsx` — `text-black` on name and bio
- `src/components/Layout.tsx` — `text-gray-500` replacing `text-muted-foreground`

**Important for Future Development**:
- **NEVER rely on `text-foreground` or `text-card-foreground`** for critical text colors — these use CSS variables that the Tailwind CDN can override
- **USE `text-black`** for text that must be black — this compiles to `color: rgb(0 0 0)` which the CDN cannot override
- **The plain `<style>` tag in `index.html` MUST remain** — it is the primary defense against the CDN
- **`text-muted-foreground` is unreliable** — use `text-gray-500` or `text-gray-600` instead

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
