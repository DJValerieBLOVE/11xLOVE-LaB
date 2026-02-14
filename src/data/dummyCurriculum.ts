/**
 * Dummy/local test data for 11x LOVE LaB curriculum
 * This data is used for development/testing and is NOT posted to Nostr
 * In production, this would be replaced with real curriculum data
 */

export interface DummyLesson {
  id: string;
  title: string;
  content: string;
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
  journalPrompt?: string;
}

export interface DummyExperiment {
  id: string;
  title: string;
  description: string;
  dimension: string;
  color: string;
  lessons: DummyLesson[];
}

// Sample curriculum data - The 11x LOVE Code
export const dummyCurriculum: DummyExperiment[] = [
  {
    id: 'morning-miracle',
    title: 'Morning Miracle',
    description: 'Start your day with intention and gratitude',
    dimension: 'GOD/LOVE',
    color: '#eb00a8',
    lessons: [
      {
        id: 'lesson-1',
        title: 'The Power of Morning Ritual',
        content: `Your morning sets the tone for your entire day. A morning miracle is a sacred ritual that connects you with your highest self and aligns you with divine flow.

**What you'll learn:**
- Why mornings matter for personal growth
- How to create a 15-minute miracle routine
- The science behind morning rituals

**Key Insight:** When you start your day with love and intention, you create a ripple effect that touches everything you do.`,
        quiz: {
          question: 'What is the recommended duration for a morning miracle routine?',
          options: ['5 minutes', '15 minutes', '30 minutes', '1 hour'],
          correctAnswer: 1
        },
        journalPrompt: 'What does your ideal morning look like? Describe your perfect morning miracle routine in detail.'
      },
      {
        id: 'lesson-2',
        title: 'Gratitude as Foundation',
        content: `Gratitude is the foundation of all abundance. When you start your day by acknowledging what you already have, you open yourself to receive more.

**Practice:** Write down 3 things you're grateful for every morning. Be specific and feel the gratitude in your body.`,
        journalPrompt: 'Write down 5 things you\'re grateful for right now. How does this practice change your energy?'
      }
    ]
  },
  {
    id: 'bitcoin-basics',
    title: 'Bitcoin Basics',
    description: 'Understand the foundation of financial sovereignty',
    dimension: 'Money',
    color: '#00d81c',
    lessons: [
      {
        id: 'lesson-1',
        title: 'What is Bitcoin?',
        content: `Bitcoin is digital gold - a decentralized, scarce digital asset that cannot be inflated or controlled by any government or central authority.

**Key Properties:**
- Limited supply: Only 21 million will ever exist
- Decentralized: No single entity controls it
- Censorship-resistant: Cannot be taken away from you
- Borderless: Works anywhere in the world

**Why it matters:** Bitcoin gives you true financial sovereignty for the first time in human history.`,
        quiz: {
          question: 'What is Bitcoin\'s maximum supply?',
          options: ['100 million', '21 million', '1 billion', 'Unlimited'],
          correctAnswer: 1
        },
        journalPrompt: 'How would having true financial sovereignty change your life? What fears come up when you think about Bitcoin?'
      }
    ]
  },
  {
    id: 'body-love',
    title: 'Body Love Revolution',
    description: 'Heal your relationship with your physical body',
    dimension: 'Body',
    color: '#6600ff',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Your Body is Your Home',
        content: `Your body is not an ornament - it's your home, your vehicle, your sacred temple. Learning to love and respect your body is one of the most revolutionary acts you can take.

**Truth:** Your body hears every thought you have about it. Negative self-talk creates stress hormones that literally make you sick.

**Practice:** Look in the mirror and speak to your body as you would speak to a beloved child.`,
        journalPrompt: 'Write a love letter to your body. What does it need from you right now?'
      }
    ]
  }
];

// Helper function to get experiment by ID
export function getDummyExperiment(id: string): DummyExperiment | undefined {
  return dummyCurriculum.find(exp => exp.id === id);
}

// Helper function to get lesson by experiment and lesson ID
export function getDummyLesson(experimentId: string, lessonId: string): DummyLesson | undefined {
  const experiment = getDummyExperiment(experimentId);
  return experiment?.lessons.find(lesson => lesson.id === lessonId);
}