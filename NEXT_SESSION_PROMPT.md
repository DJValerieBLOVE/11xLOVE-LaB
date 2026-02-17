# Next Session Prompt

Copy and paste this into Shakespeare to start your next session.

---

Read these 2 files first: `PLAN.md` and `AGENTS.md`

**Phase 1A is COMPLETE ✅** — Public catalog, SEO files, and login gates are done.

---

## Current Task: Phase 1B — Big Dreams Dashboard

### Phase 1B: Big Dreams Dashboard

Read `PLAN.md` (Big Dreams Dashboard section). Build the Big Dreams page as the homepage after login. 

**Build these components:**
1. Big Dreams page component at `/src/pages/BigDreams.tsx`
2. 11 dimension cards in Prosperity Pyramid order (GOD/LOVE → Environment)
3. Each card shows: Big Dream text, related experiments, progress indicator
4. Data storage: kind 30078 Nostr events (one replaceable event per dimension)
5. Widgets: Experiments in progress, Quick stats, Streak status
6. Make Big Dreams the default route after login (update AppRouter.tsx)

**Testing checklist (REQUIRED before committing):**
- [ ] Build passes with zero errors
- [ ] Page renders correctly when logged in
- [ ] All 11 dimension cards display in correct order
- [ ] Cards show dimension emoji, name, and color
- [ ] Empty state shows when no Big Dreams exist
- [ ] Clicking "Edit" allows updating Big Dreams
- [ ] Data persists to private Railway relay
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] No font-bold/semibold/medium classes used
- [ ] No pink accent colors (only purple #6600ff)

Don't touch the feed or existing experiment pages.

### Phase 1C: Beta Onboarding

Read `PLAN.md` (Two-Path Onboarding section). Add first-login detection and welcome flow.

**Build these components:**
1. First-login detection (check localStorage for `hasCompletedOnboarding`)
2. Welcome modal with two buttons: "Quick Start" or "Deep Dive"
3. Quick Start flow: 11 dimension cards with textarea inputs for Big Dreams
4. Auto-save each Big Dream as kind 30078 event (one per dimension)
5. Deep Dive flow: Redirect to `/experiment/11x-love-code` (Experiment 1)
6. After completion, land on Big Dreams dashboard

**Testing checklist (REQUIRED before committing):**
- [ ] Build passes with zero errors
- [ ] Modal shows ONLY on first login (not on subsequent logins)
- [ ] Quick Start shows all 11 dimension cards
- [ ] User can type Big Dreams (1-2 sentences per dimension)
- [ ] Clicking "Save & Continue" publishes kind 30078 events to Railway relay
- [ ] Deep Dive redirects to Experiment 1
- [ ] After either path, modal doesn't show again
- [ ] Big Dreams persist and display on dashboard
- [ ] Responsive layout works on mobile
- [ ] No font-bold/semibold/medium classes
- [ ] No pink accent colors

Don't touch the feed or existing components.

---

**Live Site:** https://11xlove-lab.shakespeare.wtf
**GitHub:** https://github.com/DJValerieBLOVE/11xLOVE-LaB.git
**Private Relay:** wss://nostr-rs-relay-production-1569.up.railway.app
