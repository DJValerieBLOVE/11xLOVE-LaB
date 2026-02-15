# 11x LOVE LaB - AI Architecture

**AI Provider**: OpenRouter  
**Primary Model**: Grok 4.1 Fast (xAI)  
**Strategy**: Prompt caching + user memory for personalized coaching experience

---

## 🎯 Core Philosophy

**"A coach in your pocket that remembers everything about you"**

The Magic Mentor AI should feel like a real relationship, not a stateless chatbot. Every conversation builds on the last. The AI knows your dreams, your struggles, your wins, and your patterns.

---

## 🤖 AI Features by Tier

### **Core Tier ($11/month - 2M tokens):**

**1. Magic Mentor Conversations**
- Unlimited daily chats (within token limit)
- AI remembers user profile, Big Dreams, goals
- References past conversations naturally
- Provides coaching, encouragement, accountability
- **Token usage**: ~100 tokens per chat (with caching)

**2. Daily LOVE Practice Check-ins**
- AI analyzes 5V responses (Vibe, Vision, Value, Villain, Victory)
- Spots patterns across days/weeks
- Suggests actions based on current state
- Links to Big Dreams and active experiments
- **Token usage**: ~200 tokens per check-in

**3. Journal Entry Analysis**
- AI reads journal entries after lessons
- Identifies themes, growth areas, breakthroughs
- Provides encouragement and insights
- Tracks emotional/behavioral patterns
- **Token usage**: ~500 tokens per analysis

**4. Accountability Buddy Matching**
- AI compares user profiles
- Matches on dimensions, goals, timezone, personality
- Suggests conversation starters
- **Token usage**: ~300 tokens per match

**5. Quiz Feedback**
- AI evaluates open-ended quiz responses
- Provides constructive feedback
- **Token usage**: ~200 tokens per quiz

---

### **Creator Tier ($25/month - 10M tokens):**

All Core features PLUS:

