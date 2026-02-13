# SHAKESPEARE.DIY — 11x LOVE LaB Platform Build Spec

> **Private coaching platform on Nostr. Build chunk by chunk. Test each chunk before moving to the next.**

---

## STATUS: PRE-FLIGHT COMPLETE ✅

- **Private Nostr relay deployed on Railway** (Feb 13, 2026)
- **Relay URL:** `wss://nostr-rs-relay-production-1569.up.railway.app`
- **Admin pubkey:** `3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767`
- **Auth:** NIP-42 whitelist mode — only admin pubkey can publish
- **Relay software:** nostr-rs-relay (Rust, SQLite-based)
- **Ready for:** Chunk 1 — Basic App Shell + Nostr Login

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
| **Data Persistence** | Private Nostr relay on Railway | All progress stored as Nostr events — persists across devices/browsers |
| **Local Cache** | IndexedDB (browser) | Speed layer only — relay is source of truth |
| **Private Community** | NIP-29 group on relay | Authenticated access, private by default |
| **Zaps / V4V** | NIP-57 | Non-custodial — user's own wallet |
| **Encryption** | NIP-44 | Private data encrypted with user's Nostr key |

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

### Chunk 2: Connect to Private Relay
**Build:**
- WebSocket connection to Railway relay
- NIP-42 authentication handshake
- Publish test event and read back
- IndexedDB caching

**Test:** Can app publish to relay and read back? Does second device see same event? ✓

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

### Chunk 5: Tribe (NIP-29 Private Community)
**Build:**
- NIP-29 group on private relay
- Group chat feed
- Reply threading
- Member list
- Admin: add/remove members
- Basic moderation

**Test:** Members can post? Only authenticated see messages? Admin can manage? ✓

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

## CURRENT STATUS

**Last Updated:** February 13, 2026

**Completed:**
- ✅ Railway private relay deployed and configured
- ✅ NIP-42 authentication enabled
- ✅ Admin pubkey whitelisted
- ✅ Planning document created
- ✅ GitHub repository connected

**In Progress:**
- 🚧 Chunk 1: Basic App Shell + Nostr Login

**Next Up:**
- ⏭️ Chunk 2: Connect to Private Relay

---

**Ship this. Get real users. Learn. Iterate.** 🚀
