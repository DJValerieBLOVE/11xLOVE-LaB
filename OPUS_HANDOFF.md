# 🎯 OPUS: Feed Debugging Handoff

**Date:** February 16, 2026  
**Status:** ROOT CAUSE IDENTIFIED - Ready to fix  
**Priority:** HIGH - Feed shows stale data

---

## 📋 READ THESE FIRST (In Order)

1. **THIS FILE** - Start here
2. **PRIMAL_SOURCE_FINDINGS.md** - Root cause from Primal's source
3. **FEED_BUGS.md** - All 5 bugs documented
4. **FEED_SYSTEM_SUMMARY.md** - Complete architecture overview

---

## 🚨 CRITICAL CONTEXT

### The Problem
Yesterday we spent 4 hours debugging the feed with Sonnet. Multiple bugs:
1. **Stale data** - Shows old posts, reverts after refresh
2. **Raw JSON** - Some posts show JSON instead of content
3. **Images broken** - Not loading
4. **Links broken** - Not working
5. **Stats intermittent** - Sometimes missing

### What We Know NOW
I just analyzed **Primal's actual source code** and found the root cause of bug #1 (stale data).

---

## 🎯 THE ROOT CAUSE (Bug #1)

### File: `/src/lib/primalCache.ts` Line 250

**CURRENT CODE (WRONG):**
```typescript
const timestamp = until || Math.floor(Date.now() / 1000);
```

**PRIMAL'S CODE (CORRECT):**
```typescript
const time = until === 0 ? Math.ceil((new Date()).getTime()/1_000 ): until;
```

### Why It's Broken
- `until` can be `0` (falsy), so `||` uses fallback
- But Primal treats `until === 0` as "use CURRENT time"
- We're using old cached timestamp instead of fresh one

### The Fix
```typescript
// Option 1: Match Primal exactly
const timestamp = until === 0 ? Math.ceil(Date.now() / 1000) : until;

// Option 2: Always use current time (simpler for main feed)
const timestamp = Math.ceil(Date.now() / 1000);
```

**ALSO:**
- Change ALL `Math.floor(Date.now() / 1000)` to `Math.ceil(Date.now() / 1000)`
- Primal uses `Math.ceil()`, not `Math.floor()`

---

## 🔧 QUICK FIX STEPS

### Step 1: Fix Timestamp (5 min)
1. Open `/src/lib/primalCache.ts`
2. Go to line 250 (in `fetchPrimalNetworkFeed` function)
3. Change:
   ```typescript
   const timestamp = until || Math.floor(Date.now() / 1000);
   ```
   To:
   ```typescript
   const timestamp = Math.ceil(Date.now() / 1000);
   ```
4. Save, test - **Bug #1 should be FIXED**

### Step 2: Fix All Math.floor → Math.ceil (5 min)
Search entire codebase for:
```typescript
Math.floor(Date.now() / 1000)
```
Replace with:
```typescript
Math.ceil(Date.now() / 1000)
```

### Step 3: Test Feed
1. Open https://11xLOVE.shakespeare.wtf
2. Go to Feed page
3. Check if Latest tab shows CURRENT posts
4. Refresh - posts should stay current (not revert to old)

---

## 🐛 OTHER BUGS (Lower Priority)

### Bug #2: Raw JSON Display
**File:** `/src/components/NoteContent.tsx` lines 114-122  
**Issue:** Events coming as strings, not objects  
**Fix:** Ensure events are parsed before passing to component

### Bug #3: Images Not Loading
**File:** `/src/components/NoteContent.tsx` lines 50-88  
**Issue:** URL detection regex doesn't match all Blossom/CDN hosts  
**Fix:** Add more hosts to `IMAGE_HOSTS` array or improve regex

### Bug #4: Links Not Working
**File:** `/src/components/NoteContent.tsx` lines 210-226  
**Issue:** Links being stripped when removing media URLs  
**Fix:** Better filtering logic in `processedContent`

### Bug #5: Stats Intermittent
**File:** `/src/hooks/useFeedPosts.ts` lines 186-222  
**Issue:** Race condition in background stats fetch?  
**Fix:** Await stats before updating posts, or use proper state management

---

## ✅ WHAT'S ALREADY CORRECT

1. **Architecture** - Solid, matches Primal
2. **WebSocket** - Connecting successfully
3. **Compression** - zlib/pako working
4. **Privacy system** - 3-tier (Never/Private/Shareable)
5. **Parallel queries** - Primal + user's relays
6. **Stats parsing** - Kind 10000100 & 10000115

**The foundation is GOOD. Just timestamp bugs.**

---

## 🔐 PRIVACY RULES (CRITICAL)

### Three Tiers:
```
🔴 NEVER SHAREABLE
   ├─ Tribes (kinds 9, 11, 12)
   ├─ Buddies (accountability partners)
   └─ NO share button, lock badge

🟡 PRIVATE BY DEFAULT  
   ├─ Big Dreams, journals (kind 30078)
   ├─ NIP-44 encrypted
   └─ Optional share with warning

🟢 SHAREABLE
   ├─ Feed posts (kind 1)
   └─ User chooses: LaB only OR LaB + public
```

