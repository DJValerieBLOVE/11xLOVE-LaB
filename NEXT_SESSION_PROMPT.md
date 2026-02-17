# Next Session Prompt

Copy and paste this into Shakespeare to start your next session.

---

Read these 2 files first: `PLAN.md` and `AGENTS.md`

We're starting **Phase 1A: Public Catalog + Membership Gates**. Do these 5 things in order:

1. Create `/public/robots.txt` (standard crawl permissions)
2. Create `/public/llms.txt` (describe what 11x LOVE LaB is, what experiments are, how the platform works — for AI crawlers)
3. Create `/public/sitemap.xml` (list public pages: /, /experiments, /feed)
4. Make the `/experiments` page accessible WITHOUT login (public catalog — SEO optimized with semantic HTML)
5. Add login redirect when a user clicks into an experiment detail page without being logged in

Commit after each step. Don't touch the feed or any existing components.

---

## After Phase 1A is done, here are the next prompts:

### Phase 1B: Big Dreams Dashboard

> Read `PLAN.md` (Big Dreams Dashboard section). Build the Big Dreams page as the homepage after login. Show 11 dimension cards in Prosperity Pyramid order. Each card shows the Big Dream text, related experiments, and a progress indicator. Data comes from kind 30078 events (one per dimension). Add widgets for experiments in progress and quick stats. Don't touch the feed.

### Phase 1C: Beta Onboarding

> Read `PLAN.md` (Two-Path Onboarding section). Add first-login detection. Show a welcome modal with two choices: "Quick Start" or "Deep Dive". Quick Start shows 11 dimension cards where the user types a 1-2 sentence Big Dream per dimension, saves as kind 30078 events, then lands on Big Dreams dashboard. Deep Dive redirects to the 11x LOVE Code Experiment 1. Don't touch the feed.

---

**Live Site:** https://11xlove-lab.shakespeare.wtf
**GitHub:** https://github.com/DJValerieBLOVE/11xLOVE-LaB.git
**Private Relay:** wss://nostr-rs-relay-production-1569.up.railway.app
