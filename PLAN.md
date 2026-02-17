# SHAKESPEARE.DIY — 11x LOVE LaB Platform Build Spec

> **Private coaching platform on Nostr. Build chunk by chunk. Test each chunk before moving to the next.**

---

## STATUS: CRITICAL BUGS FIXED — READY FOR FEATURES ✅

**Last Updated:** February 17, 2026 (Opus 4.6 session — membership/onboarding/phase 1 spec confirmed)

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
- ✅ 6-tier membership system (Free / Core / Core Annual / Creator / Creator Annual / Creator BYOK)
- ✅ **Primal custom kinds documented (40+ kinds)**
- ✅ **Link preview cards (kind 10000128)**
- ✅ **FIXED: Gray text bug** — plain `<style>` override in index.html (commit 8dbafeb)
- ✅ **FIXED: Feed freshness** — parallel relay queries + auto-refresh (commit 8dbafeb)
- 🟡 **Stats display** — sometimes shows 0 counts, needs testing
- ❌ **NOT connected to Magic Mentor AI yet**
- ❌ **NO streak tracking or gamification**
- ❌ **NO completion receipts for sats earning**

**Current Priority:** Phase 1B (Big Dreams Dashboard) → Phase 1C (Beta Onboarding) → Phase 2 (Magic Mentor AI)
**CI Status:** GitHub Actions passing ✅ (tsc + eslint --max-warnings 0 + vitest + build)
**Known Issues:** See CRITICAL_BUGS.md for remaining non-critical items

---

## CONTEXT: What This Is

