# SHAKESPEARE.DIY — 11x LOVE LaB Platform Build Spec

> **Private coaching platform on Nostr. Build chunk by chunk. Test each chunk before moving to the next.**

---

## STATUS: UI SCAFFOLDING COMPLETE — READY FOR NOSTR INTEGRATION ⚡

**Last Updated:** February 13, 2026

**Infrastructure:**
- ✅ Private Nostr relay deployed on Railway
- ✅ Relay URL: `wss://nostr-rs-relay-production-1569.up.railway.app`
- ✅ Admin pubkey: `3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767`
- ✅ Auth: NIP-42 whitelist mode — only admin pubkey can publish
- ✅ Relay software: nostr-rs-relay (Rust, SQLite-based)

**Frontend:**
- ✅ React app shell with Layout, Navigation, Routes
- ✅ 7 main pages: Big Dreams, Experiments, Events, Tribe, Love Board, Vault, Feed
- ✅ Nostr login working (NIP-07 / NIP-46)
- ✅ Desktop sidebar + Mobile bottom nav
- ✅ Profile menu, logout, basic UI structure
- ✅ Static experiment data file exists
- ❌ **NOT connected to private Railway relay yet**
- ❌ **NO Nostr event publishing for progress tracking**
- ❌ **NO actual lesson viewer or course system**
- ❌ **NO streak tracking or daily practice implementation**

**Next Priority:** Connect to private relay and implement Chunk 2 → Chunk 3

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

**User Can:**
- ✅ Reply to public Nostr posts
- ✅ React/zap public content
- ✅ Choose to share their posts publicly (publishes to Railway + public relays)

**Privacy:** 
- User chooses what to share publicly
- LaB data NEVER goes to public relays
- Tribe messages NEVER go to public relays

---

## ENVIRONMENT VARIABLES

```bash
RELAY_URL=wss://nostr-rs-relay-production-1569.up.railway.app
ADMIN_NPUB=3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767
```

No database connection strings. No API keys. Relay + Nostr handle everything.

---

## CUSTOM NOSTR EVENT KINDS

Use `kind: 30078` (replaceable app-specific data) for all user progress events.

### Event Tag Structure

**Experiment (lesson) completion:**
```javascript
{
  kind: 30078,
  pubkey: "user_npub",
  tags: [
    ["d", "experiment-complete"],
    ["experiment", "11x-love-code"],
    ["lesson", "module-1-lesson-3"],
    ["completed_at", "2026-02-11T18:00:00Z"]
  ],
  content: nip44.encrypt(JSON.stringify({
    experimentId: "11x-love-code",
    lessonId: "module-1-lesson-3",
    completedAt: "2026-02-11T18:00:00Z"
  }), userKey)
}
```

**Daily check-in:**
```javascript
{
  kind: 30078,
  pubkey: "user_npub",
  tags: [
    ["d", "daily-checkin"],
    ["date", "2026-02-11"],
    ["experiment_name", "drink-8-glasses-water"]
  ],
  content: nip44.encrypt(JSON.stringify({
    date: "2026-02-11",
    experiment: "drink-8-glasses-water",
    completed: true,
    notes: "Felt great today!"
  }), userKey)
}
```

**Streak update (replaceable — always current):**
```javascript
{
  kind: 30078,
  pubkey: "user_npub",
  tags: [["d", "streak-current"]],
  content: nip44.encrypt(JSON.stringify({
    currentStreak: 7,
    longestStreak: 14,
    lastCheckIn: "2026-02-11"
  }), userKey)
}
```

---

## DESIGN DIRECTION

### Color Palette
```javascript
colors: {
  background: '#ffffff',       // Light mode default
  surface: '#f9f9f9',          // Card backgrounds
  surfaceLight: '#ffffff',     // Lighter surfaces
  primary: '#eb00a8',          // PINK accent (brand)
  primaryLight: '#ff3dbf',     // Light pink hover
  secondary: '#e94560',        // Red/pink alerts
  accent: '#f39c12',           // Gold - streaks
  success: '#2ecc71',          // Green - completions
  text: '#1a1a1a',             // Primary text
  textMuted: '#666666',        // Secondary text
  border: '#e5e5e5',           // Subtle borders
}
```

