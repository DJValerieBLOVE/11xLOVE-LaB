/**
 * Card Image Component
 * 
 * Displays images in consistent 16:9 aspect ratio (YouTube cover dimensions)
 * Used for experiment cards, tribe cards, love board cards, etc.
 */

import { cn } from "@/lib/utils";

interface CardImageProps {
  src?: string;
  alt: string;
  fallbackText?: string;
  fallbackGradient?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * 16:9 Aspect Ratio Image Component for Cards
 * 
 * Maintains consistent dimensions across all card types:
 * - Experiment cards
 * - Tribe cards  
 * - Love Board listings
 * - Event cards
 */
export function CardImage({ 
  src, 
  alt, 
  fallbackText,
  fallbackGradient = "from-[#6600ff] to-[#9900ff]",
  className,
  onClick
}: CardImageProps) {
  const hasImage = src && src.trim() !== "";

  return (
    <div 
      className={cn(
        // 16:9 aspect ratio (YouTube cover format)
        "aspect-video w-full overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      ) : (
        // Fallback gradient with optional text
        <div 
          className={cn(
            "w-full h-full flex items-center justify-center",
            "bg-gradient-to-br",
            fallbackGradient
          )}
        >
          {fallbackText && (
            <span className="text-white font-normal text-lg md:text-xl px-4 text-center">
              {fallbackText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Dimension-specific card image with gradient based on dimension color
 */
export function DimensionCardImage({ 
  src, 
  alt, 
  dimensionId,
  fallbackText,
  className,
  onClick
}: CardImageProps & { dimensionId?: number }) {
  // Dimension color gradients (1-11)
  const dimensionGradients: Record<number, string> = {
    1: "from-[#eb00a8] to-[#d4009a]",    // GOD/LOVE - Hot Pink (dimension color)
    2: "from-[#cc00ff] to-[#9900ff]",    // Soul - Magenta (dimension color)
    3: "from-purple-500 to-purple-600",  // Mind - Purple
    4: "from-purple-600 to-indigo-600",  // Body - Deep Purple
    5: "from-red-500 to-red-600",        // Romance - Red
    6: "from-orange-500 to-orange-600",  // Family - Orange
    7: "from-yellow-400 to-yellow-500",  // Community - Yellow
    8: "from-lime-500 to-green-500",     // Mission - Lime
    9: "from-green-500 to-green-600",    // Money - Green
    10: "from-cyan-400 to-cyan-500",     // Time - Cyan
    11: "from-blue-500 to-blue-600",     // Environment - Blue
  };

  const gradient = dimensionId && dimensionGradients[dimensionId] 
    ? dimensionGradients[dimensionId] 
    : "from-[#6600ff] to-[#9900ff]";

  return (
    <CardImage
      src={src}
      alt={alt}
      fallbackText={fallbackText}
      fallbackGradient={gradient}
      className={className}
      onClick={onClick}
    />
  );
}