### Feed Tabs:
| Tab | Privacy | Share Button |
|-----|---------|--------------|
| Latest | Public | ✅ Yes |
| Tribes | Private | ❌ NO |
| Buddies | **PRIVATE** | **❌ NO** |

**CRITICAL:** Buddies tab is NEVER shareable. It's private messages with accountability partners.

---

## 📁 KEY FILES

### Feed System:
- `/src/lib/primalCache.ts` - **FIX THIS FIRST** (line 250)
- `/src/hooks/useFeedPosts.ts` - Feed data hooks
- `/src/components/NoteContent.tsx` - Content rendering
- `/src/pages/Feed.tsx` - Feed UI

### Privacy:
- `/src/lib/relays.ts` - Privacy levels
- `/src/hooks/useLabPublish.ts` - Secure publishing

### Documentation:
- `PRIMAL_SOURCE_FINDINGS.md` - **Read this** for root cause
- `FEED_BUGS.md` - All 5 bugs detailed
- `FEED_SYSTEM_SUMMARY.md` - Complete overview

---

## 🎯 TERMINOLOGY (STRICT)

| ✅ Always Use | ❌ NEVER Use |
|---------------|--------------|
| Experiments | Courses, lessons |
| Tribes | Communities, groups |
| LaB | Lab, LAB |
| Sats | Points |
| Zap | Tip |
| Buddies | Friends |

---

## 🚀 SUCCESS CRITERIA

### Must Fix:
1. **Stale data** - Shows current posts, doesn't revert
2. **Raw JSON** - All posts render as text
3. **Images** - Load correctly
4. **Links** - Clickable and work
5. **Stats** - Always show

### Nice to Have:
- Faster load times
- Better error handling
- More detailed logging

---

## 💰 COST AWARENESS

This debugging session yesterday cost significant money with no results. Let's be efficient:

1. **Fix bug #1 FIRST** (timestamp) - 10 minutes max
2. **Test it** - Does stale data persist? If yes, move to #2
3. **Fix bugs one at a time** - Don't change multiple files at once
4. **Test each fix** - Confirm before moving to next

**If stuck after 30 minutes, STOP and report what you found.**

---

## 🧪 TESTING

### Manual Test Checklist:
```
Feed Page (Latest Tab):
[ ] Shows posts from last hour (not 18+ minutes old)
[ ] Refresh keeps showing current posts (doesn't revert)
[ ] Stats display (likes, zaps, reposts)
[ ] Images load and display
[ ] Links are clickable
[ ] No raw JSON visible
[ ] User actions highlighted (filled heart if liked)

Feed Page (Tribes Tab):
[ ] Shows only private tribe posts
[ ] Lock badge visible
[ ] NO share button (privacy enforced)

Feed Page (Buddies Tab):
[ ] Shows only buddy messages
[ ] Lock badge visible  
[ ] NO share button (NEVER shareable)
```

### Browser Console Checks:
```
Look for these logs:
✅ "[Feed] Calling Primal with until: [CURRENT_TIMESTAMP]"
✅ "[Feed] Got X notes from Primal"
✅ "[Primal] feed: X notes, Y profiles, Z stats"

⚠️ Red flags:
❌ "until: 1739550000" (old timestamp from 18 min ago)
❌ "Failed to parse event string"
❌ "TypeError: Cannot read property 'content'"
```

---

## 🎬 YOUR MISSION

1. **Read PRIMAL_SOURCE_FINDINGS.md** (5 min)
2. **Fix timestamp bug** in primalCache.ts line 250 (5 min)
3. **Test on live site** - does it show current posts? (5 min)
4. **If fixed:** Move to bug #2 (raw JSON)
5. **If NOT fixed:** Report what you see in console

**Total time estimate:** 15-60 minutes depending on bugs

---

## 📝 REPORTING BACK

When done, tell the user:

```
✅ FIXED: [List what's working]
⚠️ PARTIAL: [List what's improved but not perfect]
❌ BROKEN: [List what still doesn't work]

Next steps: [What to tackle next]
```

---

## 🆘 IF YOU GET STUCK

1. **Check console** - What errors appear?
2. **Read FEED_BUGS.md** - Debug steps for each bug
3. **Test Primal API directly** - Use browser console WebSocket test
4. **Compare with primal.net** - Open side-by-side, same posts?
5. **Report findings** - Don't waste time guessing

---

## 💜 FINAL NOTES

- **The user is frustrated** - Yesterday was expensive and unproductive
- **The code is good** - Just timestamp bugs, not architecture
- **Be efficient** - Fix one thing, test, move on
- **Communicate clearly** - What worked, what didn't
- **Privacy is CRITICAL** - Never expose private data

**You've got this. The root cause is identified. Just execute the fix.** 🚀

---

**Last Updated:** February 16, 2026  
**Next Action:** Fix primalCache.ts line 250, test, report  
**Estimated Time:** 15-30 minutes for bug #1

Peace, LOVE, & Warm Aloha 💜
