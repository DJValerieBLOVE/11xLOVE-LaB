# Prompt for Next Session

Copy and paste this entire message to start your next chat:

---

## Context

I'm building **11x LOVE LaB**, a private coaching platform on Nostr. Read these files first:

1. `SESSION_NOTES.md` - What was done today
2. `PLAN.md` - Full build spec  
3. `TESTING_CHECKLIST.md` - Testing tasks
4. `src/test/relay.test.ts` - Security tests

## What's Built & Working

### Core Features:
- ✅ Nostr login (NIP-07/NIP-46)
- ✅ Three-tier privacy system (Never/Private/Shareable)
- ✅ Feed with REAL Nostr queries (4 tabs)
- ✅ Moderation (mute, report, admin tools)
- ✅ Love Board (paid members only posting)
- ✅ Vault with Magic Mentor training + data export + BYOR
- ✅ Experiments page with 6 tabs
- ✅ Experiment Builder for creators
- ✅ Membership tier system

### Real Nostr Queries:
- `useFeedPosts()` - All posts from LaB + public relays
- `useTribePosts()` - Private Tribe messages only
- `usePublicPosts()` - Public Nostr posts only
- `useLabPublish()` - Secure publishing to LaB relay

### Security Tests:
- `src/test/relay.test.ts` - Tests for:
  - Tribe messages NEVER go public
  - Private data stays on Railway relay
  - Public sharing only when user opts in

## What Needs Testing

1. **Login** on live site (https://11xLOVE.shakespeare.wtf)
2. **Feed** - Should now show real posts from relays
3. **Post something** - Should publish to LaB relay
4. **Check Railway** - Verify posts appear on private relay

## What's NOT Built Yet

1. **Tribe public/private toggle** (1 hr)
2. **Completion receipts** - anti-gaming (1 hr)
3. **Streak tracking** - gamification (1 hr)
4. **Magic Mentor AI** - OpenRouter/Grok (3-4 hrs)
5. **Full curriculum** - 18 lessons (1 hr)

## Technical Notes

- **Private Railway relay:** `wss://nostr-rs-relay-production-1569.up.railway.app`
- **Admin pubkey:** `3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767`
- All LaB data stays on Railway (never public)
- Users own their data (NIP-44 encryption)

## Today I Want To

1. Test the Feed with real Nostr posts
2. Verify posts publish to the Railway relay
3. Run the security tests
4. [Add your specific goal here]

## Key Files

- `src/hooks/useFeedPosts.ts` - Real Nostr feed queries
- `src/hooks/useLabPublish.ts` - Secure publishing
- `src/lib/relays.ts` - Relay config & privacy helpers
- `src/test/relay.test.ts` - Security tests

---

**Live Site:** https://11xLOVE.shakespeare.wtf  
**GitHub:** https://github.com/DJValerieBLOVE/11xLOVE-LaB.git

## To Run Tests Locally

```bash
npm test
# or
npx vitest run src/test/relay.test.ts
```
