# Session Notes - February 16, 2026

> **STATUS: FEED SYSTEM IMPROVEMENTS MADE - TESTING NEEDED**

---

## CURRENT SESSION SUMMARY

### What Was Done This Session
1. ✅ **Researched ALL Primal custom kinds** from their GitHub repo (40+ kinds)
2. ✅ **Added PrimalKind enum** with complete documentation
3. ✅ **Added link preview support** (kind 10000128 → LinkPreviewCard)
4. ✅ **Added media info support** (kind 10000119)
5. ✅ **Silenced known Primal kinds** that don't need console warnings
6. ✅ **Created LinkPreviewCard component** - renders URL cards like Primal
7. ✅ **Updated data flow** - linkPreviews now passed through entire pipeline

### Git Commit
```
Add Primal custom kinds support and link previews (2514512)
```

---

## REMAINING BUGS TO FIX

### BUG 1: Feed Shows Different Posts Than Primal ⚠️
**Symptom**: Posts shown are NOT the same as Primal app
**Status**: NEEDS INVESTIGATION
**Next Step**: Compare WebSocket requests between primal.net and our app

### BUG 2: Stats Not Showing Reliably ⚠️
**Symptom**: Like/repost/zap counts are 0 or missing
**Status**: NEEDS TESTING
**Next Step**: Verify event_id matching between notes and stats

### ~~BUG 3: Unknown Primal Kinds~~ ✅ FIXED
All 40+ Primal custom kinds now documented and handled.

### ~~BUG 4: Link Previews Missing~~ ✅ FIXED
LinkPreviewCard component now renders URL cards for kind 10000128.

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
| `/src/components/FeedPost.tsx` | Pass linkPreviews to NoteContent |
| `/src/components/NoteContent.tsx` | Added LinkPreviewCard component |
| `/src/pages/Feed.tsx` | Pass linkPreviews to FeedPost |

---

## NEXT STEPS

1. **Test on live site** - Check if link previews appear
2. **Compare with Primal** - Are posts the same? In same order?
3. **Debug stats** - If still not showing, add logging to verify ID matching
4. **Investigate feed mismatch** - May need different Primal API method

---

**Last Updated:** February 16, 2026, 8:30 AM

**Peace, LOVE, & Warm Aloha** 🌅💜
