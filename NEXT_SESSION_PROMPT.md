# Next Session Prompt

Copy and paste everything below this line into Shakespeare to start your next session.

---

Read these files first: `PLAN.md`, `SESSION_NOTES.md`, and `AGENTS.md`

**Phase 1 is COMPLETE** ✅ (1A + 1B + 1C all done)
- Phase 1A: Public catalog, SEO files (robots.txt, llms.txt, sitemap.xml), login gates
- Phase 1B: Big Dreams Dashboard — real Nostr/NIP-44 encrypted storage on Railway relay
- Phase 1C: Beta Onboarding — two-path welcome modal (Quick Start / Deep Dive)

**ESLint CI is CLEAN** — GitHub Actions passing (tsc + eslint --max-warnings 0 + vitest + build).

---

## GIT PUSH RULE — DO THIS AFTER EVERY SINGLE COMMIT

The `git_commit` tool only commits locally. After EVERY commit you MUST run:
```
git push origin main
```
No exceptions. If you forget, Shakespeare shows "X commits ahead" and the sync breaks.

**Current correct git state:**
- Only ONE remote: `origin` → `https://github.com/DJValerieBLOVE/11xLOVE-LaB.git`
- Branch `main` tracks `origin/main`
- Do NOT add an `upstream` remote — it breaks Shakespeare's Sync UI

Verify before starting work:
```
git remote -v
git status
```
Should show only `origin` and "nothing to commit".

---

## MANDATORY PRE-COMMIT CHECKLIST (from AGENTS.md)

Before EVERY commit, verify:
1. Every imported name in every changed file is actually used in the file body
2. No hooks called after early returns
3. No `any` types, no unused variables, no FIXME/TODO comments
4. No `font-bold`, `font-semibold`, `font-medium` — Marcellus is weight 400 only
5. No pink as brand accent — purple `#6600ff` only (pink = GOD/LOVE dimension color only)
6. Build passes: use build_project tool to confirm zero errors

---

## STEP 1: MANUAL TESTING ON LIVE SITE (do before building anything new)

**Browser extension login does NOT work in Shakespeare preview.** Test on the live site:
**https://11xlove-lab.shakespeare.wtf**

### Phase 1A Tests (logged OUT)
- [ ] https://11xlove-lab.shakespeare.wtf/robots.txt — should show crawl rules
- [ ] https://11xlove-lab.shakespeare.wtf/llms.txt — should show AI description
- [ ] https://11xlove-lab.shakespeare.wtf/sitemap.xml — should show page list
- [ ] /experiments — catalog visible without login, search/filter works
- [ ] Click any experiment card — should show lock icon + "Login Required"

### Phase 1B Tests (logged IN with Alby/nos2x)
- [ ] Home page `/` shows Big Dreams dashboard (not login screen)
- [ ] All 11 dimension cards visible with correct emoji + color border
- [ ] Click "Add Vision" on empty card → textarea appears
- [ ] Type a dream, click "Save Vision" → toast says "Big Dream Saved"
- [ ] Hard refresh → dream loads back (proves encryption + Railway relay working)
- [ ] Click "Edit" on saved dream → can edit and re-save

### Phase 1C Tests (logged IN, fresh account with no Big Dreams)
- [ ] Log in → onboarding modal auto-appears
- [ ] "Quick Start" button → shows 11 dimension textarea cards
- [ ] Fill in 2-3 dreams, click "Save & Continue" → modal closes, dreams visible on dashboard
- [ ] Test "Back" button → returns to path selection
- [ ] "Deep Dive" button → redirects to /experiment/11x-love-code

---

## STEP 2: BUILD PHASE 2 — CHOOSE ONE PATH

### Option A: Magic Mentor AI (recommended — highest user value)

Read `docs/AI-ARCHITECTURE.md` for full spec.

**What to build:**
1. `/src/lib/openrouter.ts` — OpenRouter API client (Grok 3 Fast or similar)
2. `/src/hooks/useMagicMentor.ts` — chat hook with user memory (loads Big Dreams + experiments)
3. `/src/components/MagicMentorChat.tsx` — chat UI (message bubbles, input, send button)
4. `/src/pages/MagicMentor.tsx` — full page with layout
5. Add route `/magic-mentor` to AppRouter.tsx
6. Add to navigation (Layout sidebar + mobile nav)
7. Encrypted conversation storage (kind 30078, d-tag = `magic-mentor-history`)
8. BYOK: user can paste their own OpenRouter API key (stored in localStorage)

**Testing checklist:**
- [ ] Chat page renders without errors
- [ ] Can type and send a message
- [ ] Response streams back from AI
- [ ] Conversation persists on page refresh (Railway relay)
- [ ] AI references user's Big Dreams in responses
- [ ] BYOK mode: entering API key in settings works
- [ ] Error state when API key missing/invalid
- [ ] Mobile layout works

---

### Option B: Streak Tracking + Check-ins (simpler, good for beta)

**What to build:**
1. `/src/hooks/useStreaks.ts` — load/save streak data (kind 30078, d-tag = `streak-data`, NIP-44 encrypted)
2. `/src/components/DailyPracticeButton.tsx` — "I Did It!" check-in button
3. Update BigDreams.tsx streak card — replace mock data with real streak hook
4. 30-day history calendar (real data instead of random colors)
5. Milestone toasts: 7 days 🔥, 30 days 🎉, 90 days 💜

**Event structure:**
```json
{
  "kind": 30078,
  "tags": [["d", "streak-data"], ["t", "big-dreams"]],
  "content": "NIP-44 encrypted JSON: { currentStreak, longestStreak, totalCheckins, lastCheckin, history: [dates] }"
}
```

**Testing checklist:**
- [ ] Click "I Did It!" → streak increments
- [ ] Refresh → streak persists
- [ ] Calendar shows real check-in dates
- [ ] Milestone toast fires at 7 days
- [ ] Streak resets if no check-in yesterday

---

## KEY FACTS

| Item | Value |
|------|-------|
| Live site | https://11xlove-lab.shakespeare.wtf |
| GitHub | https://github.com/DJValerieBLOVE/11xLOVE-LaB.git |
| Private relay | wss://nostr-rs-relay-production-1569.up.railway.app |
| Admin pubkey | 3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767 |
| Brand color | #6600ff (purple) — all buttons, links, tabs |
| Font | Marcellus — weight 400 ONLY, never bold/semibold/medium |
| Big Dreams storage | kind 30078, d-tag = big-dream-{1-11}, NIP-44 encrypted |
| Privacy | All LaB data → Railway relay only. Never public relays. |
