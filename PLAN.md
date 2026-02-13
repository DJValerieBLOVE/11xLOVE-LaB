# 11x LOVE LaB - Build Plan & Specification

> **Project**: Private coaching platform on Nostr  
> **Private Relay**: `wss://nostr-rs-relay-production-1569.up.railway.app`  
> **Admin Pubkey**: `3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767`  
> **Pricing**: $1,000/year selective coaching community

---

## 🎯 Core Concept

Build a Nostr-native personal growth platform with sequential Experiments (courses), a private Tribe (community), daily tracking, zapping, and an admin dashboard — all powered by a **private Nostr relay on Railway** for persistent, cross-device user data.

**CRITICAL**: Build chunk by chunk. Test each chunk before moving to the next. Do NOT build everything at once.

---

## 🏗️ Architecture: Private Relay IS the Database

### The Core Insight
- **NO** Cloudflare Workers, D1, or PostgreSQL needed for beta
- **YES** Private Nostr relay on Railway = single source of truth for ALL user data
- Every user action publishes an **encrypted Nostr event** to the private relay
- Users log in from ANY device → relay reconstructs their full state
- No localStorage dependency. The relay IS the backend.

### Data Flow Example

**User Completes a Lesson:**
```
1. User clicks "Mark Complete" on Lesson 3
2. App creates kind:30078 event with encrypted progress
3. Event published to private Railway relay
4. Cached in browser IndexedDB for speed
5. Progress now persists across ALL devices
```

**User Logs In From New Device:**
```
1. User authenticates with Nostr key
2. App queries private relay for all user events
3. Relay returns encrypted progress events
4. App decrypts and reconstructs full state
5. User sees all progress restored
```

---

## 📖 Terminology (REQUIRED)

| ✅ USE THIS | ❌ NOT THIS |
|-------------|-------------|
| **Experiments** | Courses, lessons, modules |
| **Tribes** | Communities, groups |
| **LaB** (capital L, lowercase a, capital B) | Lab, LAB |
| **Sats** | Points, coins |
| **Zap** | Tip, donate |
| **Bitcoin** | Crypto |
| **Membership** | Subscription |
| **Value for Value (V4V)** | Free |

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | React + Tailwind CSS | Shakespeare MKStack template |
| **Identity** | Nostr (NIP-07/NIP-46) | User owns keys |
| **Data Persistence** | Private Nostr relay (Railway) | All progress as Nostr events |
| **Local Cache** | IndexedDB | Speed layer only |
| **Private Community** | NIP-29 group | Authenticated access |
| **Zaps** | NIP-57 | Non-custodial Lightning |
| **Encryption** | NIP-44 | Private data encrypted |

---

## 🔐 Custom Nostr Event Kinds

Use `kind: 30078` (replaceable app-specific data) for all user progress.

### Event Structures

**Experiment Completion:**
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
  content: nip44.encrypt({
    experimentId: "11x-love-code",
    lessonId: "module-1-lesson-3",
    completedAt: "2026-02-11T18:00:00Z"
  })
}
```

**Daily Check-in:**
```javascript
{
  kind: 30078,
  pubkey: "user_npub",
  tags: [
    ["d", "daily-checkin"],
    ["date", "2026-02-11"],
    ["experiment_name", "drink-8-glasses-water"]
  ],
  content: nip44.encrypt({
    date: "2026-02-11",
    experiment: "drink-8-glasses-water",
    completed: true,
    notes: "Felt great today!"
  })
}
```

**Streak Update (Replaceable):**
```javascript
{
  kind: 30078,
  pubkey: "user_npub",
  tags: [["d", "streak-current"]],
  content: nip44.encrypt({
    currentStreak: 7,
    longestStreak: 14,
    lastCheckIn: "2026-02-11"
  })
}
```

---

## 🎨 Design Standards

### Color Palette
```javascript
colors: {
  background: '#1a1a2e',      // Deep dark navy
  surface: '#16213e',          // Card backgrounds
  surfaceLight: '#0f3460',     // Hover states
  primary: '#eb00a8',          // PINK accent (brand)
  primaryLight: '#ff3dbf',     // Light pink hover
  secondary: '#e94560',        // Red/pink alerts
  accent: '#f39c12',           // Gold - streaks
  success: '#2ecc71',          // Green - completions
  text: '#ffffff',             // Primary text
  textMuted: '#a0a0b0',       // Secondary text
  border: '#2a2a4a',          // Subtle borders
}
```

### Design Principles
- **Light mode default** (spec requirement)
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

## 🔨 Build Chunks (Sequential Order)

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

## 📋 After Each Chunk - Checklist

- [ ] Loads without errors?
- [ ] Feature works as expected?
- [ ] Data persists after cache clear?
- [ ] Data syncs across devices?
- [ ] Doesn't break previous chunks?
- [ ] Admin dashboard still works?

**Only proceed when ALL boxes checked.**

---

## 🌐 Environment Variables

```bash
RELAY_URL=wss://nostr-rs-relay-production-1569.up.railway.app
ADMIN_NPUB=3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767
```

No database strings. No API keys. Relay + Nostr handle everything.

---

## 🎓 Experiment System Details

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
        content: "## Welcome, Beautiful Soul!...",
        videoUrl: "https://youtube.com/embed/XXXXX",
        duration: "5 min"
      },
      // ... more lessons
    ]
  }
]
```

