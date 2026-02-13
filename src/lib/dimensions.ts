/**
 * 11x LOVE LaB — The 11 Dimensions
 * 
 * The Human Operating System (HOS) — LOVE at the center, 
 * connecting 11 Dimensions across 5 Pillars
 */

export interface Dimension {
  id: number;
  name: string;
  slug: string;
  color: string;
  colorName: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  pillar: 'GOD' | 'HEALTH' | 'PEOPLE' | 'PURPOSE' | 'WEALTH';
  description: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 1,
    name: 'GOD/LOVE',
    slug: 'god',
    color: '#eb00a8',
    colorName: 'Hot Pink',
    rgb: { r: 235, g: 0, b: 168 },
    pillar: 'GOD',
    description: 'Spirituality, LOVE, God is my infinite supply, "Let Go and Let God"',
  },
  {
    id: 2,
    name: 'Soul',
    slug: 'soul',
    color: '#cc00ff',
    colorName: 'Magenta',
    rgb: { r: 204, g: 0, b: 255 },
    pillar: 'HEALTH',
    description: 'Inner peace, joy, self-love, authenticity',
  },
  {
    id: 3,
    name: 'Mind',
    slug: 'mind',
    color: '#9900ff',
    colorName: 'Purple',
    rgb: { r: 153, g: 0, b: 255 },
    pillar: 'HEALTH',
    description: 'Mental clarity, focus, learning, emotional regulation',
  },
  {
    id: 4,
    name: 'Body',
    slug: 'body',
    color: '#6600ff',
    colorName: 'Purple (PRIMARY BRAND COLOR)',
    rgb: { r: 102, g: 0, b: 255 },
    pillar: 'HEALTH',
    description: 'Physical health, energy, movement, sobriety',
  },
  {
    id: 5,
    name: 'Romance',
    slug: 'romance',
    color: '#e60023',
    colorName: 'Red',
    rgb: { r: 230, g: 0, b: 35 },
    pillar: 'PEOPLE',
    description: 'Intimacy, partnership, desire, safety',
  },
  {
    id: 6,
    name: 'Family',
    slug: 'family',
    color: '#ff6600',
    colorName: 'Orange',
    rgb: { r: 255, g: 102, b: 0 },
    pillar: 'PEOPLE',
    description: 'Parenting, connection, healing generational patterns',
  },
  {
    id: 7,
    name: 'Community',
    slug: 'community',
    color: '#ffdf00',
    colorName: 'Yellow',
    rgb: { r: 255, g: 223, b: 0 },
    pillar: 'PEOPLE',
    description: 'Tribe, belonging, support, meaningful friendships',
  },
  {
    id: 8,
    name: 'Mission',
    slug: 'mission',
    color: '#a2f005',
    colorName: 'Lime Green',
    rgb: { r: 162, g: 240, b: 5 },
    pillar: 'PURPOSE',
    description: 'IKIGAI, mission, reason for being',
  },
  {
    id: 9,
    name: 'Money',
    slug: 'money',
    color: '#00d81c',
    colorName: 'Matrix Green',
    rgb: { r: 0, g: 216, b: 28 },
    pillar: 'WEALTH',
    description: 'Financial sovereignty, Bitcoin, abundance mindset',
  },
  {
    id: 10,
    name: 'Time',
    slug: 'time',
    color: '#00ccff',
    colorName: 'Cyan',
    rgb: { r: 0, g: 204, b: 255 },
    pillar: 'WEALTH',
    description: 'Energy management, boundaries, sacred rhythms',
  },
  {
    id: 11,
    name: 'Environment',
    slug: 'environment',
    color: '#0033ff',
    colorName: 'Blue',
    rgb: { r: 0, g: 51, b: 255 },
    pillar: 'WEALTH',
    description: 'Home, workspace, nature connection, simplicity',
  },
];

/**
 * Get dimension by ID (1-11)
 */
export function getDimensionById(id: number): Dimension | undefined {
  return DIMENSIONS.find((d) => d.id === id);
}

/**
 * Get dimension by slug
 */
export function getDimensionBySlug(slug: string): Dimension | undefined {
  return DIMENSIONS.find((d) => d.slug === slug);
}

/**
 * Get all dimensions for a specific pillar
 */
export function getDimensionsByPillar(pillar: Dimension['pillar']): Dimension[] {
  return DIMENSIONS.filter((d) => d.pillar === pillar);
}

/**
 * Get dimension color by ID
 */
export function getDimensionColor(id: number): string {
  const dimension = getDimensionById(id);
  return dimension?.color || '#6600ff'; // Default to Body (primary brand color)
}

/**
 * Get dimension RGB by ID
 */
export function getDimensionRGB(id: number): { r: number; g: number; b: number } {
  const dimension = getDimensionById(id);
  return dimension?.rgb || { r: 102, g: 0, b: 255 }; // Default to Body
}

/**
 * The 5 Pillars of the Prosperity Pyramid
 */
export const PILLARS = {
  GOD: {
    name: 'GOD',
    description: 'The center, the source, the foundation — infinite supply',
    position: 'Center (The Heart)',
    dimensions: getDimensionsByPillar('GOD'),
  },
  HEALTH: {
    name: 'HEALTH',
    description: 'Your inner world — body, mind, soul',
    position: 'Base Corner 1',
    dimensions: getDimensionsByPillar('HEALTH'),
  },
  PEOPLE: {
    name: 'PEOPLE',
    description: 'Your relationships and community',
    position: 'Base Corner 2',
    dimensions: getDimensionsByPillar('PEOPLE'),
  },
  PURPOSE: {
    name: 'PURPOSE',
    description: 'Your IKIGAI, mission, reason for being',
    position: 'Top of Pyramid',
    dimensions: getDimensionsByPillar('PURPOSE'),
  },
  WEALTH: {
    name: 'WEALTH',
    description: 'The fuel for everything else',
    position: 'Base Corner 3',
    dimensions: getDimensionsByPillar('WEALTH'),
  },
} as const;
