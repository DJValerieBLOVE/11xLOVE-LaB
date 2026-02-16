# 🎯 START HERE - 11x LOVE LaB Documentation Index

**Last Updated:** February 16, 2026  
**Status:** Feed bugs documented, root cause identified, ready for debugging

---

## 📚 DOCUMENTATION GUIDE

### 🚨 **FOR DEBUGGING THE FEED (Start with this)**

1. **[OPUS_HANDOFF.md](OPUS_HANDOFF.md)** ⭐ **READ THIS FIRST**
   - Quick-start guide for Opus
   - Root cause of stale data bug
   - Step-by-step fix instructions
   - 15-minute action plan

2. **[PRIMAL_SOURCE_FINDINGS.md](PRIMAL_SOURCE_FINDINGS.md)** ⭐ **CRITICAL**
   - Analysis of Primal's actual source code
   - Exact timestamp bug identified
   - Line-by-line comparison
   - Fix examples

3. **[FEED_BUGS.md](FEED_BUGS.md)**
   - All 5 bugs documented
   - Debug steps for each
   - Console log examples
   - Action plan

4. **[FEED_SYSTEM_SUMMARY.md](FEED_SYSTEM_SUMMARY.md)**
   - Complete architecture overview
   - How Primal works
   - What we're doing different
   - Privacy system explained

---

### 📖 **FOR UNDERSTANDING THE PROJECT**

5. **[PLAN.md](PLAN.md)**
   - Full build specification
   - Chunk-by-chunk progress
   - Technology stack
   - Design system
   - Membership tiers

6. **[SESSION_NOTES.md](SESSION_NOTES.md)**
   - Session history
   - What was built when
   - Current status
   - Known issues

---

### 🔐 **FOR PRIVACY & SECURITY**

7. **[/src/lib/relays.ts](/src/lib/relays.ts)**
   - Three-tier privacy system
   - Relay configuration
   - Privacy levels

8. **[/src/hooks/useLabPublish.ts](/src/hooks/useLabPublish.ts)**
   - Secure publishing hooks
   - LaB vs public relay logic

---

### 🎨 **FOR DEVELOPMENT**

9. **[/docs/11x-LOVE-CODE-CURRICULUM.md](/docs/11x-LOVE-CODE-CURRICULUM.md)**
   - Full lesson content
   - Experiment structure

10. **[/docs/AI-ARCHITECTURE.md](/docs/AI-ARCHITECTURE.md)**
    - Magic Mentor AI plans
    - OpenRouter integration

11. **[/docs/PROJECT-STATUS.md](/docs/PROJECT-STATUS.md)**
    - Phase 2 planning
    - Feature roadmap

---

## 🎯 QUICK START BY TASK

### "I need to debug the feed"
→ Read: **OPUS_HANDOFF.md** → **PRIMAL_SOURCE_FINDINGS.md** → **FEED_BUGS.md**

### "I need to understand the architecture"
→ Read: **FEED_SYSTEM_SUMMARY.md** → **PLAN.md**

### "I need to add a feature"
→ Read: **PLAN.md** → **SESSION_NOTES.md** → Relevant code files

### "I need to understand privacy"
→ Read: **FEED_SYSTEM_SUMMARY.md** (Privacy section) → **/src/lib/relays.ts**

### "I need to test login"
→ **IMPORTANT:** Browser extension login (Alby, nos2x) does NOT work in Shakespeare preview due to iframe restrictions. Test on live site: https://11xLOVE.shakespeare.wtf

---

## 🔥 THE URGENT ISSUE

**Feed shows old posts (18+ minutes old) and reverts to stale data after refresh.**

**Root Cause:** Timestamp handling in `/src/lib/primalCache.ts` line 250

**Fix:** Change `Math.floor()` to `Math.ceil()` and fix `until || default` logic

**Estimated Time:** 15-30 minutes

**Details:** See **OPUS_HANDOFF.md**

