/**
 * DimensionBadge Component
 * 
 * Display a dimension badge with its official color
 * Usage: <DimensionBadge dimensionId={4} /> or <DimensionBadge dimension="body" />
 */

import { Badge } from '@/components/ui/badge';
import { getDimensionById, getDimensionBySlug, type Dimension } from '@/lib/dimensions';

interface DimensionBadgeProps {
  dimensionId?: number;
  dimension?: string;
  className?: string;
}

export function DimensionBadge({ dimensionId, dimension, className }: DimensionBadgeProps) {
  let dim: Dimension | undefined;
  
  if (dimensionId) {
    dim = getDimensionById(dimensionId);
  } else if (dimension) {
    dim = getDimensionBySlug(dimension);
  }
  
  if (!dim) {
    return null;
  }
  
  return (
    <Badge 
      className={className}
      style={{ 
        backgroundColor: dim.color, 
        color: 'white',
        borderColor: dim.color,
      }}
    >
      {dim.name}
    </Badge>
  );
}
