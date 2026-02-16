# Session Notes - February 16, 2026

> **STATUS: CRITICAL BUG - TEXT COLORS STILL FUZZY/GRAY - UNFIXABLE**

---

## CURRENT SESSION SUMMARY (Updated 9:45 AM)

### What Was Attempted This Session
1. ✅ **Added link preview support** (kind 10000128 → LinkPreviewCard)
2. ✅ **Changed tribe badges from pink to gray**
3. ✅ **Added notification badge to Latest tab**
4. ❌ **FAILED: Fix gray/muted text colors** - tried 11+ different approaches, NONE worked
5. ❌ **LATEST ATTEMPT (Sonnet 4.5)**: Moved CSS vars outside @layer, restored muted vars — STILL FUZZY (commit b9a9f86)

### Critical Issue: Tailwind Play CDN Overriding All Color Changes

**THE PROBLEM:**
Shakespeare's build system uses `<style type="text/tailwindcss">` which loads Tailwind Play CDN at runtime. This CDN reprocesses ALL CSS and overrides custom color values with Tailwind's defaults, making ALL text render as gray/muted instead of black.

**ATTEMPTS MADE (ALL FAILED):**
1. ❌ Changed CSS variables to black `0 0% 0%` - CDN overrides
2. ❌ Added inline styles `style={{ color: '#000' }}` - CDN strips them
3. ❌ Used `!important` modifier `!text-[#1a1a1a]` - CDN ignores
4. ❌ Removed all color classes entirely - still renders gray
5. ❌ Changed to dark red to test `0 84% 10%` - still gray
6. ❌ Used arbitrary values `text-[#000000]` - still gray
7. ❌ Removed muted system from Tailwind config - still gray
8. ❌ Deleted CSS variables completely - still gray
9. ❌ Hard refresh, clear cache, delete site data - still gray
10. ❌ Deployed to production - STILL GRAY

**ROOT CAUSE:**
The `<style type="text/tailwindcss">` tag in dist/index.html triggers Tailwind's Play CDN, which reprocesses the CSS at runtime and applies default Tailwind colors, ignoring ALL customizations.

**EVIDENCE:**
- Console warning: "cdn.tailwindcss.com should not be used in production"
- Post content text IS black (has no color classes, uses browser default)
- Usernames, headings ARE gray (inherit from Tailwind-processed CSS variables)
- CSS variables compile correctly to black `0 0% 0%` in source
- Browser DevTools show gray color being applied from CDN-generated CSS

### Git Commits (Color Fix Attempts)
```
b9a9f86 - LATEST: Moved CSS vars outside @layer + restored muted vars — STILL FUZZY ❌
4cb68a1 - REMOVE all color overrides - use pure black (#000000) CSS variables only
73d0dfd - Replace inline styles with !important utility classes + fix tribe badges
b8b8955 - Add inline styles with hardcoded dark color (#1a1a1a)
806e624 - FIX: Dark mode CSS overriding light mode
47bce2f - DELETE muted color system completely
32f4a65 - Fix muted-foreground CSS to use DARK readable gray
d1fc265 - Remove ALL text-muted-foreground - replace with explicit colors
237a720 - Fix text color to dark/black across Feed sidebar
```

---

## REMAINING BUGS TO FIX

### 🔴 BUG 1: ALL TEXT RENDERS GRAY/FUZZY (CRITICAL - UNRESOLVED)
**Symptom**: Usernames, headings, sidebar text all appear gray/fuzzy/washed out instead of pure black
**11+ Fix Attempts**: CSS variables, @layer positioning, muted vars restoration, inline styles, !important, text-black — ALL FAILED
**Latest Attempt (b9a9f86)**: Moved CSS variables outside @layer base (unlayered > layered priority), restored --muted/--muted-foreground, added muted to tailwind config, changed nav to text-black — **STILL FUZZY/GRAY**
**Status**: ❌ UNFIXABLE - Requires deeper investigation or Shakespeare build system changes
**Next Step**: Try different approach - maybe the Tailwind CDN is setting global styles with !important or there's a different layer issue

### 🔴 BUG 2: Feed Shows 25+ Minute Old Data (CRITICAL - UNRESOLVED)
**Symptom**: Feed displays stale posts from 25+ minutes ago, even after hard refresh and cache clear
**Possible Causes**:
- Primal cache server caching
- TanStack Query aggressive caching
- Service worker caching
- Browser HTTP cache
**Status**: NEEDS INVESTIGATION
**Next Step**: Check TanStack Query staleTime/cacheTime settings

### 🟡 BUG 3: Stats Not Showing Reliably
**Symptom**: Like/repost/zap counts are 0 or missing
**Status**: NEEDS TESTING
**Next Step**: Verify event_id matching between notes and stats

### ✅ BUG 4: Pink Tribe Badges - FIXED
Changed from pink to gray - working correctly

### ✅ BUG 5: Tab Notification Badge - FIXED
Added pink notification bubble to Latest tab when new posts available

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

## FILES CHANGED THIS SESSION

| File | Changes |
|------|---------|
| `/src/lib/primalCache.ts` | Added PrimalKind enum, link preview parsing |
| `/src/hooks/useFeedPosts.ts` | Added linkPreviews to FeedPost interface |
| `/src/components/FeedPost.tsx` | Pass linkPreviews to NoteContent, fixed username styling |
| `/src/components/NoteContent.tsx` | Added LinkPreviewCard component |
| `/src/pages/Feed.tsx` | Removed frozen posts state, simplified to always show fresh data |

---

## NEXT STEPS

1. **Test on live site** - Check if link previews appear
2. **Compare with Primal** - Are posts the same? In same order?
3. **Debug stats** - If still not showing, add logging to verify ID matching
4. **Investigate feed mismatch** - May need different Primal API method

---

**Last Updated:** February 16, 2026, 8:30 AM

**Peace, LOVE, & Warm Aloha** 🌅💜
