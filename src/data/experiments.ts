import type { Experiment } from '@/types/experiment';

// Re-export the Experiment type for backwards compatibility
export type { Experiment } from '@/types/experiment';

export const experiments: Experiment[] = [
  {
    id: 'bitcoin-basics',
    title: 'Bitcoin Basics',
    description: 'Learn the fundamentals of Bitcoin and the Lightning Network',
    dimension: 9, // Money
    level: 'Beginner',
    duration: '6 weeks',
    enrolled: 1234,
    rating: 4.8,
    instructor: 'Satoshi Nakamoto',
    color: 'from-orange-500 to-orange-600',
    createdBy: '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767',
    valueForValue: true,
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to Bitcoin',
        description: 'Understanding the basics of Bitcoin',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'What is Bitcoin?',
            type: 'video',
            content: '## What is Bitcoin?\n\nBitcoin is a decentralized digital currency...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '15 min',
          },
          {
            id: 'lesson-1-2',
            title: 'How Bitcoin Works',
            type: 'text',
            content: '## How Bitcoin Works\n\nBitcoin uses blockchain technology...',
            duration: '10 min',
          },
        ],
      },
      {
        id: 'module-2',
        title: 'The Lightning Network',
        description: 'Fast and cheap Bitcoin payments',
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Introduction to Lightning',
            type: 'video',
            content: '## Lightning Network Basics\n\nThe Lightning Network enables instant Bitcoin transactions...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '20 min',
          },
        ],
      },
    ],
  },
  {
    id: 'build-on-nostr',
    title: 'Build on Nostr',
    description: 'Create decentralized applications using the Nostr protocol',
    dimension: 8, // Mission
    level: 'Intermediate',
    duration: '8 weeks',
    enrolled: 856,
    rating: 4.9,
    instructor: 'Nostr Dev',
    color: 'from-purple-500 to-pink-500',
    createdBy: '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767',
    valueForValue: true,
    modules: [
      {
        id: 'module-1',
        title: 'Nostr Fundamentals',
        description: 'Understanding the Nostr protocol',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'What is Nostr?',
            type: 'video',
            content: '## What is Nostr?\n\nNostr is a simple, open protocol for creating censorship-resistant social networks...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '12 min',
          },
          {
            id: 'lesson-1-2',
            title: 'NIPs Explained',
            type: 'text',
            content: '## Nostr Implementation Possibilities (NIPs)\n\nNIPs define how Nostr clients and relays interact...',
            duration: '15 min',
          },
        ],
      },
      {
        id: 'module-2',
        title: 'Building Your First Client',
        description: 'Create a simple Nostr client',
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Setting Up Your Environment',
            type: 'video',
            content: '## Development Setup\n\nLet\'s set up your development environment...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '18 min',
          },
        ],
      },
    ],
  },
  {
    id: 'lightning-network-mastery',
    title: 'Lightning Network Mastery',
    description: 'Deep dive into Lightning Network architecture and development',
    dimension: 9, // Money
    level: 'Advanced',
    duration: '10 weeks',
    enrolled: 432,
    rating: 4.7,
    instructor: 'Lightning Labs',
    color: 'from-blue-500 to-blue-600',
    createdBy: '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767',
    valueForValue: true,
    modules: [
      {
        id: 'module-1',
        title: 'Lightning Architecture',
        description: 'Understanding how Lightning works under the hood',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Payment Channels',
            type: 'video',
            content: '## Understanding Payment Channels\n\nPayment channels are the foundation of Lightning...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '25 min',
          },
          {
            id: 'lesson-1-2',
            title: 'HTLCs and Routing',
            type: 'text',
            content: '## Hash Time-Locked Contracts\n\nHTLCs enable trustless routing across the network...',
            duration: '20 min',
          },
        ],
      },
    ],
  },
  {
    id: '11x-love-code',
    title: 'The 11x LOVE Code',
    description: 'Your introduction to the 11 Dimensions of LOVE',
    dimension: 1, // GOD/LOVE
    level: 'Beginner',
    duration: '12 weeks',
    enrolled: 2156,
    rating: 5.0,
    instructor: 'DJ Valerie B LOVE',
    color: 'from-pink-500 to-purple-500',
    createdBy: '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767',
    valueForValue: true,
    modules: [
      {
        id: 'module-1',
        title: 'Welcome to the Journey',
        description: 'Starting your transformation',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Welcome, Beautiful Soul',
            type: 'video',
            content: '## Welcome to the 11x LOVE Code\n\nThis is where your transformation begins...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '8 min',
          },
          {
            id: 'lesson-1-2',
            title: 'The Prosperity Pyramid',
            type: 'text',
            content: '## Understanding the Prosperity Pyramid\n\nAt the center of everything is GOD...',
            duration: '10 min',
          },
        ],
      },
      {
        id: 'module-2',
        title: 'The 11 Dimensions',
        description: 'Exploring each dimension of LOVE',
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Dimension 1: GOD',
            type: 'video',
            content: '## The Foundation: GOD\n\nEverything flows from divine love...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '12 min',
          },
        ],
      },
    ],
  },
  {
    id: 'financial-sovereignty',
    title: 'Financial Sovereignty',
    description: 'Take control of your financial future with Bitcoin',
    dimension: 9, // Money
    level: 'Intermediate',
    duration: '8 weeks',
    enrolled: 987,
    rating: 4.6,
    instructor: 'Bitcoin Expert',
    color: 'from-green-500 to-emerald-600',
    createdBy: '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767',
    valueForValue: true,
    modules: [
      {
        id: 'module-1',
        title: 'Self-Custody Fundamentals',
        description: 'Securing your Bitcoin',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Why Self-Custody Matters',
            type: 'video',
            content: '## Not Your Keys, Not Your Coins\n\nLearn why controlling your private keys is essential...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '15 min',
          },
        ],
      },
    ],
  },
  {
    id: 'value-for-value',
    title: 'Value for Value Economics',
    description: 'Understanding and implementing V4V in your life',
    dimension: 9, // Money
    level: 'Beginner',
    duration: '4 weeks',
    enrolled: 1543,
    rating: 4.9,
    instructor: 'Adam Curry',
    color: 'from-yellow-500 to-orange-500',
    createdBy: '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767',
    valueForValue: true,
    modules: [
      {
        id: 'module-1',
        title: 'V4V Principles',
        description: 'The foundation of Value for Value',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'What is Value for Value?',
            type: 'video',
            content: '## The V4V Revolution\n\nValue for Value is a new way of exchanging value...',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '10 min',
          },
        ],
      },
    ],
  },
];
