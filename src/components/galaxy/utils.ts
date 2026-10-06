/**
 * A simple deterministic pseudo-random number generator.
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates a numeric seed from a string (like an ID or Name)
 */
function getSeedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Maps a birth date to a 3D position in the galaxy using deterministic randomness.
 * To create adaptable clusters, we use the year and day of the year.
 */
export function calculateStarPosition(
  birthDateString: string | Date,
  index: number,
  seedStr: string
): [number, number, number] {
  const date = new Date(birthDateString);
  const year = date.getFullYear();
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 1000 / 60 / 60 / 24);

  const seed = getSeedFromString(seedStr) + index;

  // Base radius from center based on year (older years are closer to center, newer further out)
  const baseRadius = Math.max(10, (year - 1900) * 1.5);

  // Add deterministic randomness to the radius so stars of the same year aren't perfectly aligned
  const radius = baseRadius + (seededRandom(seed) * 15 - 7.5);

  // Angle is determined by the day of the year (0-365 maps to 0-2PI)
  const angle = (dayOfYear / 365) * Math.PI * 2;

  // Add slight spiral effect offset based on the index to spread overlapping dates
  const spiralOffset = index * 0.1;
  const finalAngle = angle + spiralOffset;

  const x = Math.cos(finalAngle) * radius;
  const z = Math.sin(finalAngle) * radius;

  // Y axis (height) has slight variation for a disc-like galaxy shape
  const y = (seededRandom(seed + 1) - 0.5) * (radius * 0.2); // Thicker in the middle, thinner at edges

  return [x, y, z];
}
