# SHAKESPEARE.DIY — 11x LOVE LaB Platform Build Spec

> **Private coaching platform on Nostr. Build chunk by chunk. Test each chunk before moving to the next.**

---

## STATUS: FEED SYSTEM ENHANCED — TESTING IN PROGRESS 🔧

**Last Updated:** February 16, 2026 (8:45 AM)

**Infrastructure:**
- ✅ Private Nostr relay deployed on Railway
- ✅ Relay URL: `wss://nostr-rs-relay-production-1569.up.railway.app`
- ✅ Admin pubkey: `3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767`
- ✅ Auth: NIP-42 whitelist mode — only admin pubkey can publish
- ✅ Relay software: nostr-rs-relay (Rust, SQLite-based)
- ✅ Three-tier privacy system (Never/Private/Shareable)
- ✅ NIP-44 encryption for private data

**Frontend:**
- ✅ React app shell with Layout, Navigation, Routes
- ✅ 7 main pages: Big Dreams, Experiments, Events, Tribe, Love Board, Vault, Feed
- ✅ Nostr login working (NIP-07 / NIP-46)
- ✅ Desktop sidebar + Mobile bottom nav
- ✅ Feed with mixed public/private content
- ✅ Moderation system (mute, report, admin tools)
- ✅ Experiment Builder for creators
- ✅ 5-tier membership system
- ✅ **Primal custom kinds documented (40+ kinds)**
- ✅ **Link preview cards (kind 10000128)**
- ✅ **Fixed stale feed data bug** (was showing old posts)
- ✅ **Fixed username styling** (was grayed out, now black)
- 🔧 **Feed content mismatch with Primal — investigating**
- 🔧 **Stats display — needs testing**
- ❌ **NOT connected to Magic Mentor AI yet**
- ❌ **NO streak tracking or gamification**
- ❌ **NO completion receipts for sats earning**

**Current Priority:** Fix feed to match Primal exactly (same posts, same stats)
**Next Priority:** Completion receipts → Streaks → Magic Mentor AI

---

## CONTEXT: What This Is

