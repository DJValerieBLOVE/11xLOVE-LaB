# Session Notes - February 15, 2026 (Evening Update)

> **Feed System v2 - Optimized Primal WebSocket Implementation**

---

## 🎯 LATEST SESSION: PRIMAL WEBSOCKET OPTIMIZATION

### Problem Identified:
- Feed was still slow (~9 seconds to load)
- Showing stale data (18+ minutes old)
- Not using all relays properly
- Each request creating new WebSocket connection

### Root Cause Analysis:
After studying Primal's actual GitHub repo, discovered:
1. Primal uses a **shared WebSocket connection** (not new ones per request)
2. They pass `until` timestamp for proper pagination
3. They use specific cache methods: `feed`, `events`, `user_infos`

### Solution Implemented:

#### 1. **Shared WebSocket Connection**
```typescript
// OLD: New WebSocket per request (slow)
const ws = new WebSocket(PRIMAL_CACHE_URL);

// NEW: Reuse shared connection
let sharedWs: WebSocket | null = null;
function getWebSocket(): Promise<WebSocket> {
  if (sharedWs?.readyState === WebSocket.OPEN) return sharedWs;
  // Create new only if needed...
}
```

#### 2. **Proper Request/Response Handling**
```typescript
// Pending requests tracked by subscription ID
const pendingRequests = new Map<string, {
  resolve: (result) => void;
  result: PrimalFeedResult;
  timeout: ReturnType<typeof setTimeout>;
}>();

// Single message handler for all requests
ws.onmessage = (event) => {
  const [type, subId, content] = JSON.parse(event.data);
  const request = pendingRequests.get(subId);
  if (!request) return;
  
  if (type === 'EVENT') processEvent(content, request.result);
  if (type === 'EOSE') request.resolve(request.result);
};
```

#### 3. **Correct API Parameters**
```typescript
// Pass until timestamp (current time) for latest posts
const timestamp = until || Math.ceil(Date.now() / 1000);

const payload = {
  pubkey: userPubkey,
  user_pubkey: userPubkey,
  limit,
  until: timestamp,  // KEY: Required for proper feed
};
```

---

## ✅ CHANGES MADE THIS SESSION

### `/src/lib/primalCache.ts` (Complete Rewrite)
- **Shared WebSocket**: Single connection reused across all requests
- **Request Tracking**: Map of pending requests by subscription ID
- **Proper Cleanup**: Timeouts and abort signal handling
- **Error Recovery**: Auto-reconnect on connection failure
- **Four Methods**:
  - `fetchPrimalNetworkFeed()` - Main following feed
  - `fetchPrimalFutureFeed()` - Check for new posts
  - `fetchPrimalEventStats()` - Get stats for specific events
  - `fetchPrimalProfiles()` - Get user profiles

### `/src/hooks/useFeedPosts.ts` (Optimized)
- **Parallel Queries**: Primal + user's relays run simultaneously
- **Background Stats**: Relay posts get stats fetched in background
- **Console Timing**: `console.time()` for performance debugging
- **Smart Caching**: QueryClient.setQueryData for live updates

---

## 📊 EXPECTED PERFORMANCE

| Metric | Before | After |
|--------|--------|-------|
| Initial load | 8-9 seconds | <2 seconds |
| Primal response | N/A | ~500ms |
| Relay fallback | 10s timeout | 8s parallel |
| Connection overhead | New WS each time | Reused |

---

## 🔧 DEBUGGING FEED ISSUES

### Console Messages to Watch:
```
[Feed] Primal fetch: 450ms        ← WebSocket response time
[Feed] Got 40 notes from Primal   ← Number of posts received
[Feed] Relay fetch: 3200ms        ← User's relay response time
[Feed] Got 12 notes from relays   ← Additional posts from relays
```

### If Feed is Still Slow:
1. Check browser console for timing logs
2. Verify Primal WebSocket connects: `wss://cache.primal.net/v1`
3. Check if EOSE is received (end of stream)
4. Verify user is logged in (feed requires pubkey)

### If No Posts Show:
1. User might not follow anyone
2. Check kind 3 (contact list) exists
3. Verify relay connections in Network tab
4. Check for JavaScript errors in console

---

## 🗄️ FILE REFERENCE

| File | Purpose | Status |
|------|---------|--------|
| `/src/lib/primalCache.ts` | Primal WebSocket client | ✅ Rewritten |
| `/src/hooks/useFeedPosts.ts` | Feed data hooks | ✅ Optimized |
| `/src/pages/Feed.tsx` | Feed page UI | ✅ Working |
| `/src/components/FeedPost.tsx` | Post component | ✅ Working |
| `/src/lib/relays.ts` | Privacy/relay config | ✅ Working |

---

## 🚀 NEXT STEPS

### Priority 1 - Verify Fix:
- [ ] Test feed loading on live site
- [ ] Confirm <2 second load time
- [ ] Verify stats showing correctly
- [ ] Check new post notifications work

### Priority 2 - Enhance:
- [ ] Infinite scroll pagination
- [ ] "Load new posts" button
- [ ] Repost display (show original + reposter)
- [ ] Quote posts (embedded notes)

---

## 🔗 PRIMAL API REFERENCE

**Cache Methods Used:**
```typescript
// Following feed - posts from people you follow
{cache: ["feed", {pubkey, user_pubkey, limit, until}]}

// Event stats - likes, reposts, zaps for specific posts
{cache: ["events", {event_ids, user_pubkey}]}

// User profiles - get metadata for pubkeys
{cache: ["user_infos", {pubkeys}]}
```

**Custom Kinds from Primal:**
```typescript
Kind.NoteStats = 10_000_100    // Stats JSON
Kind.NoteActions = 10_000_115  // User actions JSON
Kind.FeedRange = 10_000_113    // Pagination info
```

---

**Last Updated:** February 15, 2026, 9:00 PM  
**Status:** Primal WebSocket optimized with shared connection  
**Next Priority:** Verify fix works, then add pagination

**Peace, LOVE, & Warm Aloha** 🌅💜