---

## 👥 Tribe (NIP-29) Details

- **NIP-29** = relay-based groups with access control
- Private relay enforces authentication
- Members must auth (NIP-42) before read/write
- Messages stored on relay (persistent)
- Admin adds/removes members via relay config

### Tribe Features
1. Group chat feed
2. Member list
3. Admin controls (your npub only)
4. Zap support on messages

---

## ⚡ Zapping (NIP-57) Details

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

## 👑 Admin Dashboard Details

### How It Works
- You control private relay
- Query ALL events from ALL users
- Display aggregated analytics

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

## 📱 PWA Setup

```json
{
  "name": "11x LOVE LaB",
  "short_name": "11x LOVE",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#eb00a8"
}
```

---

## ✅ Success Criteria for Beta

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

## 🚫 NOT in Beta (Future Phases)

- ❌ AI Learning Buddy
- ❌ Customizable dashboard canvas
- ❌ Accountability pods
- ❌ Payment-gated verification
- ❌ Email automation
- ❌ Gamification/leaderboards/badges
- ❌ 11x LOVE EQ visualizer
- ❌ Plugin system
- ❌ Multi-community support

**Focus**: Can people log in, take Experiments, track progress, chat in Tribe, and zap — with admin visibility? If yes → beta success.

---

## 🎯 Key Nostr Implementation Notes

### Admin/Moderation Security
- **CRITICAL**: Nostr is permissionless — anyone can publish any event
- **ALWAYS** filter by `authors` field when querying admin/trusted actions
- Example: Admin queries MUST include `authors: [ADMIN_PUBKEY]`

### Efficient Query Design
- Minimize separate queries (avoid rate limiting)
- Combine kinds: `kinds: [1, 6, 16]` instead of 3 queries
- Filter in JavaScript after receiving results

### Event Validation
- Validate events with required tags/content
- Filter through validator functions
- Especially important for custom kinds (30078)

---

## 📚 Railway Relay Configuration

**Relay URL**: `wss://nostr-rs-relay-production-1569.up.railway.app`

**Allowed Event Kinds**:
- `kind: 1` - Text notes (Tribe messages)
- `kind: 7` - Reactions
- `kind: 9735` - Zap receipts
- `kind: 30078` - App-specific data (progress, check-ins, streaks)
- `kind: 39000-39002` - NIP-29 group events

**Environment Variables**:
- `RELAY_NAME` = "11x LOVE Private Relay"
- `RELAY_DESCRIPTION` = "Private relay for the 11x LOVE platform"
- `ADMIN_PUBKEY` = "3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767"
- `NIP42_AUTH` = "true"

**Cost**: ~$5-10/month for <100 users

---

## 📝 Git Commit Strategy

After each chunk completion:
```bash
git add .
git commit -m "Chunk X: [Feature Name] - [Brief description]"
```

Example:
```bash
git commit -m "Chunk 1: Basic App Shell + Nostr Login - Navigation, NIP-07/46 auth, profile display"
```

---

## 🔄 Current Status

**Last Updated**: February 13, 2026

**Completed**:
- ✅ Railway private relay deployed and configured
- ✅ NIP-42 authentication enabled
- ✅ Admin pubkey whitelisted
- ✅ Planning document created

**In Progress**:
- 🚧 Chunk 1: Basic App Shell + Nostr Login

**Next Up**:
- ⏭️ Chunk 2: Connect to Private Relay

---

**Ship this. Get real users. Learn. Iterate.** 🚀
