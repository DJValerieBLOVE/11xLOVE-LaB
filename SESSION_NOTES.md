# Session Notes - February 16, 2026

> **STATUS: FEED SYSTEM IMPROVEMENTS MADE - TESTING NEEDED**

---

## MY UNDERSTANDING OF THE PROJECT

### What 11x LOVE LaB Is
A $1,000/year selective coaching community platform built on Nostr. It's a private coaching platform where members:
- Complete "Experiments" (lessons) to grow in 11 life dimensions
- Earn sats for progress (gamification)
- Join "Tribes" (private groups)
- Connect with "Accountability Buddies"
- Get AI coaching from "Magic Mentor"
- Track streaks and achievements

### Architecture
- **Frontend**: React + TailwindCSS + shadcn/ui
- **Identity**: Nostr login (NIP-07/NIP-46)
- **Private Data**: Railway relay (`wss://nostr-rs-relay-production-1569.up.railway.app`)
- **Public Data**: Primal cache + public relays
- **No backend server** - Nostr relays ARE the database

### Feed System Goal
Match Primal's feed functionality EXACTLY:
- Same posts from people you follow
- Same order (newest first)
- Same stats (likes, reposts, zaps, replies)
- Same user actions (did I like/repost/zap this?)
- Fast loading via Primal's WebSocket cache

---

## WHAT HAS BEEN DONE

### Completed Features
1. ✅ App shell with navigation
2. ✅ Nostr login working
3. ✅ Private Railway relay connected
4. ✅ Three-tier privacy system
5. ✅ Experiment catalog and builder
6. ✅ Feed page with tabs (Latest, Tribes, Buddies)
7. ✅ Post composer
8. ✅ FeedPost component with stats display
9. ✅ NoteContent for rich text/media

### Feed System Work Done
1. ✅ Primal WebSocket client (`/src/lib/primalCache.ts`)
2. ✅ Zlib compression enabled for Primal
3. ✅ Feed hooks (`useFollowingPosts`, `useFeedPosts`, `useTribePosts`)
4. ✅ Stats parsing for kind 10000100
5. ✅ User actions parsing for kind 10000115
6. ✅ Profile parsing for kind 0
7. ✅ Note parsing for kind 1 and 6 (reposts)

### THIS SESSION (February 16, 2026)
1. ✅ **Researched ALL Primal custom kinds** from their GitHub repo
2. ✅ **Added complete PrimalKind enum** with 40+ kinds
3. ✅ **Added link preview support** (kind 10000128)
4. ✅ **Added media info support** (kind 10000119)
5. ✅ **Silenced known Primal kinds** that don't need warnings
6. ✅ **Created LinkPreviewCard component** - renders URL cards like Primal
7. ✅ **Updated NoteContent** to display link previews
8. ✅ **Passed linkPreviews through** FeedPost → NoteContent pipeline

---

## CURRENT BUGS

### BUG 1: Feed Shows Different Posts Than Primal
**Symptom**: The posts shown are NOT the same as what Primal shows
**Status**: NEEDS INVESTIGATION

**Possible Causes**:
- Different API method being used (are we calling the right endpoint?)
- Missing parameters in request
- Feed filtering logic differs
- Need to verify we're using `network_feed` or similar

### ~~BUG 2: Unknown Primal Kinds Not Being Handled~~ ✅ FIXED
All Primal custom kinds are now documented and handled:
- `10000107` - Mentions (silenced, not needed for display)
- `10000108` - User Score (silenced)
- `10000113` - Feed Range (silenced, pagination info)
- `10000119` - Media Info (now parsed)
- `10000128` - Link Metadata (now parsed and displayed!)
- `10000129` - Event Zap Info (silenced)
- `10000141` - Relay Hints (silenced)
- `10000158` - Verified Users Dict (silenced)
- `10000168` - Legend Customization (silenced)
- `10000169` - Membership Cohort Info (silenced)

### BUG 3: Stats Not Showing Reliably
**Symptom**: Like/repost/zap counts are 0 or missing
**Status**: NEEDS TESTING
**Possible Causes**:
- Stats being fetched separately but not merged correctly
- Event ID mismatch between notes and stats
- Race condition

### ~~BUG 4: Some Posts Show Raw Text Instead of Previews~~ ✅ FIXED
Link preview support has been added via kind 10000128 parsing and LinkPreviewCard component.

### BUG 5: Posts May Show Raw JSON
**Symptom**: Some posts display JSON instead of content
**Status**: NEEDS TESTING
**Cause**: Event coming as string instead of parsed object (handled in NoteContent)

---

## PRIMAL API RESEARCH NEEDED

