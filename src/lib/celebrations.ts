/**
 * Celebration System
 * 
 * Random animations and sounds to celebrate quiz completion
 * Keeps the experience fresh and engaging!
 */

export interface Celebration {
  name: string;
  animation: CelebrationAnimation;
  sound: CelebrationSound;
}

export type CelebrationAnimation = 
  | 'confetti'
  | 'sparkles'
  | 'hearts'
  | 'lightning'
  | 'fireworks'
  | 'bubbles'
  | 'stars'
  | 'trophy'
  | 'rainbow'
  | 'emoji-burst';

export type CelebrationSound = 
  | 'tada'
  | 'applause'
  | 'chime'
  | 'digital-win'
  | 'coin'
  | 'level-up'
  | 'sparkle'
  | 'fanfare'
  | 'drumroll'
  | 'retro-win';

// Animation configurations
export const ANIMATIONS: Record<CelebrationAnimation, { emoji: string; colors: string[] }> = {
  'confetti': {
    emoji: '🎊',
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
  },
  'sparkles': {
    emoji: '✨',
    colors: ['#FFD700', '#FFA500', '#FFFF00', '#F0E68C', '#FFB347'],
  },
  'hearts': {
    emoji: '💜',
    colors: ['#FF69B4', '#FF1493', '#C71585', '#DA70D6', '#BA55D3'],
  },
  'lightning': {
    emoji: '⚡',
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#FFFF00', '#F0E68C'],
  },
  'fireworks': {
    emoji: '🎆',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
  },
  'bubbles': {
    emoji: '🫧',
    colors: ['#87CEEB', '#00BFFF', '#1E90FF', '#6495ED', '#4169E1'],
  },
  'stars': {
    emoji: '⭐',
    colors: ['#FFD700', '#FFA500', '#FFFF00', '#F0E68C', '#FFB347'],
  },
  'trophy': {
    emoji: '🏆',
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B'],
  },
  'rainbow': {
    emoji: '🌈',
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
  },
  'emoji-burst': {
    emoji: '🔥',
    colors: ['#FF4500', '#FF6347', '#FF7F50', '#FFA07A', '#FF8C00'],
  },
};

// Sound URLs (using Web Audio API for generated sounds)
export const SOUND_FREQUENCIES: Record<CelebrationSound, number[]> = {
  'tada': [523, 659, 784], // C, E, G
  'applause': [440, 440, 440], // Noise-based
  'chime': [523, 659, 784, 1047], // C, E, G, C
  'digital-win': [440, 554, 659, 880], // A, C#, E, A
  'coin': [1047, 1319], // C, E (high)
  'level-up': [440, 554, 659, 784, 880], // Ascending
  'sparkle': [1047, 1319, 1568], // High shimmer
  'fanfare': [523, 523, 659, 784], // Trumpet-like
  'drumroll': [200, 200, 200, 523], // Low to high
  'retro-win': [659, 784, 880, 1047], // Classic game win
};

/**
 * Get a random celebration
 */
export function getRandomCelebration(): Celebration {
  const animationKeys = Object.keys(ANIMATIONS) as CelebrationAnimation[];
  const soundKeys = Object.keys(SOUND_FREQUENCIES) as CelebrationSound[];
  
  const randomAnimation = animationKeys[Math.floor(Math.random() * animationKeys.length)];
  const randomSound = soundKeys[Math.floor(Math.random() * soundKeys.length)];
  
  return {
    name: `${randomAnimation}-${randomSound}`,
    animation: randomAnimation,
    sound: randomSound,
  };
}

/**
 * Play celebration sound using Web Audio API
 */
export function playCelebrationSound(sound: CelebrationSound) {
  try {
    interface WindowWithWebkit extends Window {
      webkitAudioContext?: typeof AudioContext;
    }
    const audioContext = new (window.AudioContext || (window as WindowWithWebkit).webkitAudioContext)();
    const frequencies = SOUND_FREQUENCIES[sound];
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = sound === 'applause' ? 'square' : 'sine';
      
      // Timing
      const startTime = audioContext.currentTime + (index * 0.15);
      const duration = 0.2;
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  } catch (error) {
    console.warn('Could not play celebration sound:', error);
  }
}

/**
 * Generate random particle positions for animations
 */
export function generateParticles(count: number, containerWidth: number, containerHeight: number) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * containerWidth,
    y: Math.random() * containerHeight,
    size: Math.random() * 20 + 10,
    rotation: Math.random() * 360,
    velocity: {
      x: (Math.random() - 0.5) * 4,
      y: Math.random() * -8 - 2,
    },
  }));
}
