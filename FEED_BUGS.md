# Feed System Bugs - February 15, 2026

## Critical Issues to Fix

### BUG 1: Feed Shows Stale/Old Data
**Symptom:** Feed loads posts from 1+ hour ago instead of current posts. Manual refresh briefly shows new data, then reverts to old data.

**Likely Causes:**
1. TanStack Query caching not being bypassed properly
2. Primal WebSocket returning cached data
3. React component re-rendering with stale state

**Debug Steps:**
- Check browser console for `[Feed] Calling Primal with until:` timestamp
- Compare timestamp with current time
- Check if EOSE is received before timeout
- Monitor if query is being re-executed with old params

---

### BUG 2: Raw JSON Displayed Instead of Parsed Content
**Symptom:** Some posts show raw JSON like:
```
{"id":"b8e1eec2eb10d6036e3f02fde74b5148258b6e0e5173f2c8a5b4b6c651e642fe","pubkey":"4eb88310d6b4ed95c6d66a395b3d3cf559b85faec8f7691dafd405a92e055d6d"...
```

**Likely Causes:**
1. Events from Primal coming as JSON strings instead of objects
2. `processEvent()` not parsing string events correctly
3. NoteContent receiving stringified event

**Debug Steps:**
- Add `console.log(typeof event, event)` at start of NoteContent
- Check `processEvent()` is calling JSON.parse on string events
- Verify event.content exists and is a string

---

### BUG 3: Images Not Loading
**Symptom:** Posts with images show no images at all

**Likely Causes:**
1. Image URL detection regex not matching Blossom/CDN URLs
2. Images being hidden by `onError` handler
3. CORS issues blocking images

**Debug Steps:**
- Log `mediaItems` array in NoteContent to see detected images
- Check browser Network tab for failed image requests
- Verify image URLs are being extracted from content

---

### BUG 4: Links Not Working
**Symptom:** Clickable links in posts don't navigate properly

**Likely Causes:**
1. URL regex not capturing links correctly
2. React Router conflicts with external links
3. Links being stripped when removing media URLs

**Debug Steps:**
- Check if `<a>` tags are being rendered in DOM
- Verify href attributes are correct
- Test with target="_blank" on external links

---

### BUG 5: Stats Sometimes Show, Sometimes Don't
**Symptom:** Likes/zaps/reposts intermittently display

**Likely Causes:**
1. Stats from Primal not being parsed (kind 10000100)
2. Stats Map key mismatch with event IDs
3. Race condition in async stats fetching

**Debug Steps:**
- Log `primalResult.stats.size` after fetch
- Check if stats event_id matches note id
- Verify stats are being passed to FeedPost component

---

## Files Involved

| File | Purpose |
|------|---------|
| `/src/lib/primalCache.ts` | WebSocket client for Primal API |
| `/src/hooks/useFeedPosts.ts` | Feed data fetching hooks |
| `/src/components/NoteContent.tsx` | Renders post content, links, images |
| `/src/components/FeedPost.tsx` | Post card with stats and actions |
| `/src/pages/Feed.tsx` | Feed page with tabs |

---

## Primal API Reference

**WebSocket URL:** `wss://cache.primal.net/v1`

**Protocol:**
1. Connect with `binaryType = 'arraybuffer'`
2. Enable compression: `["REQ", subId, {cache: ["set_primal_protocol", {compression: "zlib"}]}]`
3. Wait for EOSE on protocol message
4. Send actual request (feed, events, user_infos)
5. Decompress responses with pako.inflate()

**Feed Request:**
```json
["REQ", "feed_123", {"cache": ["feed", {
  "pubkey": "USER_PUBKEY",
  "user_pubkey": "USER_PUBKEY", 
  "limit": 40,
  "until": 1771211234
}]}]
```

**Response Kinds:**
- `kind 0` = Profile metadata
- `kind 1` = Notes
- `kind 6` = Reposts
- `kind 10000100` = Stats (JSON in content: likes, reposts, zaps, etc.)
- `kind 10000115` = User actions (JSON: liked, reposted, zapped booleans)

---

## Tomorrow's Action Plan

1. **Add extensive logging** to track data flow:
   - Log raw WebSocket messages before parsing
   - Log each event as it's processed
   - Log final posts array before returning

2. **Test Primal API directly** in browser console:
   ```javascript
   const ws = new WebSocket('wss://cache.primal.net/v1');
   ws.onmessage = (e) => console.log(e.data);
   ws.onopen = () => ws.send(JSON.stringify(["REQ", "test", {cache: ["feed", {pubkey: "YOUR_PUBKEY", limit: 5}]}]));
   ```

3. **Compare with Primal app** - open primal.net in another tab and compare:
   - Same posts showing?
   - Same order?
   - Same stats?

4. **Consider fallback** - if Primal API is unreliable, query relays directly

---

## Current State

- Primal WebSocket connects successfully
- Compression/decompression works (stats showing)
- Some posts render correctly with content
- Other posts show raw JSON (parsing issue)
- Images not detected/displayed
- Feed reverts to old data after initial load

---

**Last Updated:** February 15, 2026, 8:25 PM