A coaching community platform called **11x LOVE LaB** ("Lessons and Blessings") built on Nostr. Light mode default, purple accent (#6600ff), mobile-first PWA. The private relay IS the database — no PostgreSQL, no Cloudflare Workers, no D1. Tiered membership from Free to Creator ($25/mo).

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

### ✅ Chunk 5: Feed System + Tribes — COMPLETE (with minor issues)
- ✅ Feed with 3 tabs: Latest, Tribes, Buddies
- ✅ Mixed public/private content (safe - client-side only)
- ✅ Privacy badges on posts
- ✅ Share button logic (not on private posts)
- ✅ Moderation: mute, report, admin tools
- ✅ Primal WebSocket client with zlib compression
- ✅ All 40+ Primal custom kinds documented
- ✅ Link preview cards (kind 10000128)
- ✅ Text colors fixed (pure black) — plain `<style>` override
- ✅ Feed freshness improved — parallel relay queries + auto-refresh
- 🟡 Stats display sometimes shows 0 counts (needs testing)
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
  primary: '#6600ff',          // PURPLE accent (brand) — ALL buttons, links, tabs
  secondary: '#9900ff',        // Lighter purple — gradient pair
  accent: '#f39c12',           // Gold - streaks
  success: '#2ecc71',          // Green - completions
  text: '#1a1a1a',             // Primary text (Marcellus font, weight 400 ONLY)
  textMuted: '#666666',        // Secondary text
}
// NOTE: Pink (#eb00a8) is NOT a brand accent. It is the GOD/LOVE dimension color ONLY.
// Gradient default: from-[#6600ff] to-[#9900ff] (purple pair)
```

### 11 Dimensions Colors (from /src/lib/dimensions.ts)
```javascript
dimensions: {
  1:  '#eb00a8',   // GOD/LOVE - Hot Pink (dimension color, NOT brand accent)
  2:  '#cc00ff',   // Soul - Magenta
  3:  '#9900ff',   // Mind - Purple
  4:  '#6600ff',   // Body - Purple (also PRIMARY BRAND COLOR)
  5:  '#e60023',   // Romance - Red
  6:  '#ff6600',   // Family - Orange
  7:  '#ffdf00',   // Community - Yellow
  8:  '#a2f005',   // Mission - Lime Green
  9:  '#00d81c',   // Money - Matrix Green
  10: '#00ccff',   // Time - Cyan
  11: '#0033ff',   // Environment - Blue
}
```

---

## MEMBERSHIP TIERS

### Free Tier — $0
- Browse public experiment catalog
- Read experiments (after login)
- Zap & Share

### Core — $11/mo
- Everything in Free, plus:
- Track progress
- Comments
- Join tribes
- Vault (save journals/experiments)
- Post to Love Board
- Magic Mentor AI (shared API key)
- Accountability Buddies

### Core — $99/yr (annual discount)
- Everything in Core Monthly, plus:
- Create tribes

### Creator — $25/mo
- Everything in Core, plus:
- Create experiments
- Analytics dashboard (views, completion rates, zap revenue)

### Creator — $199/yr (annual discount)
- Everything in Creator Monthly, plus:
- Create tribes

### Creator BYOK — $11/mo or $99/yr
- Everything in Creator tier
- Uses user's own OpenRouter API key for Magic Mentor AI
- Create tribes (yearly only)

### Admin — Internal
- Everything above
- Manage members, moderate content
- Full relay access

---

## TWO-PATH ONBOARDING

On first login, user chooses: **Quick Start** or **Deep Dive**

### Path A: Quick Start
1. Welcome screen
2. Show 11 dimension cards — user types 1-2 sentence Big Dream per dimension
3. Auto-save as kind 30078 events (one per dimension)
4. Land on Big Dreams dashboard
5. Show message: *"You can always dive deeper with the full 11x LOVE Code later"*

### Path B: Deep Dive
1. User enters full 11x LOVE Code curriculum (18 lessons, 5 modules)
2. Module 4, Lesson 1 = "11x LOVE Code Vision Board" — detailed Big Dreams
3. Detailed answers **overwrite** any Quick Start Big Dreams
4. Module 5 = Daily Practice setup

**Rule:** Path B answers always replace Path A answers for the same dimension.

---

## BIG DREAMS DASHBOARD

This is the **homepage after login**. Shows 11 dimension cards in Prosperity Pyramid order:

1. 💜 GOD/LOVE  2. 🎯 Mission  3. 💪 Body  4. 🧠 Mind  5. ✨ Soul  6. ❤️ Romance  7. 👨‍👩‍👧‍👦 Family  8. 🤝 Community  9. ₿ Money  10. ⏰ Time  11. 🏠 Environment

Each card shows:
- Big Dream text (from onboarding or curriculum)
- Related experiments in that dimension
- Progress indicator

**Data:** kind 30078 Nostr events, one per dimension
**Editable:** Users can edit/update Big Dreams anytime
**Widgets:** Experiments in progress, Quick stats, Streak status

---

## DASHBOARDS — TWO TYPES

### Member Dashboard (Big Dreams Page)
- Every logged-in user sees their own
- Shows: 11 Big Dreams, experiments in progress, completion stats, streak, quick actions

### Creator Analytics Dashboard
- Creator tier only, for experiments they created
- Shows: Who's viewing, completion rates, zap revenue, most popular lessons

---

## BETA TESTING PLAN

### Tier 1 Beta (30 people)
- Manually assigned Core tier ($11/mo value)
- Must complete 11x LOVE Code Experiment 1
- Test: reading, progress tracking, comments, tribes, vault, Love Board
- **REQUIRED:** Magic Mentor AI working + custom profile fields

### Tier 2 Beta (later)
- Manually assigned Creator tier ($25/mo value)
- Test: experiment builder, templates, analytics dashboard

### Custom Profile Fields for Beta
- Rockstar Identity (DJ Hero Name, Villain, Kryptonite, Inner Child)
- IKIGAI answers
- Cosmic Council (5 spiritual advisors)
- Hi-5 Vibe Tribe (5 human support contacts)

---

## SEO & AI OPTIMIZATION

**Add these files for discoverability:**

- `/public/llms.txt` — Describe what 11x LOVE LaB is, what experiments are, how it works (for AI crawlers)
- `/public/sitemap.xml` — List all public experiment URLs
- `/public/robots.txt` — Standard crawl permissions

**Optimize `/experiments` public page:** semantic HTML, clear headings, structured data for maximum scannability.

---

## PHASE 1 BUILD PLAN

### ✅ Phase 1A: Public Catalog + Membership Gates — COMPLETE
1. ✅ Public `/experiments` catalog page (SEO optimized with semantic HTML, search/filter)
2. ✅ `llms.txt`, `sitemap.xml`, `robots.txt` (comprehensive AI crawler documentation)
3. ✅ Login redirect for experiment detail pages (Free tier requirement enforced)
4. ⏭️ Membership tier checking system (deferred to Phase 1B)
5. ⏭️ Feature gates: vault, Love Board, comments, Magic Mentor, analytics = paid only (deferred to Phase 1B)

### Phase 1B: Big Dreams Dashboard (~2-3 hrs)
1. Big Dreams page = homepage after login
2. 11 dimension cards (Prosperity Pyramid order)
3. Auto-populate from 11x LOVE Code answers
4. Experiments in progress widget
5. Quick stats

### Phase 1C: Beta Onboarding (~1-2 hrs)
1. First login detection
2. Welcome modal: "Quick Start or Deep Dive?"
3. Quick Start: 11 dimension Big Dream cards
4. Profile setup guide
5. Redirect to 11x LOVE Code Experiment 1
6. After completion → Big Dreams populated/updated

### Phase 2 (Later — Hand off to Opus)
- Magic Mentor AI integration (Grok 4.1 Fast + OpenRouter)
- Advanced prompt engineering for personalized coaching

---

## TECH NOTES

- **AI:** Magic Mentor uses Grok 4.1 Fast via OpenRouter. No data sharing with xAI. BYOK tier uses user's own OpenRouter key.
- **Backend:** Private Nostr relay on Railway (`wss://nostr-rs-relay-production-1569.up.railway.app`)
- **Community:** NIP-29 Tribes for group messaging
- **Payments:** NIP-57 Lightning zaps — native, no external integration
- **Big Dreams storage:** kind 30078 events, one per dimension
- **CRUD** = Create, Read, Update, Delete — the 4 basic database operations

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