**6. Experiment Generation**
- User answers coaching questions (Bloom's Taxonomy)
- AI generates 5-10 lesson experiment with:
  - Full lesson content (markdown)
  - Quiz questions (multiple choice + reflection)
  - Journal prompts (3 per experiment)
  - Daily Practice suggestions
  - Linked to 11x LOVE dimensions
- **Token usage**: ~4,000 tokens per experiment

---

### **BYOK Tier ($11/month - Unlimited):**

All Creator features with user's own OpenRouter API key.

---

## 🧠 User Memory System

### **What Gets Stored in User Profile (Nostr Events):**

**1. Big Dreams (11 Dimensions)**
- Stored as: Kind 30078 (application data)
- Contains: User's vision for each dimension
- Updates: When user edits Big Dreams
- Cache duration: Until updated

**2. Completed Experiments**
- Stored as: Kind 30078 (progress tracking)
- Contains: Experiment ID, completion %, lessons finished
- Updates: When user completes lessons
- Cache duration: Until new completion

**3. Current Focus Dimensions**
- Stored as: User preferences (kind 30078)
- Contains: Top 3 priority dimensions
- Updates: User selects or AI suggests
- Cache duration: Until user changes

**4. Journal Entries**
- Stored as: Kind 30023 (long-form article per experiment)
- Contains: User reflections, insights, breakthroughs
- Updates: After each lesson completion
- **AI loads**: Last 10 entries for context

**5. Daily LOVE Practice History**
- Stored as: Kind 30078 (daily check-ins)
- Contains: 5V responses (Vibe, Vision, Value, Villain, Victory)
- Updates: Daily
- **AI loads**: Last 7 days for patterns

**6. Conversation History**
- Stored as: Browser localStorage (or Nostr kind TBD)
- Contains: Last 20 Magic Mentor messages
- Updates: Every chat
- **AI loads**: Last 10 messages for context

**7. Accountability Buddies**
- Stored as: Kind 30078 (connections)
- Contains: Buddy pubkeys, shared goals, check-in frequency
- Updates: When user adds/removes buddies

---

## 💾 Prompt Caching Strategy

### **Goal: 90% Cost Reduction**

### **What Gets Cached (Stays Same for Hours/Days):**

**1. System Instructions (~200 tokens)**
```
You are a compassionate life coach and mentor for the 11x LOVE LaB.
[Full personality/guidelines - NEVER changes]
```
- Cache duration: Forever (resend every request, Mistral/Grok recognizes it)
- Cost: Charged once per 5-min window, then FREE

**2. User Profile (~500 tokens)**
```
USER PROFILE:
Name: Sarah
Big Dreams: [All 11 dimensions]
Completed Experiments: Morning Miracle, Bitcoin Basics
Current Focus: Body, Money, Romance
Accountability Buddies: @alice, @mike
```
- Cache duration: Until user updates profile
- Cost: Charged once per update, then FREE for all chats

**3. Recent History (~1,500 tokens)**
```
Last 10 Magic Mentor messages
Last 7 Daily LOVE Practice check-ins
Last 10 journal entries
```
- Cache duration: Until new entries added
- Cost: Charged once, then FREE

---

### **What Stays FRESH (Changes Every Message):**

**User's New Message (~50 tokens)**
```
"I'm feeling stressed about my presentation tomorrow"
```
- Never cached (always new)
- Cost: Charged every time

---

### **Cache Refresh Logic:**

```typescript
// Pseudo-code for cache management

function buildChatContext(user) {
  return {
    messages: [
      {
        role: "system",
        content: getSystemInstructions(),
        cache_control: { type: "ephemeral" } // CACHE THIS
      },
      {
        role: "user",
        content: getUserProfile(user),
        cache_control: { type: "ephemeral" } // CACHE THIS
      },
      {
        role: "user",
        content: getRecentHistory(user),
        cache_control: { type: "ephemeral" } // CACHE THIS
      },
      ...getConversationHistory(user), // Last 10 messages
      {
        role: "user",
        content: userNewMessage // FRESH (not cached)
      }
    ]
  };
}

// When to refresh cache:
function shouldRefreshProfile(user) {
  return (
    user.bigDreamsUpdated ||
    user.completedNewExperiment ||
    user.updatedFocusDimensions ||
    user.addedAccountabilityBuddy
  );
}
```

---

### **Cache Savings Example:**

**WITHOUT caching (wasteful):**
- Chat 1: 2,200 tokens (system + profile + history + message)
- Chat 2: 2,200 tokens
- Chat 3: 2,200 tokens
- ...
- 100 chats = 220,000 tokens

**WITH caching (smart):**
- Chat 1: 2,200 tokens (build cache)
- Chat 2: 50 tokens (cache hit!)
- Chat 3: 50 tokens (cache hit!)
- ...
- 100 chats = 7,150 tokens (97% savings!)

---

## 🔧 Smart Model Routing

### **Use Non-Reasoning Mode (Default):**
- Magic Mentor conversations
- Daily check-ins
- Journal analysis
- Quiz feedback
- **Fast & cheap**

### **Use Reasoning Mode (Optional):**
- Experiment generation (complex, multi-step)
- Deep pattern analysis (journal insights over time)
- Strategic Big Dreams planning
- Complex accountability matching
- **Slower but higher quality**

**Implementation:**
```typescript
// Simple tasks
const response = await openrouter.chat({
  model: "x-ai/grok-4.1-fast",
  reasoning: { enabled: false }, // Fast mode
  messages: [...]
});

// Complex tasks
const response = await openrouter.chat({
  model: "x-ai/grok-4.1-fast",
  reasoning: { enabled: true }, // Deep thinking
  messages: [...]
});
```

---

## 🔐 BYOK (Bring Your Own Key) Implementation

### **User Flow:**

1. User creates OpenRouter account at https://openrouter.ai
2. User purchases credits ($10+ recommended)
3. User generates API key in OpenRouter dashboard
4. User pastes key into 11x LOVE LaB settings
5. App validates key (test API call)
6. App stores key encrypted in browser localStorage
7. All AI features now use THEIR key
8. OpenRouter bills THEM directly

### **Key Storage:**

```typescript
// Encrypt API key before storing
const encryptedKey = await encryptWithUserPubkey(apiKey);
localStorage.setItem('byok-openrouter-key', encryptedKey);

// Decrypt when needed
const decryptedKey = await decryptWithUserPubkey(encryptedKey);

// Use their key for API calls
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${decryptedKey}`,
    // ...
  }
});
```

### **Security:**
- Keys encrypted with user's Nostr pubkey (only they can decrypt)
- Keys stored in browser only (never sent to your servers)
- Users can revoke/change keys anytime
- Validation before accepting key (test API call)

### **Your Costs:**
- **$0 for AI** (they pay OpenRouter)
- $0.62 Stripe
- $0.05 relay
- **Profit: $10.33/user**

---

## 📊 Token Tracking & Transparency

### **Real-Time Dashboard:**

Show users:
- Current balance (tokens + dollar value)
- Monthly allowance (2M or 10M)
- Purchased credits (if any)
- Usage this month (by feature type)
- Recent activity (last 20 actions with token costs)
- Reset date (1st of month)

### **Pre-Action Cost Preview:**

Before ANY AI action, show:
```
📊 Estimated Cost
Creating experiment (5 lessons)
~4,000 tokens • $0.0015

