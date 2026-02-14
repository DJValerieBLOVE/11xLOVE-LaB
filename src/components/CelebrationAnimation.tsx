/**
 * CelebrationAnimation Component
 * 
 * Displays random celebratory animations with particles
 * Used after quiz completion + journal entry
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATIONS, type CelebrationAnimation as AnimationType, generateParticles } from '@/lib/celebrations';

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
  const [particles, setParticles] = useState<any[]>([]);
  const config = ANIMATIONS[animation];

  useEffect(() => {
    // Generate particles on mount
    const particleCount = 50;
    const newParticles = generateParticles(particleCount, window.innerWidth, window.innerHeight);
    setParticles(newParticles);

    // Complete after duration
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [animation, duration, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Center Emoji Burst */}
        <motion.div
          className="absolute top-1/2 left-1/2 text-9xl"
          initial={{ scale: 0, rotate: 0, x: '-50%', y: '-50%' }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {config.emoji}
        </motion.div>

        {/* Particle System */}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: particle.x,
              top: particle.y,
              fontSize: particle.size,
            }}
            initial={{ 
              opacity: 1,
              y: 0,
              x: 0,
              rotate: particle.rotation,
            }}
            animate={{
              opacity: [1, 1, 0],
              y: particle.velocity.y * 100,
              x: particle.velocity.x * 100,
              rotate: particle.rotation + 360,
            }}
            transition={{
              duration: duration / 1000,
              ease: 'easeOut',
            }}
          >
            {config.emoji}
          </motion.div>
        ))}

        {/* Animated Rings (for extra flair) */}
        <motion.div
          className="absolute top-1/2 left-1/2 border-4 rounded-full"
          style={{
            borderColor: config.colors[0],
            width: 100,
            height: 100,
          }}
          initial={{ scale: 0, x: '-50%', y: '-50%', opacity: 1 }}
          animate={{ 
            scale: [0, 3, 4],
            opacity: [1, 0.5, 0],
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 border-4 rounded-full"
          style={{
            borderColor: config.colors[1],
            width: 100,
            height: 100,
          }}
          initial={{ scale: 0, x: '-50%', y: '-50%', opacity: 1 }}
          animate={{ 
            scale: [0, 3, 4],
            opacity: [1, 0.5, 0],
          }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