### What We Need to Understand
1. **Exact API call Primal uses** for "Following" feed
2. **All custom kinds** and their schemas:
   - 10000107, 10000108, 10000113, 10000119
   - 10000128, 10000129, 10000141
   - 10000158, 10000168, 10000169
3. **Link preview rendering** - how Primal shows URL cards
4. **Image rendering** - how Primal knows dimensions

### Known Primal Kinds (from their codebase)
```typescript
// From primal-web/src/constants.ts
NoteStats = 10_000_100      // likes, reposts, replies, zaps, satszapped
NoteActions = 10_000_115    // liked, replied, reposted, zapped (booleans)
FeedRange = 10_000_113      // pagination info (since, until, order_by)
UserStats = 10_000_105      // follower counts
MediaInfo = 10_000_119      // image dimensions, thumbnails
LinkMetadata = 10_000_128   // og:title, og:description, og:image
```

### Unknown Kinds to Research
- 10000107 - possibly user scores?
- 10000108 - possibly mentions?
- 10000129 - possibly content warnings?
- 10000141 - possibly related events?
- 10000158 - possibly highlights?
- 10000168 - possibly wordcount/readtime?
- 10000169 - possibly article metadata?

---

## NEXT STEPS

### Priority 1: Test Current Changes
1. Deploy and test on live site
2. Check if link previews appear
3. Check if stats display correctly
4. Check console for remaining "Unknown kind" warnings

### Priority 2: Investigate Feed Mismatch (if still an issue)
1. Open primal.net in Network tab
2. See what WebSocket request they make for "Following" feed
3. Compare with our request in primalCache.ts
4. May need to use different Primal API method (e.g., `network_feed` vs `feed`)

### Priority 3: Debug Stats (if still an issue)
1. Add logging to verify event_id matching
2. Check if stats are being parsed from response
3. Verify stats map keys match note IDs

---

## FILES INVOLVED

| File | Purpose | Status |
|------|---------|--------|
| `/src/lib/primalCache.ts` | Primal WebSocket client | ✅ UPDATED - all kinds documented |
| `/src/hooks/useFeedPosts.ts` | Feed data hooks | ✅ UPDATED - passes linkPreviews |
| `/src/components/FeedPost.tsx` | Post component | ✅ UPDATED - passes linkPreviews to NoteContent |
| `/src/components/NoteContent.tsx` | Content renderer | ✅ UPDATED - renders link preview cards |
| `/src/pages/Feed.tsx` | Feed page | ✅ UPDATED - passes linkPreviews to FeedPost |

---

## HOW TO DEBUG

### Check What Primal Returns
Open browser console on primal.net, go to Network tab, filter by WS (WebSocket), look at messages.

### Check What We're Receiving
Our code logs: `[Primal] Unknown kind XXXXX - content preview: ...`

### Compare Posts
1. Open primal.net in one tab
2. Open 11xLOVE LaB in another
3. Compare: Same posts? Same order? Same stats?

---

**Last Updated:** February 16, 2026, 8:30 AM
**Status:** Primal custom kinds documented, link previews implemented
**Next Priority:** Test on live site, investigate feed content mismatch if needed

---

## PRIMAL API REFERENCE (Complete)

### All Primal Custom Kinds (from their codebase)
```typescript
PrimalKind = {
  NoteStats: 10_000_100,        // likes, reposts, replies, zaps
  NetStats: 10_000_101,         // network stats
  LegendStats: 10_000_102,      // legend stats
  UserStats: 10_000_105,        // follower counts
  OldestEvent: 10_000_106,      // oldest event
  Mentions: 10_000_107,         // mentions info
  UserScore: 10_000_108,        // user score
  Notification: 10_000_110,     // notifications
  Timestamp: 10_000_111,        // timestamp
  NotificationStats: 10_000_112, // notification counts
  FeedRange: 10_000_113,        // pagination info
  NoteActions: 10_000_115,      // user actions (liked, reposted, zapped)
  MessageStats: 10_000_117,     // message stats
  MediaInfo: 10_000_119,        // image dimensions
  LinkMetadata: 10_000_128,     // og:title, og:image, og:description
  EventZapInfo: 10_000_129,     // zap info
  RelayHint: 10_000_141,        // relay hints
  VerifiedUsersDict: 10_000_158, // verified users
  LegendCustomization: 10_000_168, // legend settings
  MembershipCohortInfo: 10_000_169, // membership info
  // ... and more (see /src/lib/primalCache.ts for full list)
}
```

### Cache Methods
- `feed` - Following feed (what we use)
- `events` - Stats for specific event IDs
- `user_infos` - Profile metadata for pubkeys
- `network_feed` - May be another feed endpoint to investigate

**Peace, LOVE, & Warm Aloha** 🌅💜
