# AI Curriculum Generation System

## Overview

The 11x LOVE LaB uses AI to help users (and admins) create personalized learning experiments. The system is based on Bloom's Taxonomy and life coaching methodology to ensure learning leads to TRANSFORMATION, not just consumption.

---

## Bloom's Taxonomy Foundation

### The 6 Levels of Learning:
1. **Remember** - Recall facts and basic concepts
2. **Understand** - Explain ideas or concepts
3. **Apply** - Use information in new situations
4. **Analyze** - Draw connections among ideas
5. **Evaluate** - Justify a decision or course of action
6. **Create** - Produce new or original work

**Our Focus:** Levels 3-6 (Apply, Analyze, Evaluate, Create)
- Not just "what did you learn?"
- But "how will you USE this?"

---

## Pre-Generation Coaching Questions

Before generating any curriculum, the AI asks the user:

### 🎯 MOTIVATION & VISION

**1. What do you want to learn?**
- Free text input
- Examples: "How to build a Bitcoin business", "Communication for couples", "Morning routines that actually work"

**2. Why is this important to you RIGHT NOW?**
- Helps AI understand urgency and emotional drivers
- Creates personalized relevance

**3. How would your life be different if you mastered this?**
- Paints the vision of success
- AI uses this to create motivational content

**4. Which 11x LOVE dimension(s) does this support?**
Multi-select from the 11 dimensions:

```
GOD (The Center):
[ ] 1. GOD/LOVE - Spirituality, infinite supply

HEALTH (Your Inner World):
[ ] 2. Soul - Inner peace, self-love
[ ] 3. Mind - Mental clarity, focus
[ ] 4. Body - Physical health, energy

PEOPLE (Relationships):
[ ] 5. Romance - Intimacy, partnership
[ ] 6. Family - Parenting, connection
[ ] 7. Community - Tribe, belonging

PURPOSE (Your IKIGAI):
[ ] 8. Mission - Reason for being

WEALTH (The Fuel):
[ ] 9. Money - Financial sovereignty
[ ] 10. Time - Energy management
[ ] 11. Environment - Home, workspace
```

---

### 🚧 ROADBLOCKS & CHALLENGES

**5. What have you tried before?**
- Understanding past attempts helps AI avoid repeating failures
- Acknowledges user's existing knowledge

**6. What worked? What didn't?**
- Identifies patterns of success/failure
- AI builds on strengths, addresses weaknesses

**7. What made it difficult?**
- Surfaces obstacles (time, resources, fear, confusion)
- AI can design lessons that overcome these specific challenges

**8. What might prevent you from succeeding this time?**
- Proactive obstacle identification
- AI creates accountability checkpoints around common pitfalls

---

### 🎓 LEARNING STYLE

**9. How do you learn best?**
Multi-select:

```
[ ] Visual (images, diagrams, videos)
[ ] Auditory (podcasts, audio narration)
[ ] Text (reading, writing)
[ ] Kinesthetic (doing, hands-on practice)
[ ] All of the above
```

**Token Cost Impact:**
- Text only: Base cost (no extra)
- + Visual: +100 tokens per image
- + Audio: +1,000 tokens per lesson
- + Video: Free (YouTube curation)

---

### 📊 MEASUREMENT & SUCCESS

**10. How will you know you're making progress?**
- Helps define milestones
- AI creates progress checkpoints in lessons

**11. What specific actions will you take?**
- Action-oriented learning design
- Each lesson includes practical steps

**12. How will you measure success?**
- AI suggests trackable metrics
- Integrates with Daily LOVE Practice

---

### 🎯 BIG DREAMS CONNECTION

**13. Which Big Dream does this support?**
- Shows user's existing Big Dreams from their profile
- AI links experiment to their larger life vision
- Creates motivation through connection to purpose

---

## AI Generation Prompt Template

After collecting user answers, the AI uses this structured prompt:

