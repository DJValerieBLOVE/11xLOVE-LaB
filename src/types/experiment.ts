/**
 * Experiment (Course) Type Definitions
 * 
 * Reusable template system for any experiment/course in the LaB
 */

export interface Experiment {
  id: string;
  title: string;
  description: string;
  dimension: number; // 1-11 (maps to Dimension color)
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string; // e.g., "3 days", "6 weeks"
  instructor: string;
  enrolled: number;
  rating: number;
  color: string; // Tailwind gradient classes
  image?: string; // Cover image URL (16:9 aspect ratio recommended, like YouTube)
  modules: Module[];
  createdBy: string; // npub of creator (admin only for now)
  valueForValue: boolean; // true = free, false = paid
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'text' | 'mixed';
  duration: string; // e.g., "5 min"
  content: string; // Markdown content
  
  // Optional media - supports both old format (videoUrl) and new format (video object)
  video?: {
    url: string;
    provider: 'youtube' | 'vimeo' | 'direct';
  };
  videoUrl?: string; // Legacy support
  audio?: {
    url: string;
  };
  audioUrl?: string; // Legacy support
  
  // Optional resources
  resources?: Resource[];
  
  // Optional quiz
  quiz?: Quiz;
  
  // Metadata
  dimension?: number; // Which dimension this lesson focuses on (optional, inherits from experiment)
  satsReward?: number; // Sats earned for completion (e.g., 10)
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'docx' | 'image' | 'other';
  size?: string; // e.g., "2.3 MB"
}

export interface Quiz {
  id: string;
  questions: Question[];
  satsReward: number; // Sats earned for passing (e.g., 100)
  passingScore: number; // Percentage needed to pass (e.g., 70)
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank';
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  explanation?: string; // Shown after answer
}

/**
 * User Progress Tracking
 */
export interface LessonProgress {
  lessonId: string;
  experimentId: string;
  completed: boolean;
  completedAt?: string; // ISO timestamp
  quizScore?: number; // Percentage
  quizPassed?: boolean;
  satsEarned?: number;
}

export interface ExperimentProgress {
  experimentId: string;
  completedLessons: string[]; // Array of lesson IDs
  currentLesson?: string; // Last viewed lesson ID
  progress: number; // Percentage (0-100)
  satsEarned: number; // Total sats from this experiment
  startedAt: string;
  completedAt?: string;
}
