# Next Session Prompt

Copy and paste this into Shakespeare to start your next session.

---

Read these files first: `PLAN.md`, `SESSION_NOTES.md`, and `AGENTS.md`

**Phase 1A is COMPLETE** — Public catalog, SEO files (robots.txt, llms.txt, sitemap.xml), and login gates are done.
**ESLint CI is CLEAN** — GitHub Actions passing (tsc + eslint --max-warnings 0 + vitest + build).

---

## IMPORTANT: Pre-Commit Rules

**AGENTS.md has mandatory rules.** Before EVERY commit:
1. For EACH file you changed, verify every imported name is actually used in the file body
2. No hooks called after early returns
3. No `any` types, no FIXME/TODO comments, no unused variables
4. No `font-bold`, `font-semibold`, `font-medium` (Marcellus font = weight 400 only)
5. No pink as brand accent (purple #6600ff only, pink is GOD/LOVE dimension color only)
6. Build must pass before committing
7. Push to BOTH `origin` and `upstream` after committing

---

## Phase 1A Manual Testing (DO FIRST)

Before building anything new, deploy and manually test Phase 1A on the live site:

**Test 1: SEO Files**
- [ ] Visit https://11xlove-lab.shakespeare.wtf/robots.txt
- [ ] Visit https://11xlove-lab.shakespeare.wtf/llms.txt
- [ ] Visit https://11xlove-lab.shakespeare.wtf/sitemap.xml

**Test 2: Public Experiments Catalog (logged OUT)**
- [ ] Visit /experiments — should show experiment cards without login
- [ ] Search and filter should work
- [ ] LoginArea shows at top

**Test 3: Login Gate (logged OUT)**
- [ ] Click any experiment card — should show login gate with title/description
- [ ] Lock icon + "Login Required" message visible

**Test 4: Experiment Content (logged IN)**
- [ ] Log in with Nostr (must be on deployed site, not Shakespeare preview)
- [ ] Navigate to /experiment/morning-miracle-3day — should show LessonViewer

---

## Current Task: Phase 1B — Big Dreams Dashboard

Read `PLAN.md` (Big Dreams Dashboard section and Chunk 4). Build the Big Dreams page as the homepage after login.

**What to build:**
1. Upgrade `/src/pages/BigDreams.tsx` — currently has mock data, needs real Nostr integration
2. 11 dimension cards in Prosperity Pyramid order (use `DIMENSIONS` from `/src/lib/dimensions.ts`)
3. Each card: Big Dream text (editable), dimension color border, emoji, progress indicator
4. Data storage: kind 30078 Nostr events on Railway relay (one replaceable event per dimension, d-tag = `big-dream-${dimensionNumber}`)
5. Encrypt content with NIP-44 (Big Dreams are PRIVATE BY DEFAULT)
6. Widgets: Experiments in progress, Quick stats, Streak placeholder
7. Big Dreams is already the default route (`/` in AppRouter.tsx)

**Key files to read:**
- `/src/lib/dimensions.ts` — dimension names, numbers, colors, emojis
- `/src/hooks/useEncryptedStorage.ts` — NIP-44 encryption hooks
- `/src/hooks/useLabPublish.ts` — publishing to Railway relay
- `/src/lib/relays.ts` — privacy levels (kind 30078 = PRIVATE BY DEFAULT)
- `/src/pages/BigDreams.tsx` — current page (has mock data, needs upgrade)

**Testing checklist (REQUIRED before committing):**
- [ ] Build passes with zero errors
- [ ] ESLint passes (check all imports used, no conditional hooks)
- [ ] Page renders correctly when logged in
- [ ] All 11 dimension cards display in correct order
- [ ] Cards show dimension emoji, name, and correct color
- [ ] Empty state shows when no Big Dreams saved yet
- [ ] Can type and save a Big Dream for each dimension
- [ ] Data saves to Railway relay as kind 30078 (encrypted)
- [ ] Data loads back on page refresh
- [ ] Logged-out state shows login prompt
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] No font-bold/semibold/medium classes
- [ ] No pink accent colors (only purple #6600ff for buttons/links)

---

## After Phase 1B: Phase 1C — Beta Onboarding

Read `PLAN.md` (Two-Path Onboarding section).

**What to build:**
1. First-login detection (check if user has any kind 30078 Big Dream events)
2. Welcome modal: "Quick Start" or "Deep Dive"
3. Quick Start: 11 dimension cards with textarea inputs, save all at once
4. Deep Dive: Redirect to `/experiment/11x-love-code`
5. After either path, Big Dreams dashboard populated

---

**Live Site:** https://11xlove-lab.shakespeare.wtf
**GitHub:** https://github.com/DJValerieBLOVE/11xLOVE-LaB.git
**Private Relay:** wss://nostr-rs-relay-production-1569.up.railway.app
**Admin pubkey:** 3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767
