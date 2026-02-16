# 11x LOVE LaB Feed System - Complete Summary

**Last Updated:** February 16, 2026  
**Status:** ALL CRITICAL BUGS FIXED — See AGENTS.md for prevention rules

---

## 🎯 WHAT WE'RE BUILDING

A **hybrid Nostr feed** that combines:
1. **Public Nostr posts** (like Primal) - fast, with stats/reactions
2. **Private LaB content** - encrypted, Tribe posts, experiments
3. **Privacy controls** - 3-tier system (Never/Private/Shareable)

**Goal:** Match Primal's speed/UX for public feed, add privacy layer for LaB content.

---

## 📊 HOW PRIMAL WORKS (Our Public Feed Foundation)

### Primal's Architecture
Primal uses a **WebSocket cache server** (`wss://cache.primal.net/v1`) that:
- Pre-indexes Nostr events from major relays
- Calculates engagement stats (likes, zaps, reposts) server-side
- Returns **everything in one WebSocket response**: notes + profiles + stats + user actions
- Uses **zlib compression** for efficiency

### What Primal Sends (Custom Kinds):
```
Kind 0:        User profiles (standard Nostr)
Kind 1:        Notes/posts (standard Nostr)
Kind 6:        Reposts (standard Nostr)
Kind 10000100: Stats (PRIMAL CUSTOM - likes, zaps, reposts counts)
Kind 10000115: User Actions (PRIMAL CUSTOM - did you like/zap this?)
```

### Primal Request Format:
```json
["REQ", "feed_123", {
  "cache": ["feed", {
    "pubkey": "USER_HEX_PUBKEY",
    "user_pubkey": "USER_HEX_PUBKEY",
    "limit": 40,
    "until": 1771234567  // Current timestamp - CRITICAL for latest posts
  }]
}]
```

**Key Insight from Primal's Source Code:**
```typescript
// From Primal's lib/feed.ts
const time = until === 0 ? Math.ceil((new Date()).getTime()/1_000 ): until;

let payload = { limit, until: time, pubkey };
```

**CRITICAL:** The `until` parameter:
- MUST be `Math.ceil(Date.now() / 1000)` for current timestamp
- If `until === 0`, Primal uses CURRENT time (not old data)
- If missing or old timestamp, you get STALE data
- This is why feed shows old posts!

---

## 🏗️ HOW 11x LOVE LaB FEED WORKS

### Our Hybrid Approach:

```
┌─────────────────────────────────────────────────────────┐
│                   FEED ARCHITECTURE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PUBLIC FEED (Latest Tab)                              │
│  ├─ Primal Cache: Fast, with stats                     │
│  └─ User's Relays: Backup for posts Primal missed      │
│                                                         │
│  PRIVATE FEED (Tribes Tab)                             │
│  └─ Railway Relay ONLY: Private NIP-29 group messages  │
│                                                         │
│  BUDDIES FEED (Buddies Tab) - NEVER SHAREABLE          │
│  └─ Railway relay ONLY: Private messages with buddies  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Feed Tabs:
| Tab | Data Source | Privacy | Share Button |
|-----|------------|---------|--------------|
| **Latest** | Primal + User's public relays | Public | ✅ Yes |
| **Tribes** | Railway relay ONLY (NIP-29) | Private | ❌ NO |
| **Buddies** | TBD (accountability buddies) | **PRIVATE** | **❌ NO - NEVER SHAREABLE** |

---

## 🔐 PRIVACY SYSTEM

### Three-Tier Privacy Model:

```
🔴 NEVER SHAREABLE
   - Tribe messages (kinds 9, 11, 12)
   - Buddy messages (accountability partners)
   - Railway relay ONLY
   - NO share button (blocked in code)
   - Lock badge on UI

🟡 PRIVATE BY DEFAULT
   - Big Dreams, journals, progress (kind 30078)
   - NIP-44 encrypted
   - Optional share with warning dialog

🟢 SHAREABLE
   - Feed posts (kind 1)
   - Completions, reactions
   - User chooses: LaB only OR LaB + public