A $1,000/year selective coaching community platform called **11x LOVE LaB** ("Lessons and Blessings") built on Nostr. Light mode default, pink accent (#eb00a8), mobile-first PWA. The private relay IS the database — no PostgreSQL, no Cloudflare Workers, no D1.

---

## TERMINOLOGY (USE THESE — NOT Alternatives)

| ✅ Correct Term | ❌ Do NOT Use |
|---|---|
| **Experiments** | Courses, lessons, modules |
| **Tribes** | Communities, groups |
| **Big Dream** | Goal |
| **Sats** | Points, coins |
| **Zap** | Tip, donate |
| **Bitcoin** | Crypto |
| **Membership** | Subscription |
| **Value for Value (V4V)** | Free |
| **LaB** (capital L, lowercase a, capital B) | Lab, LAB |

---

## TECH STACK

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | React + Tailwind CSS | MKStack template — already set up |
| **Identity** | Nostr login (NIP-07 / NIP-46) | User owns keys |
| **Data Persistence** | Private Nostr relay on Railway | All LaB data stored here — persists across devices/browsers |
| **Social Nostr** | Public relays (read-only) | Profiles, follows, public feed interactions |
| **Local Cache** | IndexedDB (browser) | Speed layer only — relays are source of truth |
| **Private Community** | NIP-29 groups on relay | Authenticated access, private by default |
| **Zaps / V4V** | NIP-57 | Non-custodial — user's own wallet |
| **Encryption** | NIP-44 | Private data encrypted with user's Nostr key |

---

## THREE-TIER PRIVACY SYSTEM

### 🔴 NEVER SHAREABLE (Tribe Messages)
- NIP-29 group events (kinds 9, 11, 12, 1059, 1060)
- Encrypted - only group members can decrypt
- NO share button exists - blocked in code
- Even admin cannot read these messages

### 🟡 PRIVATE BY DEFAULT (Big Dreams, Journals, etc.)
- Kind 30078 app-specific data
- Encrypted with NIP-44 (user's own key)
- Optional share with warning dialog:
  - "Are you sure you want to share this publicly on Nostr?"
  - [Keep Private] [Yes, Share Publicly]

### 🟢 SHAREABLE (Completions, Feed Posts)
- Kind 1 notes, reactions
- User can share to public Nostr
- Promotes 11x LOVE LaB to the community

---

## DUAL-RELAY ARCHITECTURE

### 🔒 Private Railway Relay (Write + Read)
**URL:** `wss://nostr-rs-relay-production-1569.up.railway.app`

**What Goes Here:**
- ✅ Experiment progress (kind 30078)
- ✅ Lab Notes / journal entries (kind 30023, encrypted)
- ✅ 5V's Daily Practice check-ins (kind 30078)
- ✅ Big Dreams (kind 30078)
- ✅ Tribe messages (NIP-29: kind 9, 11, 12)
- ✅ Private posts (user's choice)
- ✅ Experiment completions / milestones (unless shared publicly)
- ✅ Mute lists (kind 10000)
- ✅ Reports (kind 1984)

**Privacy:** NIP-42 AUTH required, admin-controlled whitelist

---

### 🌍 Public Relays (Read-only)
**URLs:** 
- `wss://relay.primal.net`
- `wss://relay.damus.io`
- `wss://relay.ditto.pub`

**What We Read:**
- ✅ User profiles (kind 0)
- ✅ Follow lists (kind 3)
- ✅ Public feed posts (kind 1)
- ✅ Reactions (kind 7)
- ✅ Zaps (kind 9735)
- ✅ Public articles (kind 30023)

**Privacy:** 
- User chooses what to share publicly
- LaB data NEVER goes to public relays
- Tribe messages NEVER go to public relays

---

## BUILD CHUNKS (Updated Status)

### ✅ Chunk 1: Basic App Shell + Nostr Login — COMPLETE
- ✅ React + Tailwind app shell
- ✅ Navigation: Big Dreams (home), Experiments, Events, Tribe, Love Board, Vault, Feed
- ✅ Nostr login (NIP-07 + NIP-46)
- ✅ Display user profile after login
- ✅ Logout button
- ✅ Profile dropdown menu

### ✅ Chunk 2: Connect to Private Relay — COMPLETE
- ✅ WebSocket connection to Railway relay
- ✅ NIP-42 authentication handshake (automatic)
- ✅ Dual-relay setup: Private Railway + Public relays (read-only)
- ✅ Smart routing: LaB data → Railway only, Social data → Public relays
- ✅ Secure publishing hooks (useLabPublish, useLabOnlyPublish)

### ✅ Chunk 3: Experiment Catalog + Lesson Viewer — COMPLETE (localStorage)
- ✅ Experiment catalog with 6 tabs
- ✅ Lesson viewer with Markdown
- ✅ YouTube/audio embed support
- ✅ "Mark Complete" → saves progress
- ✅ Sequential unlock logic
- ✅ Progress bar
- ✅ Experiment Builder for creators

### 🚧 Chunk 4: Daily Experiment Tracker + Streaks — IN PROGRESS
- ❌ Daily experiment display
- ❌ "I Did It!" check-in button
- ❌ Streak counter (kind:30078 replaceable)
- ❌ 30-day history view (✅/❌)
- ❌ Milestone celebrations (7/30/90 days)

### 🔧 Chunk 5: Feed System + Tribes — DEBUGGING
- ✅ Feed with 4 tabs: All, Tribes, Buddies, Public
- ✅ Mixed public/private content (safe - client-side only)
- ✅ Privacy badges on posts
- ✅ Share button logic (not on private posts)
- ✅ Moderation: mute, report, admin tools
- ✅ Primal WebSocket client with zlib compression
- ✅ All 40+ Primal custom kinds documented
- ✅ Link preview cards (kind 10000128)
- 🔧 Feed content mismatch with Primal app (investigating)
- 🔧 Stats display not working reliably
- ❌ Full NIP-29 tribe creation (planned)

### 🚧 Chunk 6: Zapping (NIP-57) — PARTIAL
- ✅ ZapButton component exists
- ✅ useZapStats hook
- ❌ Zap button on lessons
- ❌ Zap button on Tribe messages
- ❌ Creator zap on experiment completion

### ❌ Chunk 7: Admin Dashboard — NOT STARTED
- ❌ Admin-only route (check npub)
- ❌ Query relay for all kind:30078 events
- ❌ Metrics: total users, active 7d, completions
- ❌ Member list with status colors
- ❌ Completion funnel analytics
- ❌ View reports submitted by users

### 🚧 Chunk 8: User Dashboard + Profile — PARTIAL
- ✅ Profile page exists
- ✅ Edit profile form
- ❌ Personal progress dashboard
- ❌ Experiments in progress (%)
- ❌ Current streak display
- ❌ Recent check-in history

---

## NEW CHUNKS (Added Feb 15)

### Chunk 9: Completion Receipts + Anti-Gaming
**Build:**
- One-time completion events per lesson (kind 30078 replaceable)
- Sats earned tracking (replaceable event per user)
- Anti-gaming: same d-tag = overwrite (can't earn twice)
- Creator gets zapped on experiment completion

**Event Structure:**
```javascript
{
  kind: 30078,
  tags: [
    ["d", "completion-${lessonId}"],  // Unique per lesson
    ["experiment", experimentId],
    ["completed_at", timestamp],
    ["sats_earned", "10"],
  ],
  content: encrypted(details)
}
```

### Chunk 10: Streak Tracking + Gamification
**Build:**
- Daily check-in system
- Streak counter (current + longest)
- 30-day history view with calendar
- Milestone celebrations (7/30/90 days confetti)
- EQ Visualizer updates based on streaks

**Event Structure:**
```javascript
{
  kind: 30078,
  tags: [["d", "streak-data"]],
  content: encrypted({
    currentStreak: 7,
    longestStreak: 30,
    totalCheckins: 124,
    lastCheckin: "2026-02-15"
  })
}
```

### Chunk 11: Accountability Buddies
**Build:**
- Custom profile fields (focus areas, timezone, availability)
- Search/match by dimension focus
- Private Big Dreams sharing (encrypted to buddy's key)
- Buddy feed in the Buddies tab
- Connection requests

### Chunk 12: Magic Mentor AI
**Build:**
- OpenRouter/Grok 4.1 Fast integration
- User memory system (loads from Nostr)
- Encrypted conversation storage (kind 30078)
- References Big Dreams, experiments, journals
- Prompt caching for 90% cost savings
- BYOK support (user brings own API key)

### Chunk 13: Full Curriculum
**Build:**
- Load all 18 lessons of 11x LOVE Code
- Quiz questions for each lesson
- Worksheet PDFs
- Journal prompts
- Video placeholders (you add URLs later)

---

## DESIGN DIRECTION

### Color Palette
```javascript
colors: {
  background: '#ffffff',       // Light mode default
  surface: '#f9f9f9',          // Card backgrounds
  primary: '#eb00a8',          // PINK accent (brand)
  secondary: '#6600ff',        // PURPLE accent
  accent: '#f39c12',           // Gold - streaks
  success: '#2ecc71',          // Green - completions
  text: '#1a1a1a',             // Primary text
  textMuted: '#666666',        // Secondary text
}
```

### 11 Dimensions Colors
```javascript
dimensions: {
  1: '#FF0080',   // GOD/LOVE - Hot Pink
  2: '#FF00FF',   // Soul - Magenta
  3: '#8B00FF',   // Mind - Purple
  4: '#4B0082',   // Body - Indigo
  5: '#FF0000',   // Romance - Red
  6: '#FF8C00',   // Family - Orange
  7: '#FFD700',   // Community - Yellow
  8: '#7CFC00',   // Mission - Lime
  9: '#00FF00',   // Money - Green
  10: '#00FFFF',  // Time - Cyan
  11: '#0000FF',  // Environment - Blue
}
```

---

## MEMBERSHIP TIERS

| Tier | Access | AI Tokens | Price |
|------|--------|-----------|-------|
| **Free** | Browse, limited | 0 | $0 |
| **Member** | Full access | 2M/month | $11/mo |
| **BYOK** | Full + own AI key | Unlimited | $11/mo |
| **Creator** | Create experiments | 10M/month | $25/mo |
| **Admin** | Everything | Unlimited | - |

---

## KEY FILES

### Security & Publishing
- `/src/lib/relays.ts` - Relay config, privacy levels
- `/src/hooks/useLabPublish.ts` - Secure publishing
- `/src/hooks/useEncryptedStorage.ts` - NIP-44 encryption
- `/src/components/ShareConfirmDialog.tsx` - Warning dialog

### Feed & Moderation
- `/src/pages/Feed.tsx` - Feed with 4 tabs
- `/src/components/FeedPost.tsx` - Post component
- `/src/components/NoteContent.tsx` - Content renderer with link previews
- `/src/lib/primalCache.ts` - Primal WebSocket client (40+ custom kinds)
- `/src/hooks/useFeedPosts.ts` - Feed data hooks
- `/src/hooks/useModeration.ts` - Mute, report, admin

### Experiments
- `/src/pages/Experiments.tsx` - Catalog with 6 tabs
- `/src/pages/ExperimentBuilder.tsx` - Creator tool
- `/src/types/experiment.ts` - TypeScript interfaces

### Documentation
- `/PLAN.md` (this file) - Build spec
- `/SESSION_NOTES.md` - Current session progress
- `/docs/PROJECT-STATUS.md` - Phase 2 AI plans
- `/docs/AI-ARCHITECTURE.md` - OpenRouter integration
- `/docs/11x-LOVE-CODE-CURRICULUM.md` - Full lesson content

---

## GIT COMMIT STRATEGY

After each chunk completion:
```bash
git add .
git commit -m "Chunk X: [Feature Name] - [Brief description]"
git push origin main
```

---

## SUCCESS CRITERIA FOR BETA

- [x] User logs in with Nostr
- [x] User browses Experiment catalog
- [x] User views lessons (sequential unlock)
- [x] Mark complete → persists
- [x] Private/public content separation
- [x] Mute and report functionality
- [ ] Daily check-ins with streaks
- [ ] Completion receipts (one-time sats)
- [ ] Magic Mentor AI conversations
- [ ] Accountability buddies
- [ ] Admin dashboard
- [ ] Full 11x LOVE Code curriculum

---

## NOT IN BETA (Future Phases)

- ❌ Payment-gated verification
- ❌ Email automation
- ❌ Advanced leaderboards/badges
- ❌ Plugin system
- ❌ Multi-community support
- ❌ Native mobile apps

---

**Ship this. Get real users. Learn. Iterate.** 🚀

*"Fall madly in love with life — 11 minutes a day."* 💜
