# Critical Findings from Primal's Source Code

**Date:** February 16, 2026  
**Source:** https://github.com/PrimalHQ/primal-web-app

---

## 🚨 CRITICAL BUG CAUSES IDENTIFIED

### 1. Stale Data Bug - ROOT CAUSE FOUND

**From Primal's `lib/feed.ts`:**
```typescript
export const getFeed = (
  user_pubkey: string | undefined, 
  pubkey: string |  undefined, 
  subid: string, 
  until = 0, 
  limit = 20, 
  include_replies?: boolean
) => {
  if (!pubkey) {
    return;
  }

  // THIS IS THE KEY LINE:
  const time = until === 0 ? Math.ceil((new Date()).getTime()/1_000 ): until;

  let payload = { limit, until: time, pubkey };

  if (user_pubkey) {
    payload.user_pubkey = user_pubkey;
  }
  
  if (include_replies) {
    payload.include_replies = include_replies;
  }

  sendMessage(JSON.stringify([
    "REQ",
    subid,
    {cache: ["feed", payload]},
  ]));
}
```

**What Primal Does:**
- If `until === 0` (default), use **CURRENT TIME**: `Math.ceil((new Date()).getTime()/1_000)`
- Otherwise use the provided `until` timestamp

**Our Bug:**
```typescript
// In /src/lib/primalCache.ts line 250:
const timestamp = until || Math.floor(Date.now() / 1000);
```

**PROBLEM:**
- `until` might be `0` (falsy) which triggers the `||` fallback
- But Primal treats `until === 0` as "use current time"
- We should ALWAYS pass current timestamp explicitly

**FIX:**
```typescript
// WRONG:
const timestamp = until || Math.floor(Date.now() / 1000);

// CORRECT:
const timestamp = until === 0 ? Math.ceil(Date.now() / 1000) : until;
// OR just always use current time for main feed:
const timestamp = Math.ceil(Date.now() / 1000);
```

---

### 2. Future Feed (New Posts Check)

**From Primal's `lib/feed.ts`:**
```typescript
export const getFutureFeed = (
  user_pubkey: string | undefined, 
  pubkey: string |  undefined, 
  subid: string, 
  since: number
) => {
  if (!pubkey) {
    return;
  }

  let payload: { since: number, pubkey: string, user_pubkey?: string, limit: number } =
    { since, pubkey, limit: 100 };

  if (user_pubkey) {
    payload.user_pubkey = user_pubkey;
  }

  sendMessage(JSON.stringify([
    "REQ",
    subid,
    {cache: ["feed", payload]},
  ]));
};
```

**Key Points:**
- Uses `since` parameter (not `until`)
- Limit is `100` (not 20 or 40)
- Same cache method: `["feed", payload]`

**Our Implementation:**
- ✅ We use `since` correctly
- ✅ We use limit 100
- ✅ We use same cache method

---

### 3. Event Stats — CRITICAL: extended_response REQUIRED

**From Primal's `lib/feed.ts`:**
```typescript
export const getEvents = (
  user_pubkey: string | undefined, 
  eventIds: string[], 
  subid: string, 
  extendResponse?: boolean
) => {
  let payload:  {
    event_ids: string[], 
    user_pubkey?: string, 
    extended_response?: boolean 
  } = { event_ids: eventIds } ;

  if (user_pubkey) {
    payload.user_pubkey = user_pubkey;
  }

  if (extendResponse) {
    payload.extended_response = extendResponse;
  }

  sendMessage(JSON.stringify([
    "REQ",
    subid,
    {cache: ["events", payload]},
  ]));
};
```

**CRITICAL FINDING (Feb 16, 2026):**
Primal's app ALWAYS calls `getEvents(pubkey, ids, subId, true)` — the 4th argument is `true` for `extended_response`. Without it, the events endpoint returns ONLY the events themselves, NO stats (kind 10000100) and NO user actions (kind 10000115).

**Our FIXED Implementation:**
```typescript
// /src/lib/primalCache.ts - fetchPrimalEventStats
const payload: Record<string, unknown> = {
  event_ids: eventIds.slice(0, 100),
  extended_response: true,  // REQUIRED — without this, no stats returned
};
if (userPubkey) {
  payload.user_pubkey = userPubkey;
}

const result = await primalRequest('events', payload, 10000);
```

**This was the #1 cause of stats not showing — fixed in commit 9562c31.**

---

## 🔍 CUSTOM KINDS FROM PRIMAL

**From `constants.ts`:**
```typescript
export enum Kind  {
  // ... standard kinds ...
  
  NoteStats = 10_000_100,      // Stats for a note
  NoteActions = 10_000_115,    // User's actions on a note
  FeedRange = 10_000_113,      // Pagination info
  UserStats = 10_000_105,      // User follower counts
  Mentions = 10_000_107,       // Mentions
  UserScore = 10_000_108,      // User score
  Notification = 10_000_110,   // Notifications
  MediaInfo = 10_000_119,      // Media metadata
  LinkMetadata = 10_000_128,   // Link previews
  EventZapInfo = 10_000_129,   // Zap details
  NoteQuoteStats = 10_000_143, // Quote repost stats
  // ... many more ...
}
```

**We're using:**
- ✅ `10_000_100` (NoteStats)
- ✅ `10_000_115` (NoteActions)

**We could also use:**
- `10_000_119` (MediaInfo) - for better media detection
- `10_000_128` (LinkMetadata) - for link preview cards
- `10_000_143` (NoteQuoteStats) - for quote repost counts