### Design Principles
- **Light mode default** (per spec)
- **Pink accent** (#eb00a8)
- **Clean, modern, mobile-first**
- **Celebration animations** on completions
- **Streak counter** with fire emoji 🔥
- **Card-based layouts** with rounded corners (12px)
- **Generous whitespace**
- **Satisfying micro-interactions**

### Typography
- Headings: Inter Bold
- Body: Inter Regular  
- Base: 16px mobile, scale up for desktop

### Key Animations
- Lesson complete: ✨ Sparkle burst
- Streak milestone (7/30/90): 🎊 Confetti
- Check-in: Pop animation
- Zap sent: ⚡ Lightning flash
- Card hover: Subtle scale (1.02x)

---

## BUILD CHUNKS (Sequential Order)

### ✅ Chunk 1: Basic App Shell + Nostr Login
**Build:**
- React + Tailwind app shell
- Navigation: Home, Experiments, Tribe, Tracker, Profile
- Nostr login (NIP-07 + NIP-46)
- Display user profile after login
- Logout button

**Test:** Can user log in and see profile? ✓

---

### ✅ Chunk 2: Connect to Private Relay (COMPLETE)
**Build:**
- ✅ WebSocket connection to Railway relay
- ✅ NIP-42 authentication handshake (automatic via NRelay1)
- ✅ Dual-relay setup: Private Railway + Public relays (read-only)
- ✅ Smart routing: LaB data → Railway only, Social data → Public relays
- IndexedDB caching (pending)

**Test:** Can app publish to relay and read back? Does second device see same event? ✓

**Privacy Model:**
- 🔒 **Railway Relay (Write):** All LaB data (experiments, journal, 5V's, tribes)
- 🌍 **Public Relays (Read-only):** Profiles, follows, public feed
- ✅ **User Choice:** Can share milestones/posts to public Nostr if desired

---

### Chunk 3: Experiment Catalog + Lesson Viewer
**Build:**
- Experiment catalog (static JSON)
- Lesson viewer with Markdown
- YouTube/audio embed support
- "Mark Complete" → publishes kind:30078
- Sequential unlock logic
- Progress bar

**Test:** Can user complete lessons, unlock next, persist across cache clear? ✓

---

### Chunk 4: Daily Experiment Tracker + Streaks
**Build:**
- Daily experiment display
- "I Did It!" check-in button
- Streak counter (kind:30078 replaceable)
- 30-day history view (✅/❌)
- Milestone celebrations (7/30/90 days)

**Test:** Check-in daily, see streak persist across devices? ✓

---

### Chunk 5: Feed System + Tribes (NIP-29 Private Community)
**Build:**
- **Feed Page with Customizable Tabs:**
  - "My Tribes" tab (all tribes user is in)
  - "Following" tab (public Nostr people they follow)
  - "Trending" tab (optional, public Nostr trending)
  - User can add/remove/reorder tabs
  
- **Individual Tribe Pages:**
  - NIP-29 group on private Railway relay
  - Private tribe feed (NEVER public - no share button)
  - Reply threading (tribe-only)
  - Member list
  - Admin: add/remove members
  - Basic moderation
  
- **Publish Options:**
  - Post to specific tribe(s) → Railway relay
  - Post to public Nostr → Public relays (user choice)
  - NO share button on tribe-only posts (always private)
  - Share button on user's own posts (can make public if desired)

**Privacy Rules:**
- ❌ Tribe messages (kind 9, 11, 12) → NEVER public
- ✅ General posts → User chooses (tribe or public)
- 🔒 LaB data (progress, journal, 5V's) → Always private Railway relay
- ✅ Public relay interactions → User can reply/react to public Nostr

**Test:** Members can post? Only tribe members see? Can reply to public Nostr? Share button logic correct? ✓

---

### Chunk 6: Zapping (NIP-57)
**Build:**
- Zap button on lessons
- Zap button on Tribe messages
- WebLN/NWC wallet connection
- Display zap amounts
- Friendly no-wallet prompt

**Test:** Can user zap content? Amount displays? ✓

---

### Chunk 7: Admin Dashboard
**Build:**
- Admin-only route (check npub)
- Query relay for all kind:30078 events
- Metrics: total users, active 7d, completions
- Member list with status colors
- Completion funnel analytics

**Test:** Admin sees all user progress? Metrics accurate? ✓

---

### Chunk 8: User Dashboard + Profile
**Build:**
- Personal progress dashboard
- Experiments in progress (%)
- Current streak display
- Recent check-in history
- Profile settings
- Optional email field

**Test:** Dashboard reflects relay data accurately? ✓

---

## AFTER EACH CHUNK — CHECKLIST

- [ ] Loads without errors?
- [ ] Feature works as expected?
- [ ] Data persists after cache clear?
- [ ] Data syncs across devices?
- [ ] Doesn't break previous chunks?
- [ ] Admin dashboard still works?

**Only proceed when ALL boxes checked.**

---

## EXPERIMENT SYSTEM DETAILS

### Sequential Unlock Logic
```javascript
function canAccessLesson(experimentId, lessonIndex, userEvents) {
  if (lessonIndex === 0) return true; // First lesson always open

  const previousLessonId = experiments
    .find(e => e.id === experimentId)
    .lessons[lessonIndex - 1].id;

  return userEvents.some(event =>
    event.tags.find(t => t[0] === "d" && t[1] === "experiment-complete") &&
    event.tags.find(t => t[0] === "lesson" && t[1] === previousLessonId)
  );
}
```

### Experiment Data Structure (Static JSON)
```javascript
const experiments = [
  {
    id: "11x-love-code",
    title: "The 11x LOVE Code — Start Here",
    description: "Your introduction to the 11 Dimensions of LOVE",
    icon: "💜",
    lessons: [
      {
        id: "module-1-lesson-1",
        title: "Welcome to the 11x LOVE Code",
        type: "video",
        content: "## Welcome, Beautiful Soul!\n\nThis is where your transformation begins...",
        videoUrl: "https://youtube.com/embed/XXXXX",
        duration: "5 min"
      },
      // ... more lessons
    ]
  }
]
```

---

## TRIBE (NIP-29) DETAILS

- **NIP-29** = relay-based groups with access control
- Private relay enforces authentication
- Members must auth (NIP-42) before read/write
- Messages stored on relay (persistent)
- Admin adds/removes members via relay config

---

## ZAPPING (NIP-57) DETAILS

- Non-custodial Lightning tips
- User clicks ⚡ on lesson/message
- App generates invoice via Lightning address
- User pays from own wallet (Alby, Mutiny, etc.)
- Zap receipt published as NIP-57 event
- Amount displays on content

### Wallet Connection
- **WebLN** (browser extension)
- **NWC** (Nostr Wallet Connect)
- No wallet required to USE app
- Only needed to send/receive zaps

---

## ADMIN DASHBOARD DETAILS

### Admin Access Check
```javascript
const ADMIN_NPUB = "3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767";

if (currentUser.npub === ADMIN_NPUB) {
  showAdminDashboard();
}
```

### Admin Queries
```javascript
// All experiment completions
const completions = await relay.query([{
  kinds: [30078],
  "#d": ["experiment-complete"]
}]);

// Check-ins past 7 days
const checkins = await relay.query([{
  kinds: [30078],
  "#d": ["daily-checkin"],
  since: sevenDaysAgo
}]);

// Specific user history
const userHistory = await relay.query([{
  kinds: [30078],
  authors: [userPubkey]
}]);
```

---

## PWA SETUP

```json
{
  "name": "11x LOVE LaB",
  "short_name": "11x LOVE",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#eb00a8"
}
```

---

## SUCCESS CRITERIA FOR BETA

- [ ] User logs in with Nostr
- [ ] User browses Experiment catalog
- [ ] User views lessons (sequential unlock)
- [ ] Mark complete → persists across devices
- [ ] Daily check-ins with streaks
- [ ] Post in private Tribe (NIP-29)
- [ ] Zap content and messages
- [ ] Admin sees all user progress
- [ ] Admin sees completion rates
- [ ] Admin sees member activity status
- [ ] Works as PWA (installable)
- [ ] Cache clear doesn't lose data

---

## NOT IN BETA (Future Phases)

- ❌ AI Learning Buddy
- ❌ Customizable dashboard canvas
- ❌ Accountability pods
- ❌ Payment-gated verification
- ❌ Email automation
- ❌ Gamification/leaderboards/badges
- ❌ 11x LOVE EQ visualizer
- ❌ Plugin system
- ❌ Multi-community support

---

## GIT COMMIT STRATEGY

After each chunk completion:
```bash
git add .
git commit -m "Chunk X: [Feature Name] - [Brief description]"
git push origin main
```

---

## CURRENT STATUS — DETAILED BREAKDOWN

**Last Updated:** February 13, 2026

### ✅ Completed

**Infrastructure & Setup:**
- ✅ Railway private relay deployed and configured
- ✅ NIP-42 authentication enabled
- ✅ Admin pubkey whitelisted
- ✅ GitHub repository connected (`https://github.com/DJValerieBLOVE/11xLOVE-LaB.git`)
- ✅ Deployed to Shakespeare hosting (`https://11xLOVE.shakespeare.wtf`)
- ✅ Planning documents created (PLAN.md, PROJECT_OVERVIEW.md, DESIGN_SPEC.md)

**Chunk 1: Basic App Shell + Nostr Login** — ✅ COMPLETE
- ✅ React + Tailwind app shell
- ✅ Layout component with desktop sidebar (reduced to 208px for more content space)
- ✅ Mobile bottom nav
- ✅ Navigation: Big Dreams (default home), Experiments, Events, Tribe, Love Board, Vault, Feed, Profile
- ✅ Nostr login (NIP-07 + NIP-46) working
- ✅ Display user profile after login
- ✅ Logout button
- ✅ Profile dropdown menu
- ✅ LoginArea component for auth
- ✅ EQ Visualizer in header (compact mode)
- ✅ All buttons styled as pills (rounded-full) with consistent sizing

**Chunk 3: Experiment Catalog + Lesson Viewer** — ✅ COMPLETE (LocalStorage Only)
- ✅ Reusable experiment template system (TypeScript interfaces)
- ✅ Test experiment: "Morning Miracle - 3 Day Challenge" (3 lessons)
- ✅ **3-Column LMS Layout (25% | 50% | 25%)**:
  - Left: Course syllabus with progress tracking, module/lesson navigation
  - Middle: Video player, downloadable resources, lesson content, quiz section, action buttons
  - Right: Comment section with Heart/Zap/Reply interactions
- ✅ Sequential lesson unlock logic
- ✅ Progress percentage tracking
- ✅ YouTube/Vimeo video embed support
- ✅ Audio player toggle (optional)
- ✅ Downloadable resources section (PDFs, worksheets)
- ✅ Quiz section with sats reward display
- ✅ "Mark Complete" → saves to localStorage (relay integration pending)
- ✅ "Next Lesson" button after completion
- ✅ Share to Public Feed (only on FULL experiment completion)
- ✅ Comment structure with Heart (like), Zap (sats), Reply buttons
- ✅ Lesson status icons: ✅ Completed (green), 🔒 Locked (gray), ▶️ Available
- ✅ Routes: `/experiment/:experimentId/:lessonId?`

**Design System** — ✅ COMPLETE
- ✅ Official 11 Dimensions color system integrated
- ✅ TypeScript dimension constants (`/src/lib/dimensions.ts`)
- ✅ CSS custom properties for all 11 dimension colors
- ✅ DimensionBadge component
- ✅ EQ Visualizer component (full + compact versions)
- ✅ Consistent button styling (pill-shaped, proper heights)
- ✅ All icons are Lucide line icons (no emojis in UI)

### 🚧 Partially Complete (UI Ready, No Data Persistence)

**Pages Built But Not Connected to Relay:**
- 🚧 **Big Dreams** — UI exists with EQ Visualizer, no Nostr data persistence
- 🚧 **Experiments** — Shows test experiment, needs relay connection for progress
- 🚧 **Events** — Calendar UI exists, static data
- 🚧 **Tribe** — Tabs UI exists, placeholder content (waiting for NIP-29 in Chunk 5)
- 🚧 **Love Board** — Tabs UI exists, empty state
- 🚧 **Vault** — Placeholder page
- 🚧 **Feed** — Post feed UI exists, needs Nostr query

**Data Files:**
- ✅ `/src/data/test-experiment.ts` — Morning Miracle test experiment
- ✅ `/src/types/experiment.ts` — Complete TypeScript interfaces
- ✅ `/src/lib/dimensions.ts` — 11 Dimensions with colors and metadata
- ❌ Full 11x LOVE Code curriculum (18 lessons) not loaded yet

### ❌ Not Started / Needs Nostr Integration

**Chunk 2: Connect to Private Relay** — 🔜 NEXT PRIORITY
- ❌ WebSocket connection to Railway relay
- ❌ NIP-42 authentication handshake
- ❌ Publish completion events (kind:30078) instead of localStorage
- ❌ Query user progress from relay
- ❌ Sync progress across devices
- ❌ IndexedDB caching

**Curriculum Content:**
- ❌ Full 11x LOVE Code curriculum (18 lessons: Intro + 5 Modules + Bonus)
- ✅ Template system ready — just needs lesson content loaded
- ❌ Real worksheet PDFs uploaded and linked

**Interactive Features:**
- ❌ Quiz modal with multiple-choice + fill-in-blank questions
- ❌ Quiz scoring and pass/fail logic
- ❌ Sats rewards for quiz completion
- ❌ Comment posting to Nostr (NIP-10 threaded replies)
- ❌ Heart (reaction) events publishing (kind 7)
- ❌ Zap integration for comments (NIP-57)
- ❌ GIF support in comments

**Chunk 4: Daily Experiment Tracker + Streaks**
- ❌ Daily 5 V's practice form
- ❌ "I Did It!" check-in button
- ❌ Streak counter (kind:30078 replaceable)
- ❌ 30-day history view (✅/❌)
- ❌ Milestone celebrations (7/30/90 days)

**Chunk 5: Tribe (NIP-29 Private Community)**
- ❌ NIP-29 group on private relay
- ❌ Group chat feed
- ❌ Reply threading
- ❌ Member list
- ❌ Admin: add/remove members
- ❌ Basic moderation

**Chunk 6: Zapping (NIP-57)**
- ❌ Zap button on lessons
- ❌ Zap button on Tribe messages
- ❌ WebLN/NWC wallet connection
- ❌ Display zap amounts

**Chunk 7: Admin Dashboard**
- ❌ Admin-only route (check npub)
- ❌ Query relay for all kind:30078 events
- ❌ Metrics: total users, active 7d, completions
- ❌ Member list with status colors
- ❌ Completion funnel analytics

**Chunk 8: User Dashboard + Profile**
- ❌ Personal progress dashboard
- ❌ Experiments in progress (%)
- ❌ Current streak display
- ❌ Recent check-in history
- ❌ Profile settings
- ❌ Edit profile form

**Design Polish Needed:**
- 🔜 Redesign EQ Visualizer to be more exciting/dynamic
- 🔜 Add celebration animations for milestone achievements
- 🔜 Improve page headers to be more immersive
- 🔜 Enhanced micro-interactions and transitions
- 🔜 Replace remaining placeholder content with brand copy

### 🎯 Immediate Next Steps

**Priority 1: Experiments Page - Tabs & Organization** (30 min)
1. ❌ Add 3 tabs: "My Experiments", "All Experiments", "Suggested"
2. ❌ "My Experiments" tab (default): Shows enrolled experiments with progress
3. ❌ "All Experiments" tab: Full catalog
4. ❌ "Suggested" tab: Recommendations based on lowest EQ dimensions
5. ❌ Search bar: Search by keyword
6. ❌ Dimension filter dropdown: Filter by any of the 11 dimensions
7. ❌ Tag system: Experiments tagged with dimensions for filtering

**Priority 2: Lab Notes System - Journaling** (45 min)
1. ❌ Lab Notes section at end of each lesson (after quiz pass)
2. ❌ Prompt: "What did you discover in this lesson?"
3. ❌ Private journal entry (NIP-44 encrypted)
4. ❌ Auto-saves as user types
5. ❌ Optional - can skip to next lesson
6. ❌ Nostr event structure:
   - kind: 30078
   - tags: ["d", "lab-note"], ["experiment", "id"], ["lesson", "id"], ["dimension", "X"]
   - content: encrypted journal entry
7. ❌ Each lesson = separate lab note entry
8. ❌ Each experiment = collection of lesson notes

**Priority 3: Vault - Lab Notes View** (30 min)
1. ❌ "Lab Notes" section in Vault
2. ❌ Organized by experiment → lessons
3. ❌ Accordion: Click experiment to expand all lesson notes
4. ❌ Search lab notes by keyword
5. ❌ Export to PDF option
6. ❌ View growth over time

**Priority 4: Load Full 11x LOVE Code Curriculum** (30 min)
1. ❌ All 18 lessons: Intro + 5 Modules + Bonus
2. ❌ Module content, lesson text, quiz questions
3. ❌ Video placeholders (you'll add real URLs later)
4. ❌ Worksheet download links

**Priority 5: Connect to Railway Relay (Critical for Beta)** (2 hours)
1. ❌ Configure relay connection to `wss://nostr-rs-relay-production-1569.up.railway.app`
2. ❌ Implement NIP-42 authentication handshake
3. ❌ Publish completion events (kind:30078) instead of localStorage
4. ❌ Publish lab note events (kind:30078, encrypted)
5. ❌ Query user progress from relay
6. ❌ Sync progress across devices

**Priority 6: Daily 5 V's Practice (Chunk 4)** (2 hours)
1. ❌ Build 5 V's form component in Big Dreams
2. ❌ Implement streak tracking with kind:30078
3. ❌ Add celebration animations
4. ❌ Build 30-day history view

**PHASE 2 (On Hold):**
- 🔮 Sats economy + membership tiers
- 🔮 Payment integration
- 🔮 Multi-tenant setup
- 🔮 Gamification system

---

## 📚 Documentation

- **PLAN.md** (this file) — Build chunks, technical roadmap
- **PROJECT_OVERVIEW.md** — Full curriculum, user journey, philosophies
- **DESIGN_SPEC.md** — Brand colors, UI guidelines, component patterns
- **AGENTS.md** — AI assistant system prompt

---

**Ship this. Get real users. Learn. Iterate.** 🚀

*"Fall madly in love with life — 11 minutes a day."* 💜