---

## 📋 ALL CURRENT BUGS

| # | Bug | Priority | File | Status |
|---|-----|----------|------|--------|
| 1 | Stale data | 🔴 HIGH | primalCache.ts:250 | Root cause found |
| 2 | Raw JSON display | 🟡 MED | NoteContent.tsx:114-122 | Needs investigation |
| 3 | Images not loading | 🟡 MED | NoteContent.tsx:50-88 | URL regex issue |
| 4 | Links not working | 🟡 MED | NoteContent.tsx:210-226 | Filtering logic |
| 5 | Stats intermittent | 🟢 LOW | useFeedPosts.ts:186-222 | Race condition? |

---

## ✅ WHAT'S WORKING

- ✅ Nostr login (NIP-07, NIP-46)
- ✅ Navigation & routing
- ✅ Experiment catalog & viewer
- ✅ Privacy system (3-tier)
- ✅ Primal WebSocket connection
- ✅ Stats parsing (when they load)
- ✅ Feed UI & tabs
- ✅ Moderation system

---

## 🚧 WHAT'S NOT WORKING

- ❌ Feed shows stale data
- ❌ Some posts show raw JSON
- ❌ Images don't load reliably
- ❌ Links don't work properly
- ❌ Stats missing sometimes

---

## 🎯 TERMINOLOGY (STRICT - USE THESE)

| ✅ Correct | ❌ Wrong |
|------------|----------|
| **Experiments** | Courses, lessons, modules |
| **Tribes** | Communities, groups |
| **LaB** | Lab, LAB |
| **Sats** | Points, coins |
| **Zap** | Tip, donate |
| **Big Dream** | Goal |

---

## 🔐 PRIVACY RULES

### Feed Tabs:
- **Latest:** Public (shareable)
- **Tribes:** Private (NEVER shareable)
- **Buddies:** Private (NEVER shareable)

### Three-Tier System:
```
🔴 NEVER SHAREABLE
   - Tribe messages (kinds 9, 11, 12)
   - Buddy messages (accountability partners)
   - NO share button

🟡 PRIVATE BY DEFAULT
   - Big Dreams, journals (kind 30078)
   - Optional share with warning dialog

🟢 SHAREABLE
   - Feed posts (kind 1)
   - User chooses: LaB only OR public
```

---

## 📊 PROJECT STATUS

**Phase:** Beta - Feed system debugging  
**Deployment:** https://11xLOVE.shakespeare.wtf  
**Repository:** https://github.com/DJValerieBLOVE/11xLOVE-LaB.git  
**Private Relay:** wss://nostr-rs-relay-production-1569.up.railway.app

**What's Complete:**
- App shell, navigation, login
- Experiment catalog & viewer
- Privacy system & secure publishing
- Feed UI (Latest, Tribes, Buddies tabs)
- Primal cache integration
- Moderation system

**What's Next:**
1. Fix feed bugs (CURRENT PRIORITY)
2. Completion receipts & sats earning
3. Streak tracking & gamification
4. Magic Mentor AI integration

---

## 🆘 SUPPORT

**Live Site:** https://11xLOVE.shakespeare.wtf  
**GitHub:** https://github.com/DJValerieBLOVE/11xLOVE-LaB.git  
**Admin Pubkey:** 3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767

---

## 💜 QUICK LINKS

- [Fix the Feed](OPUS_HANDOFF.md) ⭐
- [Root Cause Analysis](PRIMAL_SOURCE_FINDINGS.md)
- [All Bugs](FEED_BUGS.md)
- [System Overview](FEED_SYSTEM_SUMMARY.md)
- [Full Plan](PLAN.md)
- [Session History](SESSION_NOTES.md)

---

**Last Updated:** February 16, 2026  
**Next Action:** Debug feed using OPUS_HANDOFF.md  
**Estimated Time:** 15-60 minutes

Peace, LOVE, & Warm Aloha 💜
