/**
 * EQ Visualizer Component
 * 
 * Graphic equalizer showing progress across all 11 Dimensions
 * "You're the DJ of your life — raise your vibes!"
 */

import { DIMENSIONS } from '@/lib/dimensions';
import { cn } from '@/lib/utils';

interface EQVisualizerProps {
  /** Progress levels for each dimension (1-11), values 0-100 */
  levels?: Record<number, number>;
  /** Show dimension labels below bars */
  showLabels?: boolean;
  /** Compact mode (smaller bars) */
  compact?: boolean;
  /** Custom height */
  height?: number;
  className?: string;
}

export function EQVisualizer({ 
  levels = {}, 
  showLabels = false,
  compact = false,
  height = 120,
  className 
}: EQVisualizerProps) {
  // Default demo levels if none provided
  const defaultLevels: Record<number, number> = {
    1: 75,  // GOD/LOVE
    2: 60,  // Soul
    3: 80,  // Mind
    4: 70,  // Body
    5: 55,  // Romance
    6: 85,  // Family
    7: 65,  // Community
    8: 90,  // Mission
    9: 50,  // Money
    10: 70, // Time
    11: 75, // Environment
  };

  const activeLevels = Object.keys(levels).length > 0 ? levels : defaultLevels;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* EQ Bars */}
      <div 
        className="flex items-end justify-center gap-1 md:gap-2 w-full px-4"
        style={{ height: `${height}px` }}
      >
        {DIMENSIONS.map((dimension) => {
          const level = activeLevels[dimension.id] || 0;
          const barHeight = (level / 100) * height;
          
          return (
            <div
              key={dimension.id}
              className="flex-1 flex flex-col justify-end items-center gap-1 max-w-[60px]"
              title={`${dimension.name}: ${level}%`}
            >
              {/* Bar */}
              <div
                className={cn(
                  'w-full rounded-t-lg transition-all duration-500 ease-out',
                  'shadow-lg hover:scale-105 hover:shadow-xl',
                  compact ? 'min-w-[8px]' : 'min-w-[12px]'
                )}
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: dimension.color,
                  boxShadow: `0 0 10px ${dimension.color}40`,
                }}
              />
              
              {/* Label (optional) */}
              {showLabels && (
                <span 
                  className="text-[10px] md:text-xs font-medium text-center truncate w-full"
                  style={{ color: dimension.color }}
                >
                  {dimension.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional tagline */}
      {!compact && (
        <p className="text-xs md:text-sm text-muted-foreground text-center">
          Raise your vibes, rock your dreams
        </p>
      )}
    </div>
  );
}

/**
 * Compact EQ Visualizer for header/navigation
 * Matches the colorful bar design from the screenshot - sharp rectangle segments!
 */
export function CompactEQVisualizer({ levels, className }: Pick<EQVisualizerProps, 'levels' | 'className'>) {
  // Default animated levels if none provided (random heights for visual appeal)
  const defaultLevels: Record<number, number> = {
    1: 85,  // GOD/LOVE - Hot Pink
    2: 70,  // Soul - Magenta
    3: 90,  // Mind - Purple
    4: 75,  // Body - Purple
    5: 60,  // Romance - Red
    6: 80,  // Family - Orange
    7: 95,  // Community - Yellow
    8: 70,  // Mission - Lime
    9: 85,  // Money - Green
    10: 65, // Time - Cyan
    11: 90, // Environment - Blue
  };

  const activeLevels = Object.keys(levels || {}).length > 0 ? levels : defaultLevels;

  return (
    <div className={cn('flex items-end justify-center gap-[2px]', className)}>
      {DIMENSIONS.map((dimension) => {
        const level = (activeLevels?.[dimension.id] || 50);
        // Create 5 segments per bar for the EQ effect
        const segments = 5;
        const activeSegments = Math.ceil((level / 100) * segments);
        
        return (
          <div
            key={dimension.id}
            className="flex flex-col gap-[2px]"
            title={`${dimension.name}: ${level}%`}
          >
            {Array.from({ length: segments }).map((_, i) => {
              const segmentIndex = segments - 1 - i; // Reverse so bottom is 0
              const isActive = segmentIndex < activeSegments;
              
              return (
                <div
                  key={i}
                  className={cn(
                    'w-4 h-[6px] transition-all duration-300',
                    // NO rounded corners - sharp rectangles like in the screenshot!
                    isActive ? 'opacity-100' : 'opacity-20'
                  )}
                  style={{
                    backgroundColor: dimension.color,
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
