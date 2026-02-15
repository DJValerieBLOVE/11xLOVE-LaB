/**
 * CelebrationAnimation Component
 * 
 * Displays random celebratory animations with particles
 * Used after quiz completion + journal entry
 */

import { useEffect, useState } from 'react';
import { ANIMATIONS, type CelebrationAnimation as AnimationType, generateParticles } from '@/lib/celebrations';

interface Particle {
  x: number;
  y: number;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
}

interface CelebrationAnimationProps {
  animation: AnimationType;
  onComplete?: () => void;
  duration?: number; // milliseconds
}

export function CelebrationAnimation({ 
  animation, 
  onComplete,
  duration = 2500 
}: CelebrationAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(true);
  const config = ANIMATIONS[animation];

  useEffect(() => {
    // Generate particles on mount
    const particleCount = 50;
    const newParticles = generateParticles(particleCount, window.innerWidth, window.innerHeight);
    setParticles(newParticles);

    // Complete after duration
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [animation, duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden animate-in fade-in duration-300">
      {/* Center Emoji Burst */}
      <div 
        className="absolute top-1/2 left-1/2 text-8xl sm:text-9xl animate-bounce"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        {config.emoji}
      </div>

      {/* Particle System - CSS animations */}
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute animate-ping"
          style={{
            left: particle.x,
            top: particle.y,
            fontSize: particle.size,
            animationDuration: `${duration}ms`,
            animationIterationCount: 1,
          }}
        >
          {config.emoji}
        </div>
      ))}

      {/* Animated Rings */}
      <div 
        className="absolute top-1/2 left-1/2 border-4 rounded-full animate-ping"
        style={{
          borderColor: config.colors[0],
          width: 100,
          height: 100,
          transform: 'translate(-50%, -50%)',
          animationDuration: '1s',
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 border-4 rounded-full animate-ping"
        style={{
          borderColor: config.colors[1],
          width: 100,
          height: 100,
          transform: 'translate(-50%, -50%)',
          animationDuration: '1.2s',
          animationDelay: '0.2s',
        }}
      />
    </div>
  );
}
