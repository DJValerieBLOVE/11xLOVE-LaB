# 11x LOVE LaB - Final Pricing Structure

**Last Updated**: February 14, 2026

---

## 💰 Pricing Tiers

### **Core: $11/month or $99/year**
- **2,000,000 tokens/month** (using Grok 4.1 Fast via OpenRouter)
- Take all admin-created experiments (unlimited)
- Magic Mentor conversations (unlimited within tokens)
- Daily LOVE Practice check-ins with AI analysis
- Journal entries with AI insights
- Accountability buddy matching (unlimited)
- Progress tracking across 11 dimensions
- Community/Tribe access
- ❌ **Cannot create own experiments**

**Annual savings**: $33/year (3 months free)

---

### **Creator: $25/month or $199/year**
- **10,000,000 tokens/month** (using Grok 4.1 Fast via OpenRouter)
- Everything in Core tier
- ✅ **Create unlimited own experiments** (AI-generated)
- Priority support
- Advanced analytics

**Annual savings**: $101/year (4 months free)

---

### **BYOK: $11/month or $99/year**
- **Unlimited tokens** (user provides their own OpenRouter API key)
- Everything unlocked (all Creator features)
- User pays OpenRouter directly for their usage
- Platform access fee only
- Zero AI costs to platform

**Annual savings**: $33/year

---

## 🤖 AI Model & Provider

### **Primary Model: Grok 4.1 Fast (xAI)**
- Provider: OpenRouter
- Cost: $0.20 input / $0.50 output per 1M tokens
- Average: ~$0.35 per 1M tokens (with OpenRouter 5.5% fee: ~$0.37/1M)
- Context window: 2,000,000 tokens
- Reasoning: Optional (can enable for complex tasks)

### **Why Grok via OpenRouter:**
1. Cheapest high-quality option ($0.37 vs Mistral $1.00)
2. American company (xAI/Elon Musk)
3. Huge context window (can hold full user history)
4. OpenRouter provides easy model testing/switching
5. Automatic fallbacks if model is down
6. Built-in BYOK support

---

## 💵 Cost Breakdown

### **Core Tier ($11/month):**
- AI (2M tokens @ $0.37/1M): $0.74
- Stripe processing: $0.62
- Relay hosting: $0.05
- **Total cost: $1.41**
- **Profit: $9.59** (87% margin)

### **Creator Tier ($25/month):**
- AI (10M tokens @ $0.37/1M): $3.70
- Stripe processing: $1.03
- Relay hosting: $0.05
- **Total cost: $4.78**
- **Profit: $20.22** (81% margin)

### **BYOK Tier ($11/month):**
- AI: $0.00 (user pays)
- Stripe processing: $0.62
- Relay hosting: $0.05
- **Total cost: $0.67**
- **Profit: $10.33** (94% margin)

---

## 📊 What Tokens Get You

### **1 Token = 0.75 words (or 4 characters)**

**Examples:**
- "Hello world" = 2 tokens
- "I'm feeling stressed" = 3 tokens
- 100 words = 133 tokens
- 1,000 words = 1,333 tokens

### **Realistic Token Usage:**

**Magic Mentor Chat (with caching):**
- First chat in session: ~1,000 tokens (build cache)
- Subsequent chats: ~50 tokens (cache hit!)
- **Average: ~100 tokens per chat**

**Daily LOVE Practice Check-in:**
- User completes 5V check-in
- AI analyzes and provides insights
- **~200 tokens per check-in**

**Journal Entry Analysis:**
- User writes 200-word journal entry
- AI spots patterns, provides feedback
- **~500 tokens per analysis**

**Accountability Matching:**
- Compare two user profiles
- **~300 tokens per match**

**Experiment Generation (Creator tier only):**
- Generate 5-lesson experiment with quizzes
- **~4,000 tokens per experiment**

---

## 🎯 What Users Can Actually Do

### **Core Tier (2M tokens):**
With prompt caching (90% savings):
- ~8,000 Magic Mentor chats
- OR ~10,000 Daily LOVE Practice check-ins
- OR ~4,000 journal analyses
- OR realistic mix: 100 chats + 30 check-ins/month + 20 journal entries

**Bottom line: Unlimited for normal use!**

### **Creator Tier (10M tokens):**
- ~40,000 Magic Mentor chats
- OR ~2,500 experiments created
- OR realistic: 200 experiments + 10,000 chats

**Bottom line: Basically unlimited!**

---

## 💎 Credit Top-Up Packs (If Needed)

For users who exceed their monthly allowance:

**Token Packs (15% markup):**
- 1M tokens: $0.42 (~4,000 chats)
- 5M tokens: $2.10 (~20,000 chats)
- 10M tokens: $4.20 (~40,000 chats)

**Realistically, very few users will need top-ups with 2M/10M base allocations.**

---

## 🔐 BYOK Implementation

### **How Users Set Up BYOK:**

1. User creates OpenRouter account
2. User adds credits to OpenRouter ($10+ recommended)
3. User generates API key on OpenRouter
4. User pastes key into 11x LOVE LaB settings
5. App validates key and stores it (encrypted)
6. All AI features now use THEIR key
7. OpenRouter bills THEM directly

### **Security:**
- API keys encrypted at rest in browser localStorage
- Keys never sent to your servers (client-side only)
- Users can revoke/change keys anytime
- Validation before accepting key

### **Your Costs:**
- **$0 for AI** (they pay OpenRouter)
- $0.62 Stripe processing
- $0.05 relay hosting
- **Profit: $10.33/user**

---

## 📈 Revenue Projections

### **Conservative (100 users):**
- 70 Core ($11) = $770/month
- 20 Creator ($25) = $500/month
- 10 BYOK ($11) = $110/month
- **Total: $1,380/month**
- **Costs: ~$168**
- **Profit: ~$1,212/month ($14,544/year)**

### **Moderate (500 users):**
- 350 Core = $3,850/month
- 100 Creator = $2,500/month
- 50 BYOK = $550/month
- **Total: $6,900/month**
- **Costs: ~$840**
- **Profit: ~$6,060/month ($72,720/year)**

### **Growth (1,000 users):**
- 700 Core = $7,700/month
- 200 Creator = $5,000/month
- 100 BYOK = $1,100/month
- **Total: $13,800/month**
- **Costs: ~$1,680**
- **Profit: ~$12,120/month ($145,440/year)**

---

## 🎯 Business Model

**The LaB is the lead generator for The Tribe.**

### **Customer Journey:**
1. **Free browsing** - Explore experiments, read content
2. **Core ($11/month)** - Take experiments, Magic Mentor, tracking
3. **Creator ($25/month)** - Create own experiments, share with Tribe
4. **Tribe ($97-297/month)** - Communities, masterminds, office hours
5. **Mastermind (Custom)** - 1-on-1 coaching, custom programs

### **LaB Goal:**
- Sustainable profit ($9-20/user)
- Incredible value (unlimited AI coaching)
- Build trust through transformation
- Create demand for Tribe upgrades

**Target: 1,000 LaB users → 100 Tribe members → 10 Mastermind clients**

---

## ✅ Final Tier Summary

| Tier | Monthly | Annual | Tokens | Create Experiments | Your Profit |
|------|---------|--------|--------|-------------------|-------------|
| **Core** | $11 | $99 | 2M | NO | $9.59 |
| **Creator** | $25 | $199 | 10M | YES | $20.22 |
| **BYOK** | $11 | $99 | Unlimited | YES | $10.33 |

All tiers include: Magic Mentor, Daily LOVE Practice, journal analysis, matching, progress tracking, community access.

Only Creator and BYOK can create their own experiments.
