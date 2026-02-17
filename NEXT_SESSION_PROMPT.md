# Next Session Prompt

Copy and paste this into Shakespeare to start your next session.

---

Read these files first: `PLAN.md`, `SESSION_NOTES.md`, and `AGENTS.md`

**Phase 1 is COMPLETE** ✅ (1A + 1B + 1C all done)
- Phase 1A: Public catalog, SEO files, login gates
- Phase 1B: Big Dreams Dashboard with real Nostr integration
- Phase 1C: Beta Onboarding with two-path modal

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

## Manual Testing (DO FIRST)

Deploy and manually test on the live site: https://11xlove-lab.shakespeare.wtf

**Phase 1A Testing:**
- [ ] Visit /robots.txt, /llms.txt, /sitemap.xml
- [ ] Visit /experiments (logged out) — should show catalog
- [ ] Click experiment card — should show login gate
- [ ] Log in and view experiment content

**Phase 1B Testing:**
- [ ] Visit / (home page) — should show Big Dreams dashboard
- [ ] Verify all 11 dimension cards render with correct emoji, name, color
- [ ] Click "Add Vision" on empty card — should show textarea
- [ ] Type a Big Dream and click "Save Vision" — should encrypt and save to Railway relay
- [ ] Refresh page — Big Dream should load back (decrypted)
- [ ] Click "Edit" on existing dream — should allow editing

**Phase 1C Testing:**
- [ ] Create new Nostr account (or use account with no Big Dreams)
- [ ] Log in — onboarding modal should auto-show
- [ ] Try "Quick Start" path — should show 11 dimension input cards
- [ ] Fill in at least one dream and click "Save & Continue" — should save all and close modal
- [ ] Try "Deep Dive" path — should redirect to /experiment/11x-love-code

---

## Next Priority: Phase 2 — Magic Mentor AI

Read `docs/AI-ARCHITECTURE.md` for the full Magic Mentor spec.

**What to build:**
1. OpenRouter integration with Grok 4.1 Fast
2. User memory system (loads Big Dreams, experiments, journals from Nostr)
3. Encrypted conversation storage (kind 30078)
4. References Big Dreams, experiments, journals in context
5. Prompt caching for 90% cost savings
6. BYOK support (user brings own OpenRouter API key)

**Key files to create:**
- `/src/hooks/useMagicMentor.ts` — Chat completions hook
- `/src/components/MagicMentorChat.tsx` — Chat UI component
- `/src/lib/openrouter.ts` — OpenRouter API client
- Add Magic Mentor page to navigation

**Testing checklist:**
- [ ] Chat interface renders correctly
- [ ] Messages send and receive
- [ ] Conversation history persists (encrypted on Railway relay)
- [ ] User memory loads (Big Dreams, experiments)
- [ ] BYOK mode works (user provides API key)
- [ ] Error handling for API failures
- [ ] Loading states during API calls

---

## Alternative Priority: Experiment Progress + Streak Tracking

If you prefer to defer AI integration, build these features instead:

**Chunk 4: Daily Experiment Tracker + Streaks**
- Daily experiment display
- "I Did It!" check-in button
- Streak counter (kind 30078 replaceable)
- 30-day history view (✅/❌)
- Milestone celebrations (7/30/90 days)

**Chunk 9: Completion Receipts + Anti-Gaming**
- One-time completion events per lesson (kind 30078 replaceable)
- Sats earned tracking (replaceable event per user)
- Anti-gaming: same d-tag = overwrite (can't earn twice)
- Creator gets zapped on experiment completion

---

**Live Site:** https://11xlove-lab.shakespeare.wtf
**GitHub:** https://github.com/DJValerieBLOVE/11xLOVE-LaB.git
**Private Relay:** wss://nostr-rs-relay-production-1569.up.railway.app
**Admin pubkey:** 3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767