```

### Where Content Goes:

| Content Type | Railway Relay | Public Relays | Encrypted |
|--------------|---------------|---------------|-----------|
| Tribe messages | ✅ ONLY | ❌ NEVER | ✅ Yes (NIP-29) |
| Buddy messages | ✅ ONLY | ❌ NEVER | ✅ Yes (NIP-44/NIP-17) |
| Big Dreams | ✅ Default | ⚠️ Optional (with warning) | ✅ Yes (NIP-44) |
| Feed posts | ✅ Always | ✅ User choice | ❌ No |
| Reactions/Zaps | ✅ Always | ✅ Yes | ❌ No |

---

## 📁 KEY FILES

### Core Feed System:
| File | Purpose | Status |
|------|---------|--------|
| `/src/lib/primalCache.ts` | Primal WebSocket client | STABLE |
| `/src/hooks/useFeedPosts.ts` | Feed data hooks | STABLE |
| `/src/pages/Feed.tsx` | Feed UI with tabs | STABLE |
| `/src/components/FeedPost.tsx` | Individual post component | STABLE |
| `/src/components/NoteContent.tsx` | Rich text + media rendering | STABLE |

### Privacy & Publishing:
| File | Purpose |
|------|---------|
| `/src/lib/relays.ts` | Relay config, privacy levels |
| `/src/hooks/useLabPublish.ts` | Secure publishing (LaB vs public) |
| `/src/hooks/useEncryptedStorage.ts` | NIP-44 encryption |
| `/src/components/ShareConfirmDialog.tsx` | Warning for public sharing |

### Documentation:
| File | Purpose |
|------|---------|
| **AGENTS.md** | **READ THIS FIRST** — Prevention rules for feed, Primal API, NoteContent |
| FEED_BUGS.md | Bug history (all resolved) |
| SESSION_NOTES.md | Session history |
| PLAN.md | Full build spec |

---

## ALL CRITICAL BUGS RESOLVED (Feb 16, 2026)

1. **Stale Data** — Mitigated (Primal lag is by design, direct relays supplement)
2. **Raw JSON Display** — Fixed (processEvent handles string/object)
3. **Images Not Loading in Embedded Notes** — Fixed (EmbeddedNoteContent component)
4. **naddr Links as Raw Text** — Fixed (regex + decode handler)
5. **Stats Not Showing** — Fixed (extended_response + inner ID + await merge)

### Prevention Rules in AGENTS.md:
- "CRITICAL: Primal API Rules (DO NOT BREAK)" — 4 rules
- "CRITICAL: NoteContent Rendering Rules (DO NOT BREAK)" — 4 rules
- "CRITICAL: Feed File Reference (READ BEFORE EDITING)" — file map

---

## 🔄 DATA FLOW

### Latest Tab (Following Feed):
```
1. User opens Feed → Latest tab
2. Call fetchPrimalNetworkFeed(pubkey, limit: 40, until: NOW)
3. WebSocket connects to wss://cache.primal.net/v1
4. Enable compression, send feed request
5. Receive stream of events:
   - Kind 0: Profiles → Map<pubkey, metadata>
   - Kind 1: Notes → Array<NostrEvent>
   - Kind 10000100: Stats → Map<eventId, stats>
   - Kind 10000115: Actions → Map<eventId, actions>
