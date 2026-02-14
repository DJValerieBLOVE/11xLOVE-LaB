/**
 * Test Experiment: Morning Miracle - 3 Day Challenge
 * 
 * Simple experiment to test the template system
 */

import type { Experiment } from '@/types/experiment';

export const morningMiracleExperiment: Experiment = {
  id: 'morning-miracle-3day',
  title: 'Morning Miracle - 3 Day Challenge',
  description: 'Transform your mornings in just 3 days with simple, powerful rituals that set you up for success.',
  dimension: 4, // Body dimension
  level: 'Beginner',
  duration: '3 days',
  instructor: 'DJ Valerie B LOVE',
  enrolled: 247,
  rating: 4.9,
  color: 'from-[#6600ff] to-[#9900ff]', // Body dimension gradient
  valueForValue: true,
  createdBy: '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767', // Admin npub
  
  modules: [
    {
      id: 'module-1',
      title: 'Morning Miracle Challenge',
      description: 'Your 3-day transformation starts now',
      lessons: [
        {
          id: 'lesson-1',
          title: 'Day 1: The 5-Minute Morning Ritual',
          type: 'mixed',
          duration: '5 min',
          dimension: 4, // Body
          satsReward: 10,
          
          content: `# Welcome to Your Morning Miracle! 🌅

## What You'll Learn Today

Today we're starting simple. Just 5 minutes. That's it.

### The 5-Minute Morning Ritual

1. **Hydrate** (1 min)
   - Drink a full glass of water before anything else
   - Bonus: Add lemon for extra energy

2. **Move** (2 min)
   - 10 jumping jacks
   - 10 deep breaths
   - Stretch your arms overhead

3. **Gratitude** (2 min)
   - Name 3 things you're grateful for
   - Say them out loud or write them down

### Why It Works

Your body has been fasting all night. Hydration kickstarts your metabolism. Movement wakes up your nervous system. Gratitude sets your mental state for the day.

**This is how you WIN the morning.**

### Your Challenge

Do this ritual tomorrow morning BEFORE you check your phone. Just 5 minutes.

Then come back and mark this lesson complete to earn your first 10 sats! ⚡`,

          video: {
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            provider: 'youtube',
          },
          
          resources: [
            {
              id: 'resource-1',
              title: 'Morning Ritual Checklist',
              url: '/resources/morning-ritual-checklist.pdf',
              type: 'pdf',
              size: '124 KB',
            },
            {
              id: 'resource-2',
              title: 'Gratitude Journal Template',
              url: '/resources/gratitude-journal.pdf',
              type: 'pdf',
              size: '256 KB',
            },
          ],
          
          quiz: {
            id: 'quiz-1',
            satsReward: 50,
            passingScore: 70,
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'What should you do FIRST in the morning?',
                options: [
                  'Check your phone',
                  'Drink water',
                  'Exercise for an hour',
                  'Eat breakfast',
                ],
                correctAnswer: 'Drink water',
                explanation: 'Hydration kickstarts your metabolism after a night of fasting!',
              },
              {
                id: 'q2',
                type: 'multiple-choice',
                question: 'How long is the complete Morning Ritual?',
                options: [
                  '1 minute',
                  '5 minutes',
                  '30 minutes',
                  '1 hour',
                ],
                correctAnswer: '5 minutes',
                explanation: 'Just 5 minutes! Small consistent actions create massive results.',
              },
              {
                id: 'q3',
                type: 'fill-in-blank',
                question: 'Name one thing you are grateful for today:',
                correctAnswer: '', // Any answer is correct for gratitude
                explanation: 'Beautiful! Gratitude is the foundation of a high-vibe life. 💜',
              },
            ],
          },
        },
        
        {
          id: 'lesson-2',
          title: 'Day 2: Movement Before Coffee',
          type: 'mixed',
          duration: '7 min',
          dimension: 4, // Body
          satsReward: 10,
          
          content: `# Day 2: Level Up Your Morning ☕

## The Coffee Rule

Here's a game-changer: **Movement BEFORE caffeine.**

### Why?

When you move first, your body naturally produces cortisol and adrenaline — the "wake up" hormones. THEN you add coffee on top of that natural energy. Result? Sustained energy all morning, not a crash at 10am.

### Today's Ritual (7 minutes)

1. **Hydrate** (1 min) — Same as yesterday
2. **Move FIRST** (5 min)
   - 20 jumping jacks
   - 10 squats
   - 10 pushups (knees OK!)
   - 1-minute plank
   - Dance for 1 minute (yes, really)
3. **Gratitude** (1 min) — Same as yesterday

**THEN** have your coffee. Notice the difference.

### Your Challenge

Tomorrow: Move BEFORE coffee. Track how you feel at 10am, 2pm, and bedtime.

Mark complete to earn 10 more sats! ⚡`,

          video: {
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            provider: 'youtube',
          },
          
          resources: [
            {
              id: 'resource-3',
              title: '7-Minute Movement Routine',
              url: '/resources/7-min-movement.pdf',
              type: 'pdf',
              size: '189 KB',
            },
          ],
        },
        
        {
          id: 'lesson-3',
          title: 'Day 3: The Full Morning Miracle',
          type: 'mixed',
          duration: '11 min',
          dimension: 4, // Body
          satsReward: 10,
          
          content: `# Day 3: Your Complete Morning Miracle 🎉

## You Made It!

Today we bring it all together. This is the full 11-minute practice that will change your life if you stick with it.

### The Complete Morning Miracle (11 minutes)

1. **Hydrate** (1 min)
2. **Move** (5 min) — Yesterday's routine
3. **Gratitude** (2 min) — Name 3 things
4. **Vision** (2 min) — Visualize your Big Dreams
5. **Affirmation** (1 min) — "I am LOVE and I am LOVED"

### What Happens Next?

You've built the foundation. Now the real magic happens when you do this EVERY DAY.

### 30-Day Challenge

Can you do this for 30 days straight? Your streak tracker in Big Dreams will count your wins. Every 7 days, you unlock bonus sats!

### Your Reward

Mark this lesson complete to:
- ✅ Earn 10 sats
- ✅ Complete the Morning Miracle Challenge
- ✅ Unlock a special bonus (check your Vault!)

**You're a VIP — Victory In Progress!** 💜`,

          video: {
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            provider: 'youtube',
          },
          
          resources: [
            {
              id: 'resource-4',
              title: '11-Minute Morning Miracle Guide',
              url: '/resources/11-min-morning-miracle.pdf',
              type: 'pdf',
              size: '342 KB',
            },
            {
              id: 'resource-5',
              title: '30-Day Streak Tracker',
              url: '/resources/30-day-tracker.pdf',
              type: 'pdf',
              size: '128 KB',
            },
          ],
          
          quiz: {
            id: 'quiz-3',
            satsReward: 100,
            passingScore: 80,
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'How many minutes is the complete Morning Miracle?',
                options: ['5 minutes', '7 minutes', '11 minutes', '30 minutes'],
                correctAnswer: '11 minutes',
                explanation: '11 minutes — the magic number for the 11x LOVE LaB! 💜',
              },
              {
                id: 'q2',
                type: 'multiple-choice',
                question: 'What should you do BEFORE drinking coffee?',
                options: [
                  'Check email',
                  'Movement',
                  'Scroll social media',
                  'Go back to sleep',
                ],
                correctAnswer: 'Movement',
                explanation: 'Movement first = natural energy boost before caffeine!',
              },
              {
                id: 'q3',
                type: 'fill-in-blank',
                question: 'What is your #1 Big Dream you visualized this morning?',
                correctAnswer: '', // Any answer is correct
                explanation: 'Powerful! Keep visualizing that dream every single morning. Believe it to receive it! ✨',
              },
            ],
          },
        },
      ],
    },
  ],
};
