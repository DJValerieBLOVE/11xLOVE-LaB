# Next Session Prompt

Copy and paste everything below the line into Shakespeare to start your next session.

---

Read these files first: `PLAN.md`, `SESSION_NOTES.md`, and `AGENTS.md`

**Phase 1 is COMPLETE** ✅ (1A + 1B + 1C all done)
- Phase 1A: Public catalog, SEO files (robots.txt, llms.txt, sitemap.xml), login gates
- Phase 1B: Big Dreams Dashboard — real Nostr/NIP-44 encrypted storage on Railway relay
- Phase 1C: Beta Onboarding — two-path welcome modal (Quick Start / Deep Dive)

**ESLint CI is CLEAN** — GitHub Actions passing (tsc + eslint --max-warnings 0 + vitest + build).

---

## MANDATORY: READ AGENTS.md BEFORE WRITING ANY CODE

AGENTS.md contains the complete commit workflow. Every commit must follow the **5-step workflow** in order — no shortcuts:

**STEP 1 — Verify imports in every changed file**
Every imported name must actually be used in the file body. No unused imports, no hooks after early returns, no `any` types, no FIXME/TODO comments.

**STEP 2 — Run font and color checks (zero results required)**
```bash
grep -rn "font-bold\|font-semibold\|font-medium" src/ --include="*.tsx" --include="*.ts"
grep -rn "from-pink\|to-pink\|bg-pink\|text-pink\|border-pink" src/ --include="*.tsx" --include="*.ts"
```

**STEP 3 — Run build_project tool — must say ✅ Successfully built**

**STEP 4 — Commit using git_commit tool**

**STEP 5 — Push immediately after every commit, no exceptions:**
```bash
git push origin main
```

**Git state — verify this before starting:**
```bash
git remote -v   # Must show ONLY origin, never upstream
git status      # Must say "nothing to commit, working tree clean"
```
If `upstream` exists: `git remote remove upstream`

---

## STEP 1: MANUAL TESTING ON LIVE SITE (do before writing any new code)

**Browser extension login does NOT work in Shakespeare preview iframes.**
Test everything on the deployed site: **https://11xlove-lab.shakespeare.wtf**

### Phase 1A (logged OUT)
- [ ] /robots.txt — shows crawl rules
- [ ] /llms.txt — shows AI description
- [ ] /sitemap.xml — shows page list
- [ ] /experiments — catalog visible without login, search/filter works
- [ ] Click any experiment card — shows lock icon + "Login Required"

### Phase 1B (logged IN with Alby/nos2x)
- [ ] Home page `/` shows Big Dreams dashboard (not a login screen)
- [ ] All 11 dimension cards visible with correct emoji + color border
- [ ] Click "Add Vision" → textarea appears
- [ ] Type a dream, click "Save Vision" → toast confirms saved
- [ ] Hard refresh → dream loads back (proves NIP-44 encryption + Railway relay working)
- [ ] Click "Edit" on saved dream → can edit and re-save

### Phase 1C (logged IN with a fresh account that has no Big Dreams yet)
- [ ] Log in → onboarding modal auto-appears
- [ ] "Quick Start" → shows 11 dimension textarea cards
- [ ] Fill in 2-3 dreams, click "Save & Continue" → modal closes, dreams show on dashboard
- [ ] "Back" button → returns to path choice screen
- [ ] "Deep Dive" → redirects to /experiment/11x-love-code

---

## STEP 2: BUILD PHASE 2 — CHOOSE ONE PATH

### Option A: Magic Mentor AI (recommended — highest user value)

Read `docs/AI-ARCHITECTURE.md` for full spec.

**What to build:**
1. `/src/lib/openrouter.ts` — OpenRouter API client (Grok 3 Fast or similar)
2. `/src/hooks/useMagicMentor.ts` — chat hook with user memory (loads Big Dreams + experiment progress)
3. `/src/components/MagicMentorChat.tsx` — chat UI (message bubbles, input, send button)
4. `/src/pages/MagicMentor.tsx` — full page with Layout
5. Add route `/magic-mentor` to AppRouter.tsx
6. Add to navigation (Layout sidebar + mobile bottom nav)
7. Encrypted conversation history (kind 30078, d-tag = `magic-mentor-history`, NIP-44)
8. BYOK: user pastes their own OpenRouter API key (stored in localStorage)

**Testing checklist (run build_project + git push origin main after each feature):**
- [ ] Chat page renders without errors
- [ ] Can type and send a message
- [ ] AI response streams back
- [ ] Conversation persists after hard refresh (Railway relay)
- [ ] AI references user's Big Dreams in responses
- [ ] BYOK mode works (user enters API key)
- [ ] Error state shown when API key missing or invalid
- [ ] Mobile layout works

---

### Option B: Streak Tracking + Daily Check-ins (simpler, good for beta)

**What to build:**
1. `/src/hooks/useStreaks.ts` — load/save streak data (kind 30078, d-tag = `streak-data`, NIP-44 encrypted)
2. `/src/components/DailyPracticeButton.tsx` — "I Did It!" check-in button
3. Update BigDreams.tsx — replace mock streak data with real `useStreaks` hook
4. 30-day history calendar (real check-in dates instead of random colors)
5. Milestone toasts: 7 days 🔥, 30 days 🎉, 90 days 💜

**Event structure:**
```json
{
  "kind": 30078,
  "tags": [["d", "streak-data"], ["t", "big-dreams"]],
  "content": "NIP-44 encrypted JSON: { currentStreak, longestStreak, totalCheckins, lastCheckin, history: [YYYY-MM-DD] }"
}
```

**Testing checklist (run build_project + git push origin main after each feature):**
- [ ] Click "I Did It!" → streak increments, toast fires
- [ ] Hard refresh → streak persists (Railway relay)
- [ ] Calendar shows actual check-in dates
- [ ] Milestone toast fires at 7 days
- [ ] Streak resets correctly if no check-in yesterday

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
| Big Dreams | kind 30078, d-tag = big-dream-{1-11}, NIP-44 encrypted, Railway relay only |
| Privacy | All LaB data → Railway relay only. Never public relays. |