6. PARALLEL: Query user's relays for posts Primal missed
7. Merge, dedupe, sort by timestamp
8. Display with FeedPost components
```

### Tribes Tab (Private Posts):
```
1. User switches to Tribes tab
2. Query Railway relay ONLY: kinds [11, 12], limit: 30
3. Filter by user's Tribe membership (h tag)
4. Display with lock badge, NO share button
5. Check for new posts every 30s for notification badge
```

---

## 🎨 UI DESIGN

### Feed Layout (Primal-style):
- **Centered feed column:** 580px max width
- **Right sidebar:** 280px (Tribes, Live Now, Events)
- **Post composer:** Top of feed
- **Tabs:** Latest, Tribes, Buddies (with notification badges)

### Post Display:
- **Images:** Single column, `object-fit: contain`, max-height: 500px
- **Stats:** Real numbers from Primal (not just icons)
- **Actions:** Filled heart if liked, highlight if user engaged
- **Private posts:** Lock badge, no share button

---

## 🔍 HOW TO DEBUG THE FEED

### 1. Check Browser Console:
```
[Feed] Starting feed fetch, user: 3d70ec1e at: 1771234567
[Feed] Calling Primal with until: 1771234567
[Primal] Connected, sending feed request...
[Primal] Compression enabled, sending actual request...
[Primal] feed: 40 notes, 23 profiles, 40 stats
[Feed] Got 40 notes from Primal
[Feed] Got 12 notes from relays
[Feed] Returning 52 total posts
```

### 2. Test Primal API Directly:
```javascript
// In browser console:
const ws = new WebSocket('wss://cache.primal.net/v1');
ws.binaryType = 'arraybuffer';
ws.onopen = () => {
  ws.send(JSON.stringify([
    "REQ", "test",
    {cache: ["feed", {
      pubkey: "YOUR_HEX_PUBKEY",
      user_pubkey: "YOUR_HEX_PUBKEY",
      limit: 5,
      until: Math.floor(Date.now() / 1000)
    }]}
  ]));
};
ws.onmessage = (e) => console.log(e.data);
```

### 3. Compare with Primal App:
- Open primal.net in another tab
- Check if same posts appear
- Compare timestamps
- Check if stats match

### 4. Common Issues:
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Old posts | Missing/wrong `until` param | Always pass current timestamp |
| No stats | Stats not parsed from kind 10000100 | Check JSON.parse of content |
| Raw JSON | Event is string, not object | Call JSON.parse before use |
| No images | URL detection regex doesn't match | Add host to IMAGE_HOSTS list |

---

## 📝 TERMINOLOGY (CRITICAL - USE THESE)

| ✅ Use This | ❌ NOT This |
|-------------|-------------|
| **Experiments** | Courses, lessons, modules |
| **Tribes** | Communities, groups |
| **LaB** (capital L, lowercase a, capital B) | Lab, LAB |
| **Sats** | Points, coins |
| **Zap** | Tip, donate |
| **Big Dream** | Goal |

---

## 🚀 WHAT'S SIMILAR TO PRIMAL

### ✅ We Match Primal:
1. **WebSocket cache server** - wss://cache.primal.net/v1
2. **Zlib compression** - pako.inflate()
3. **Same request format** - `["REQ", id, {cache: ["feed", {...}]}]`
4. **Same custom kinds** - 10000100 (stats), 10000115 (actions)
5. **Fast loading** - All data in one WebSocket response
6. **Real stats** - Likes, zaps, reposts with numbers
7. **User actions** - Highlighted if you liked/zapped
8. **Centered layout** - 580px feed column, right sidebar

---

## 🎯 WHAT'S DIFFERENT FROM PRIMAL

### ➕ We Add:
1. **Privacy layers** - 3-tier system (Never/Private/Shareable)
2. **Private relay** - Railway relay for LaB content
3. **Tribe posts** - NIP-29 groups (private, encrypted)
4. **Mixed feed** - Public + private in same interface
5. **Share warnings** - Dialogs before posting private data publicly
6. **Lock badges** - Visual indicators for private content
7. **Conditional sharing** - Some posts can NEVER be shared
8. **Experiments** - Progress tracking, streaks, gamification
9. **AI Mentor** - Magic Mentor conversations (planned)
10. **Accountability buddies** - Private buddy feed (planned)

### 🔐 Privacy Enforcement:
Primal has NO privacy controls - everything is public.  
We enforce privacy at multiple layers:
- **Code:** Share button disabled for private posts
- **UI:** Lock badges, visual warnings
- **Data:** Separate relay for private content
- **Encryption:** NIP-44 for sensitive data

---

## NEXT STEPS

### All Feed Bugs Resolved. Moving On To:
1. **Completion receipts** — One-time sats earning per lesson
2. **Streak tracking** — Daily check-ins, gamification
3. **Accountability buddies** — Buddy feed tab
4. **Magic Mentor AI** — OpenRouter/Grok integration

---

## 💡 KEY INSIGHTS

### What We Learned from Primal:
1. **Speed is everything** - Cache server beats querying relays
2. **Stats matter** - Users want real numbers, not just icons
3. **One response** - All data (posts + profiles + stats) in one WebSocket stream
4. **Compression works** - zlib reduces bandwidth significantly
5. **Timestamps critical** - `until` param controls freshness

### What Makes LaB Unique:
1. **Privacy-first** - Not everything is public
2. **Tribe focus** - Private groups for accountability
3. **Experiment tracking** - Progress, streaks, completions
4. **AI integration** - Magic Mentor for coaching
5. **Value for Value** - Earn sats for progress, zap creators

---

## CRITICAL WARNINGS

### FOR AI AGENTS:
1. **READ AGENTS.md "Primal API Rules" and "NoteContent Rendering Rules"** before changing ANY feed code
2. **These files are tightly coupled** — read all 5 feed files before editing any of them
3. **Preserve privacy controls** — don't accidentally expose private data
4. **`extended_response: true`** is REQUIRED on Primal events endpoint for stats
5. **Kind 6 reposts** — always look up stats by INNER event ID, not wrapper
6. **Never fire-and-forget** — always await stats fetches and merge results
7. **NoteContent regex** — must have ALL NIP-19 prefixes (npub1, note1, nprofile1, nevent1, naddr1)
8. **Embedded notes** — must render media via EmbeddedNoteContent, never raw text

### FOR DEBUGGING:
1. **Check `until` timestamp** — Must be current, not cached
2. **Verify event types** — Should be objects, not strings
3. **Monitor WebSocket** — Look for EOSE before timeout
4. **Compare with Primal** — Open primal.net side-by-side
5. **Test on live site** — Browser extensions don't work in iframe

---

## 📚 RESOURCES

### Primal Documentation:
- Primal GitHub: https://github.com/PrimalHQ/primal-web-app
- Primal Cache API: `wss://cache.primal.net/v1`
- Primal Web App: https://primal.net

### Nostr Protocol:
- NIP-01: Basic protocol
- NIP-29: Relay-based groups (Tribes)
- NIP-44: Encrypted DMs
- NIP-57: Zaps (Lightning tips)

### 11x LOVE LaB:
- Live Site: https://11xLOVE.shakespeare.wtf
- GitHub: https://github.com/DJValerieBLOVE/11xLOVE-LaB.git
- Railway Relay: wss://nostr-rs-relay-production-1569.up.railway.app

---

**Last Updated:** February 16, 2026  
**Status:** All critical feed bugs resolved. Prevention rules in AGENTS.md.

💜 Peace, LOVE, & Warm Aloha