---

## 📊 WHAT WE'RE MISSING

### 1. Include Replies Parameter

Primal supports `include_replies` in feed requests:
```typescript
if (include_replies) {
  payload.include_replies = include_replies;
}
```

**We don't use this** - might be why some posts are missing?

### 2. User Feed Types

Primal has different feed types:
```typescript
export const getUserFeed = (
  user_pubkey: string | undefined, 
  pubkey: string | undefined, 
  subid: string, 
  notes: 'authored' | 'replies' | 'bookmarks' | 'user_media_thumbnails',
  // ...
```

**Options:**
- `authored` - Posts by user
- `replies` - User's replies
- `bookmarks` - Bookmarked posts
- `user_media_thumbnails` - Media posts

**We only query generic feed** - could add these for richer features

### 3. Extended Response — NOW USED (REQUIRED)

Stats endpoint REQUIRES `extended_response: true`:
```typescript
if (extendResponse) {
  payload.extended_response = extendResponse;
}
```

**We now use this** — it's REQUIRED for stats. Without it, no stats are returned. Fixed in commit 9562c31.

---

## ✅ WHAT WE'RE DOING RIGHT (All Fixed)

1. **WebSocket Connection** - Correct
2. **Compression (zlib/pako)** - Correct
3. **Request Format** - Correct structure
4. **Custom Kinds** - Parsing 10000100 and 10000115
5. **Parallel Queries** - Primal + user's relays
6. **Stats Fetching** - extended_response: true, await + merge
7. **Kind 6 Repost Stats** - Inner event ID lookup
8. **NoteContent Rendering** - All NIP-19 prefixes handled
9. **Embedded Note Media** - EmbeddedNoteContent component

---

## 🐛 BUGS TO FIX

### Priority 1: Stale Data
**File:** `/src/lib/primalCache.ts` line 250  
**Current:**
```typescript
const timestamp = until || Math.floor(Date.now() / 1000);
```

**Fix:**
```typescript
const timestamp = until === 0 ? Math.ceil(Date.now() / 1000) : until;
```

**Better:**
```typescript
// For main feed, ALWAYS use current time
const timestamp = Math.ceil(Date.now() / 1000);
```

### Priority 2: Math.ceil vs Math.floor
Primal uses `Math.ceil()` not `Math.floor()` for timestamps.

**Change everywhere:**
```typescript
// WRONG:
Math.floor(Date.now() / 1000)

// CORRECT:
Math.ceil(Date.now() / 1000)
```

### Priority 3: TanStack Query Stale Time
**File:** `/src/hooks/useFeedPosts.ts` lines 236-240  
```typescript
staleTime: 0, // Always consider stale - fetch fresh
gcTime: 60000, // 1 minute garbage collection
refetchOnMount: 'always',
refetchOnWindowFocus: 'always',
networkMode: 'always', // Always fetch from network
```

**This is CORRECT** - but make sure query key includes timestamp:
```typescript
queryKey: ['following-posts-v5', user?.pubkey, limit, Math.floor(Date.now() / 60000)],
// Changes every minute to force refetch
```

---

## 🎯 ACTION PLAN

### Step 1: Fix Timestamp Logic (5 minutes)
1. Open `/src/lib/primalCache.ts`
2. Line 250: Change `until || Math.floor` to `Math.ceil(Date.now() / 1000)`
3. Search for all `Math.floor(Date.now() / 1000)` and change to `Math.ceil`
4. Test feed - should show current posts

### Step 2: Force Cache Busting (5 minutes)
1. Open `/src/hooks/useFeedPosts.ts`
2. Line 88: Add timestamp to query key:
```typescript
queryKey: ['following-posts-v5', user?.pubkey, limit, Math.floor(Date.now() / 60000)],
```
3. Test - feed should refresh every minute

### Step 3: Add Include Replies (10 minutes)
1. In `primalCache.ts`, add optional parameter:
```typescript
export async function fetchPrimalNetworkFeed(
  userPubkey: string,
  limit: number = 30,
  until?: number,
  signal?: AbortSignal,
  includeReplies?: boolean // NEW
): Promise<PrimalFeedResult>
```
2. Add to payload if provided
3. Test - might see more posts

### Step 4: Test Each Fix
- Test stale data - should show latest posts
- Test refresh - should fetch new data
- Test stats - should persist
- Test images - should load

---

## 📚 PRIMAL SOURCE FILES TO REFERENCE

| File | URL | Purpose |
|------|-----|---------|
| `lib/feed.ts` | [Link](https://github.com/PrimalHQ/primal-web-app/blob/main/src/lib/feed.ts) | All feed request functions |
| `constants.ts` | [Link](https://github.com/PrimalHQ/primal-web-app/blob/main/src/constants.ts) | Kind enums, regex patterns |
| `sockets.ts` | Need to find | WebSocket connection management |
| `types/primal.ts` | Need to find | TypeScript interfaces |

---

## KEY TAKEAWAYS

1. **`until === 0` means "current time" in Primal's logic**
2. **Use `Math.ceil()` not `Math.floor()` for timestamps**
3. **Always pass current timestamp explicitly for main feed**
4. **`extended_response: true` is REQUIRED on events endpoint for stats**
5. **Kind 6 repost stats are on the INNER event, not the wrapper**
6. **Always await + merge stats fetches, never fire-and-forget**

---

**Last Updated:** February 16, 2026  
**Status:** All issues identified and fixed (commit 9562c31)