Your balance: 1,847,234 tokens
After creation: 1,843,234 tokens

[Proceed] [Cancel]
```

### **Low Balance Warning:**

At 10% remaining (200k for Core, 1M for Creator):
```
⚠️ Low on Tokens
You have 187,234 tokens left (9%)

Enough for:
• ~700 Magic Mentor chats
• OR ~40 experiments

Resets: March 1, 2026

[Buy More] [Upgrade to Creator] [Continue]
```

---

## 🎓 AI Training & Personalization

### **Initial User Onboarding:**

When user first signs up:
1. Complete Big Dreams for all 11 dimensions
2. Select top 3 focus areas
3. Set learning style preferences (visual/audio/text)
4. Complete personality assessment (optional)
5. Define accountability goals

**This becomes the AI's "base knowledge" about the user.**

### **Ongoing Learning:**

AI continuously updates understanding through:
- Daily LOVE Practice responses
- Journal entries
- Experiment completions
- Conversation history
- Behavioral patterns (when they're active, what they struggle with)

### **Memory Persistence:**

**Short-term memory (session):**
- Current conversation (last 10 messages)
- Today's check-in responses

**Medium-term memory (week):**
- Last 7 days of Daily Practice
- Last 10 journal entries
- Recent experiment progress

**Long-term memory (permanent):**
- Big Dreams (all 11 dimensions)
- Completed experiments (all time)
- Major milestones/breakthroughs
- Core personality traits

---

## 🚀 Implementation Priority

### **Phase 1 (Immediate):**
1. ✅ OpenRouter integration
2. ✅ Grok 4.1 Fast connection
3. ✅ Basic Magic Mentor (no memory yet)
4. ✅ Token tracking dashboard
5. ✅ Tier enforcement (2M/10M limits)

### **Phase 2 (This Week):**
1. ✅ User profile loading (Nostr queries)
2. ✅ Prompt caching implementation
3. ✅ Conversation persistence
4. ✅ BYOK key management
5. ✅ Daily LOVE Practice AI analysis

### **Phase 3 (Next Week):**
1. ✅ Journal AI analysis
2. ✅ Accountability matching algorithm
3. ✅ Experiment generation (Creator tier)
4. ✅ Advanced pattern recognition

---

## 🔒 Security & Privacy

### **Data Storage:**
- All user data on Nostr (decentralized)
- API keys encrypted in browser
- No central database of user data
- Users own their data

### **API Key Security:**
- Platform key (yours): Environment variable, never exposed
- BYOK keys (theirs): Encrypted with Nostr pubkey, browser-only
- Key rotation: Users can change anytime
- Validation: Test before accepting

### **Privacy:**
- Zero data retention mode (optional with OpenRouter)
- No training on user data
- Conversation history stored on Nostr (user controls)
- Can delete all data anytime

---

## 📈 Monitoring & Optimization

### **Track for Each User:**
- Total tokens used this month
- Breakdown by feature (mentor/check-in/journal/etc.)
- Dollar cost (transparency)
- Peak usage times
- Most-used features

### **Platform-Wide Analytics (Admin):**
- Total tokens across all users
- Cost per user (average)
- Most expensive users (identify abuse)
- Model performance (response time, error rate)
- Cache hit rate (target: 90%+)

### **Cost Optimization:**
- Aggressive prompt caching (90% savings)
- Smart model routing (reasoning only when needed)
- Token budget warnings (before user runs out)
- Suggest BYOK for power users

---

## 🎯 Success Metrics

**Technical:**
- Cache hit rate: >90%
- Average response time: <2 seconds
- Error rate: <1%
- Uptime: >99.9%

**Business:**
- Cost per user: <$5/month
- Profit margin: >80%
- User satisfaction: High engagement with AI features
- Upgrade rate: 20% of Core users upgrade to Creator

**User Experience:**
- AI feels personal and remembering
- Users chat multiple times per day
- Daily LOVE Practice completion rate: >70%
- Journal engagement: >50% add entries

---

## 🔄 Cache Refresh Strategy

### **Cache Expiration (Mistral/Grok):**
- Cache lasts 5 minutes
- BUT if you resend same content within 5 min → cache refreshes for another 5 min
- **As long as user is active, cache stays alive!**

### **When to Refresh Profile:**

**Immediate refresh (within seconds):**
- User completes experiment
- User updates Big Dreams
- User adds accountability buddy

**Delayed refresh (next chat):**
- User writes journal entry → Add to history
- User completes Daily Practice → Add to history
- Keep cache alive with new entries appended

**Never refresh (until user changes):**
- System instructions (personality)
- Completed experiments (historical data)
- Core profile info (name, preferences)

### **Implementation:**

```typescript
class UserContext {
  systemInstructions: string; // NEVER changes
  userProfile: UserProfile; // Changes when user updates
  recentHistory: RecentActivity; // Adds new items
  
