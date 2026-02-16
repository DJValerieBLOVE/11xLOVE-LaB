# HANDOFF TO OPUS 4.6 - CRITICAL BUGS

**Date**: February 16, 2026  
**Previous AI**: Claude Sonnet 4.5  
**Project**: 11x LOVE LaB (Nostr coaching platform)  
**Status**: 2 critical production bugs - unfixable by Sonnet 4.5

---

## IMMEDIATE PROBLEMS TO FIX

### 🔴 CRITICAL BUG #1: All Text Renders Gray Instead of Black

**What the user wants:**
- ALL text (usernames, headings, sidebar items) should be PURE BLACK like the post content text
- NO muted/gray colors anywhere
- User has asked 6+ times, cleared browser data, hard refreshed - NOTHING works

**Current state:**
- Post content text: BLACK ✅ (correct)
- Usernames (e.g., "mike", "TFTC"): GRAY ❌ (wrong)
- "Your Feed" heading: GRAY ❌ (wrong)
- "My Tribes" heading: GRAY ❌ (wrong)
- All sidebar text: GRAY ❌ (wrong)

**Root cause (suspected):**
Shakespeare build system outputs `<style type="text/tailwindcss">` which triggers Tailwind Play CDN to reprocess CSS at runtime, overriding all custom color values with gray defaults.

**Evidence:**
- Console warning: "cdn.tailwindcss.com should not be used in production"
- Source CSS correctly has `--foreground: 0 0% 0%` (black)
- Browser renders gray anyway
- 10+ fix attempts documented in CRITICAL_BUGS.md

**Key files:**
- `/src/index.css` - CSS variables (set to black, not working)
- `/src/components/FeedPost.tsx` - Usernames rendering gray
- `/src/pages/Feed.tsx` - Headings rendering gray
- `/dist/index.html` - Has `<style type="text/tailwindcss">` tag

---

### 🔴 CRITICAL BUG #2: Feed Shows 25+ Minute Old Posts

**What the user wants:**
- Feed should show LATEST posts (within last few minutes)
- Refresh button should fetch NEW data

**Current state:**
- Feed stuck showing posts from 25+ minutes ago
- Persists through refresh, hard refresh, cache clear, logout/login
- User has deleted ALL browser data - still shows old posts

**Possible causes:**
1. Primal cache server (`wss://cache.primal.net/v1`) returning stale data
2. TanStack Query caching too aggressively
3. Service worker caching (console shows "ServiceWorker already registered")
4. Missing `since` timestamp in WebSocket requests

**Key files:**
- `/src/hooks/useFeedPosts.ts` - TanStack Query config, needs investigation
- `/src/lib/primalCache.ts` - Primal WebSocket client

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

**Privacy:**
- 🔴 NEVER shareable: Tribe messages (kinds 9, 11, 12)
- 🟡 PRIVATE by default: Big Dreams, Journals (kind 30078, NIP-44 encrypted)
- 🟢 SHAREABLE: Feed posts, completions (kind 1)

---

## WHAT WORKS

✅ Nostr login (NIP-07 / NIP-46)  
✅ Feed displays posts (but old data)  
✅ Primal integration (stats, link previews)  
✅ Tribe badges changed to gray  
✅ Notification badge on Latest tab  
✅ Layout, navigation, routing  
✅ Post composer  

---

## WHAT'S BROKEN

❌ Text colors (gray instead of black)  
❌ Feed data (25+ minutes old)  
❌ Stats sometimes don't show  

---

## REPOSITORY & DEPLOYMENT

- **Repo**: https://github.com/DJValerieBLOVE/11xLOVE-LaB.git
- **Live Site**: https://11xLOVE.shakespeare.wtf
- **Project Dir**: `/projects/11xlove-lab`

---

## PREVIOUS AI ATTEMPTS (ALL FAILED)

Claude Sonnet 4.5 tried 10+ different approaches over 100+ messages:
1. Changed CSS variables to black
2. Added inline styles
3. Used !important modifiers
4. Removed all color classes
5. Deleted muted color system
6. Tried dark red test colors
7. Added arbitrary color values
8. Modified Tailwind config
9. Fixed CSS selector specificity
10. Removed all overrides
11. ❌ **LATEST ATTEMPT (Sonnet 4.5)**: Moved CSS variables outside @layer, restored muted-foreground — STILL FUZZY/GRAY

**NONE of these worked.** Text is still gray/fuzzy.

See `/projects/11xlove-lab/CRITICAL_BUGS.md` for complete details.

---

## COLOR SPECIFICATION (WHAT SHOULD BE)

**ALL TEXT SHOULD BE BLACK:**
- Usernames: Pure black #000000
- Headings: Pure black #000000
- Post content: Pure black #000000
- Sidebar items: Pure black #000000

**ONLY THESE SHOULD BE GRAY:**
- Timestamps ("25 minutes ago"): text-gray-500 (#6B7280)
- Member counts ("24 members"): text-gray-500
- Subtle metadata: text-gray-500

**BRAND COLORS:**
- Purple #6600ff: Links, icons, primary actions
- Pink #eb00a8: Badges, highlights (but NOT tribe badges - those are gray now)
- Orange: Zaps/sats
- Red: Live indicators

---

## DEBUGGING STARTING POINTS

### For Text Color Bug:

1. Inspect element in browser DevTools - what color is actually being applied?
2. Check if Tailwind Play CDN can be disabled in Shakespeare settings
3. Look at computed CSS - is `--foreground` gray or black?
4. Try setting `color: #000 !important;` directly in browser console
5. Check if there's a way to use standard `<style>` tag instead of `<style type="text/tailwindcss">`

### For Stale Data Bug:

1. Check `/src/hooks/useFeedPosts.ts` - TanStack Query config (staleTime, cacheTime)
2. Check `/src/lib/primalCache.ts` - Are we sending `since` timestamp?
3. Add debug logging to see what timestamp we're requesting vs receiving
4. Check if service worker is caching (disable it and test)
5. Check browser Network tab → WS → what data is Primal actually sending?

---

## FILES TO READ FIRST

1. `/projects/11xlove-lab/CRITICAL_BUGS.md` - Detailed bug analysis
2. `/projects/11xlove-lab/SESSION_NOTES.md` - Session history
3. `/projects/11xlove-lab/PLAN.md` - Project goals and architecture
4. `/projects/11xlove-lab/src/index.css` - Color variables
5. `/projects/11xlove-lab/src/hooks/useFeedPosts.ts` - Feed data fetching

---

## GIT HISTORY (Recent Commits)

```bash
4cb68a1 - REMOVE all color overrides - use pure black (#000000) CSS variables only
73d0dfd - Replace inline styles with !important utility classes + fix tribe badges
b8b8955 - Add inline styles with hardcoded dark color (#1a1a1a)
806e624 - FIX: Dark mode CSS overriding light mode
47bce2f - DELETE muted color system completely
32f4a65 - Fix muted-foreground CSS to use DARK readable gray
d1fc265 - Remove ALL text-muted-foreground - replace with explicit colors
```

All of these commits attempted to fix the gray text - none worked.

---

## PLEASE HELP FIX:

1. **Make ALL text pure black** (same color as post content)
2. **Make feed show latest posts** (not 25+ minutes old)

The user is very frustrated after 6+ requests and 100+ messages with no resolution.

Thank you! 🙏
