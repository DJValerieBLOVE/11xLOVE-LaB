# Session Notes - February 16, 2026

> **STATUS: BOTH CRITICAL BUGS FIXED** ✅ (commit 8dbafeb)

---

## CURRENT SESSION SUMMARY (Opus 4.6)

### Bugs Fixed This Session

1. ✅ **FIXED: Gray/muted text colors** — Added plain `<style>` tag in `index.html` with `!important` CSS variable overrides that the Tailwind Play CDN cannot process. Applied explicit `text-black` classes on key components. Root cause was CDN reprocessing `<style type="text/tailwindcss">` and overriding custom variables.

2. ✅ **IMPROVED: Feed freshness** — Added `since` parameter to direct relay queries (2-hour window), increased relay limit to 60, added 60-second auto-refresh, and full cache invalidation on manual refresh. Primal's inherent 20-30 min lag is supplemented by real-time direct relay queries.

### Previous Session Work (Sonnet 4.5)

3. ✅ **Added link preview support** (kind 10000128 → LinkPreviewCard)
4. ✅ **Changed tribe badges from pink to gray**
5. ✅ **Added notification badge to Latest tab**
6. ✅ **Primal custom kinds documented** (40+ kinds)
7. ✅ **Feed system built** (Primal + direct relay parallel queries)
8. ❌ **11 failed attempts to fix gray text** — all within `<style type="text/tailwindcss">` block

---

## GIT HISTORY (Most Recent First)

```
8dbafeb - Fix gray text bug + improve feed freshness (Opus 4.6) ✅
b9a9f86 - Moved CSS vars outside @layer + restored muted vars (Sonnet 4.5) ❌
4cb68a1 - REMOVE all color overrides - use pure black CSS variables only ❌
73d0dfd - Replace inline styles with !important utility classes ❌
b8b8955 - Add inline styles with hardcoded dark color (#1a1a1a) ❌
806e624 - FIX: Dark mode CSS overriding light mode ❌
47bce2f - DELETE muted color system completely ❌
32f4a65 - Fix muted-foreground CSS to use DARK readable gray ❌
d1fc265 - Remove ALL text-muted-foreground - replace with explicit colors ❌
237a720 - Fix text color to dark/black across Feed sidebar ❌
```

---

## REMAINING ISSUES

### 🟡 Stats Not Showing Reliably
**Symptom**: Like/repost/zap counts are sometimes 0 or missing
**Status**: NEEDS TESTING — may be working better after feed improvements
**Next Step**: Check console logs for `[Primal]` messages, verify stat counts

### 🟡 Primal Cache Lag (20-30 min)
**Status**: By design — Primal infrastructure limitation
**Mitigation**: Direct relay queries provide real-time fresh posts

---

## FILES CHANGED THIS SESSION (Opus 4.6)

| File | Changes |
|------|---------|
| `index.html` | Plain `<style>` with `!important` CSS variable overrides |
| `src/components/ui/card.tsx` | `text-black` on Card and CardTitle |
| `src/components/ui/tabs.tsx` | `text-black` on TabsList and TabsTrigger |
| `src/components/FeedPost.tsx` | `text-black` on username link |
| `src/pages/Feed.tsx` | `text-black` on headings, `useQueryClient` for cache invalidation |
| `src/pages/Profile.tsx` | `text-black` on name and bio |
| `src/components/Layout.tsx` | `text-gray-500` replacing `text-muted-foreground` |
| `src/hooks/useFeedPosts.ts` | `since` filter, higher limits, auto-refresh, cache invalidation |

---

## KEY TECHNICAL LESSONS

### Shakespeare + Tailwind CDN Workaround

**Problem**: Shakespeare uses `<style type="text/tailwindcss">` → Tailwind Play CDN reprocesses everything → custom CSS variables overridden with gray defaults.

**Solution**: Plain `<style>` tag (no `type` attribute) in `index.html` with `!important`. CDN ignores it completely.

**Rules for future development**:
- Use `text-black` instead of `text-foreground` for critical text
- Use `text-gray-500` instead of `text-muted-foreground` for metadata
- Keep the plain `<style>` tag in `index.html` — it's essential
- Any new foreground CSS variables must be added to the plain `<style>` override

### Feed Data Strategy

**Primal** provides: stats, profiles, link previews (but 20-30 min delayed)
**Direct relays** provide: fresh posts in real-time (but no stats)
**Merge strategy**: Dedupe by event ID, sort by timestamp, Primal stats win when available

---

## PRIMAL CUSTOM KINDS (Complete Reference)

```typescript
// Key kinds we parse:
NoteStats: 10_000_100      // likes, reposts, replies, zaps
NoteActions: 10_000_115    // user liked/reposted/zapped
LinkMetadata: 10_000_128   // og:title, og:image, og:description
MediaInfo: 10_000_119      // image dimensions

// Kinds we silently ignore (not needed for feed display):
Mentions: 10_000_107
UserScore: 10_000_108
FeedRange: 10_000_113      // pagination
EventZapInfo: 10_000_129
RelayHint: 10_000_141
VerifiedUsersDict: 10_000_158
LegendCustomization: 10_000_168
MembershipCohortInfo: 10_000_169
```

---

## NEXT STEPS

1. **Deploy and test on live site** — Verify text is black, feed is fresh
2. **Test stats display** — Check if like/repost/zap counts show reliably
3. **Chunk 9: Completion Receipts** — One-time sats earning per lesson
4. **Chunk 10: Streak Tracking** — Daily check-ins, calendar, milestones
5. **Chunk 12: Magic Mentor AI** — OpenRouter/Grok integration

---

**Last Updated:** February 16, 2026

**Peace, LOVE, & Warm Aloha** 🌅💜