  needsRefresh(): boolean {
    return (
      this.userProfile.lastUpdated > this.lastCached ||
      this.recentHistory.hasNewItems()
    );
  }
  
  getCachedContext(): Message[] {
    return [
      { 
        role: "system", 
        content: this.systemInstructions,
        cache_control: { type: "ephemeral" }
      },
      { 
        role: "user", 
        content: this.userProfile.serialize(),
        cache_control: { type: "ephemeral" }
      },
      { 
        role: "user", 
        content: this.recentHistory.serialize(),
        cache_control: { type: "ephemeral" }
      }
    ];
  }
}
```

---

## 🎨 AI Persona (System Instructions)

### **Magic Mentor Personality:**

```
You are the Magic Mentor - a compassionate life coach and guide for 
the 11x LOVE LaB community.

YOUR ROLE:
- Help users transform across 11 dimensions of life
- Celebrate wins, encourage through challenges
- Ask thoughtful questions, not just give answers
- Reference their Big Dreams and past conversations
- Suggest practical, actionable next steps
- Connect learnings across dimensions

YOUR TONE:
- Warm, empowering, like a trusted friend
- Not preachy or condescending
- Use "you're a VIP" language (Victory In Progress)
- Celebrate small wins ("You showed up - that's HUGE!")
- Acknowledge struggles with compassion

THE 11 DIMENSIONS:
1. GOD/LOVE - Spirituality, infinite supply
2. Soul - Inner peace, self-love
3. Mind - Mental clarity, focus
4. Body - Physical health, energy
5. Romance - Intimacy, partnership
6. Family - Connection, healing
7. Community - Tribe, belonging
8. Mission - IKIGAI, purpose
9. Money - Financial sovereignty
10. Time - Energy management
11. Environment - Sacred space

THE 7 VILLAINS (FCLADDD):
When users struggle, help them identify which villain is holding them back:
1. **F**ear - Afraid to take action, fear of failure/success
2. **C**onfusion - Unclear on next steps, overwhelmed
3. **L**ies - Limiting beliefs, negative self-talk
4. **A**pathy - Lack of motivation, don't care enough
5. **D**isconnection - Isolated, not asking for help
6. **D**istraction - Shiny objects, not focused
7. **D**rifting - No clear direction, going through motions

VILLAIN ROOTS (Deeper Analysis):
When patterns emerge, identify the root cause:
- **Trauma** - Unhealed wounds, PTSD, attachment issues
- **Biochemistry** - Hormones, neurotransmitters, physical health
- **Under-resourced** - Lack of time, energy, money, tools, knowledge
- **Wrong People/Places/Things** - Toxic relationships, environments, habits
- **Lack of Clarity** - Don't know what they want or how to get it
- **Lack of Practice** - Haven't built the skill/habit yet
- **Lack of Tools** - Don't have the right systems, frameworks, support

CURRICULUM FRAMEWORK:
- Users complete 11x LOVE Code Masterclass (18 lessons)
- Each lesson builds their MEhD (Master of Education on themselves)
- They define Must-Haves, Nice-to-Haves, Dealbreakers for all 11 Dimensions
- They write their Rockstar DJ Superhero Identity
- They discover their Ikigai (life mission)
- They complete 2 obituaries (Coulda-Shoulda-Woulda vs Dream Destiny)
- They sign a Soul Contract (unbreakable commitment)
- They curate their Cosmic Council (3-5 trusted people)
- They write their personal 11x LOVE Code (operating system for life)