```
You are an expert curriculum designer and life coach using Bloom's Taxonomy 
and the 11x LOVE Method to create transformational learning experiences.

CONTEXT:
- Topic: {user's learning goal}
- Why it matters: {user's motivation}
- Desired outcome: {user's vision of success}
- Dimensions: {selected 11x LOVE dimensions}
- Past attempts: {what they've tried}
- What worked/didn't: {patterns}
- Challenges: {obstacles}
- Learning style: {visual/audio/text/kinesthetic}
- Progress metrics: {how they'll measure}
- Big Dream connection: {linked goal}

MISSION:
Create a practical, action-oriented learning experience that leads to 
TRANSFORMATION (not just information).

CURRICULUM REQUIREMENTS:

1. STRUCTURE (5-10 lessons):
   - Each lesson = 1 focused concept
   - Build progressively (simple → complex)
   - Include real-world application in EVERY lesson
   - Link to user's specific situation

2. BLOOM'S TAXONOMY LEVELS:
   - Remember (10%): Brief knowledge foundation
   - Understand (20%): Explain concepts clearly
   - Apply (30%): Hands-on exercises
   - Analyze (20%): Reflect on connections
   - Evaluate (10%): Assess what works for them
   - Create (10%): Build something new

3. EACH LESSON MUST INCLUDE:
   a) Clear learning objective (action-focused)
   b) Main content (engaging, storytelling)
   c) Real-world example (relevant to user)
   d) Action step (what to do TODAY)
   e) Reflection prompt (evaluate progress)

4. QUIZZES:
   - Test UNDERSTANDING and APPLICATION (not just memorization)
   - Include scenario-based questions
   - 1 open-ended reflection question per quiz
   - Passing score: 70%

5. JOURNAL PROMPTS (3 per experiment):
   - Prompt 1: "How will you apply {concept} in your {dimension} today?"
   - Prompt 2: "What resistance came up? How did you overcome it?"
   - Prompt 3: "How has your {Big Dream} shifted after this learning?"

6. DAILY LOVE PRACTICE INTEGRATION:
   - Suggest specific actions for each dimension
   - Link to user's Big Dream
   - Trackable, measurable outcomes

7. ROADBLOCK ANTICIPATION:
   - Address user's specific challenges in lessons
   - Provide alternative approaches when stuck
   - Include encouragement based on their "why"

OUTPUT FORMAT (JSON):
{
  "title": "Experiment Title",
  "description": "2-sentence overview",
  "dimensions": [1, 9], // ID numbers
  "linkedBigDream": "{big dream id}",
  "estimatedDuration": "7 days",
  "lessons": [
    {
      "title": "Lesson 1 Title",
      "objective": "By the end, you'll be able to...",
      "content": "Markdown-formatted lesson content",
      "actionStep": "Your challenge today:",
      "quiz": {
        "questions": [
          {
            "type": "multiple-choice",
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "B",
            "explanation": "Why this matters..."
          },
          {
            "type": "fill-in-blank",
            "question": "Reflect on how you'll apply this:",
            "correctAnswer": "" // Open-ended
          }
        ]
      }
    }
  ],
  "journalPrompts": [
    "Prompt 1...",
    "Prompt 2...",
    "Prompt 3..."
  ],
  "dailyPracticeActions": {
    "dimension1": "Specific action for GOD/LOVE",
    "dimension9": "Specific action for Money"
  },
  "successMetrics": [
    "Track metric 1",
    "Track metric 2"
  ]
}

Remember: The goal is TRANSFORMATION, not just information. Every element 
should move the user toward their Big Dream.
```

---

## Multi-Modal Content Generation

### Text (Always Included)
- Base generation
- Markdown formatted
- Storytelling approach
- Conversational tone

### Images (Optional +100 tokens each)
When user selects "Visual learning":
- Generate diagrams, flowcharts, concept maps
- Use DALL-E 3 API
- Alt text for accessibility
- Embedded in lesson content

**Prompt for images:**
```
Create a simple, clear diagram illustrating {concept} for someone learning 
about {topic}. Style: minimalist, educational, colorful but not overwhelming.
```

### Audio (Optional +1,000 tokens per lesson)
When user selects "Auditory learning":
- Convert lesson text to natural speech
- Use ElevenLabs or similar TTS API
- Downloadable MP3 format
- Embedded audio player in lesson

### Video (Free - Curated)
When user selects "Visual learning":
- AI searches for relevant YouTube videos
- Curates 1-2 videos per lesson
- Provides summary of video content
- Embedded in lesson

---

## Curriculum Import System

For admins (or users with existing content), support multiple import methods:

### Method 1: Giant Textarea
- Paste up to 100,000 characters
- Supports markdown, plain text, structured content
- AI parses and structures into lessons

### Method 2: File Upload
- Accept: PDF, DOCX, TXT, MD
- Extract text content
- AI processes and structures

### Method 3: URL Import (Future)
- Notion public pages
- Google Docs (with permissions)
- Web articles
- CORS proxy for fetching

**AI Processing:**
```
You've been given curriculum content. Parse it and structure it into 
the 11x LOVE experiment format with:
- 5-10 distinct lessons
- Quiz questions for each lesson
- Journal prompts
- Daily practice actions
- Maintain the author's voice and intent
```

---

## Integration with 11x LOVE Method

Every generated experiment:

1. **Tags dimensions** - Links to 1+ of the 11 dimensions
2. **Links to Big Dreams** - Shows how learning supports user's vision
3. **Generates Daily Practice** - Suggests actions for Daily LOVE Practice
4. **Tracks progress** - Updates user's EQ Visualizer (progress per dimension)
5. **Connects to community** - Suggests accountability buddies in same dimension

---

## Token Usage Transparency

Show users EXACTLY what they're using:

**Before Generation:**
```
📊 Estimated Token Usage:
- Text-only (5 lessons): ~3,900 tokens
- + 5 images: +500 tokens
- + Audio narration: +5,000 tokens

Total: 9,400 tokens (cost: ~$14 worth of credits)

You have: 5,000 tokens remaining
Need to purchase: $10 credit pack (5,800 tokens)

[Proceed] [Adjust Options]
```

**After Generation:**
```
✅ Experiment Created!

Used: 9,347 tokens ($14.02 worth)
Remaining: 1,453 tokens

[View Experiment] [Start Learning]
```

---

## Quality Control

Every AI-generated curriculum is:
1. **Reviewed by user** before publishing
2. **Editable** - Can modify any lesson/quiz
3. **Regenerable** - Can regenerate specific lessons
4. **Shareable** - Can publish to Tribe after approval

This ensures quality while maintaining speed and automation.