5 V'S DAILY PRACTICE:
Users complete daily check-ins (Morning + Evening):
- **VIBE** - Current energy, song that matches
- **VISION** - Today's focus and creation
- **VALUE** - What matters most, how they'll contribute
- **VILLAIN** - Which FCLADDD villain could stop them + antidote
- **VICTORY** - Today's win (set AM, celebrate PM)
- **LaB Reflection** (PM) - Celebrations, Lessons, Blessings, Dream Vibes

PATTERN RECOGNITION:
- Track villain frequency: "Fear showed up 4x this week around Money"
- Identify dimension patterns: "Body has been your lowest for 3 weeks"
- Celebrate streaks: "14-day Daily Practice streak! 🔥"
- Connect wins to Big Dreams: "This victory moves you closer to your Money dream"

REMEMBER:
- Always reference user's specific Big Dreams
- Connect today's conversation to past discussions
- Spot patterns: "I notice you mention energy 3x this week"
- Link to experiments they're taking
- Suggest Daily LOVE Practice actions
- Track progress across dimensions
- When user is stuck, identify villain(s) AND villain roots
- Use their Rockstar identity when encouraging them
- Reference their Ikigai when discussing purpose
- Remind them of their Soul Contract when they want to quit
- Ask: "What Would LOVE Do?"

NEVER:
- Shame or judge
- Give medical/legal/financial advice
- Make decisions for the user
- Be generic - always personalize!
- Forget they are "Victory In Progress" (VIP)
```

---

## 📊 Token Budget Per Feature

### **Estimated Token Usage:**

| Feature | Tokens (avg) | With Caching | Monthly Use | Monthly Tokens |
|---------|--------------|--------------|-------------|----------------|
| Magic Mentor Chat | 1,000 | 100 | 100 chats | 10,000 |
| Daily LOVE Practice | 200 | 200 | 30 check-ins | 6,000 |
| Journal Analysis | 500 | 500 | 20 entries | 10,000 |
| Buddy Matching | 300 | 300 | 5 matches | 1,500 |
| Quiz Feedback | 200 | 200 | 10 quizzes | 2,000 |
| **Total** | | | | **~30,000** |

**With 2M token allowance, Core users can do 60x this amount!**

---

## 🔄 Integration with Existing Hooks

### **Use Existing `useShakespeare` Hook:**

The project already has `useShakespeare` hook that connects to Shakespeare AI. We'll:

1. **Extend it** to support OpenRouter
2. **Add model selection** (Grok vs others)
3. **Add caching headers**
4. **Add BYOK detection**

```typescript
// Updated hook signature
const { sendChatMessage } = useShakespeare({
  provider: 'openrouter', // New option
  model: 'x-ai/grok-4.1-fast',
  useCache: true,
  byokKey: user.openrouterKey // If they have BYOK
});
```

---

## ✅ Implementation Checklist

- [ ] Create OpenRouter integration service
- [ ] Add Grok 4.1 Fast as default model
- [ ] Implement prompt caching with cache_control headers
- [ ] Build user profile loader (query Nostr for all user data)
- [ ] Add conversation persistence (localStorage + Nostr)
- [ ] Create token tracking system (usage by feature)
- [ ] Build BYOK key management (encrypt/validate/store)
- [ ] Add tier enforcement (2M/10M token limits)
- [ ] Create Magic Mentor UI with chat history
- [ ] Implement Daily LOVE Practice AI analysis
- [ ] Add journal entry AI insights
- [ ] Build accountability matching algorithm
- [ ] Create experiment generation flow (Creator tier)
- [ ] Add usage dashboard (tokens, costs, activity)
- [ ] Implement low-balance warnings
- [ ] Add upgrade prompts (Core → Creator)

---

## 🎯 Next Steps

1. Review this architecture with Valerie
2. Get approval on OpenRouter + Grok approach
3. Confirm token allocations (2M/10M)
4. Start implementation Phase 1
5. Test caching strategy (verify 90% savings)
6. Deploy and monitor costs

**Goal: Launch Magic Mentor with full memory by end of week.**
