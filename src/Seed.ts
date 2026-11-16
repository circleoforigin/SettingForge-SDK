
/**
 * Generates a stable unsigned 32-bit seed
 * from a string.
 *
 * Uses FNV-1a over UTF-8 bytes.
 */
export function createSeed(
  value: string
): number
{
  const normalized =
    value.normalize('NFC');

  const bytes =
    new TextEncoder().encode(normalized);

  let hash = 2166136261;

  for (const byte of bytes)
  {
    hash ^= byte;

    hash = Math.imul(
      hash,
      16777619
    );
  }

  return hash >>> 0;
}

/**
 * Derives a deterministic child seed
 * from a parent seed and namespace.
 */
export function deriveSeed(
  parentSeed: number,
  namespace: string
): number
{
  return createSeed(
    `${parentSeed >>> 0}:${namespace}`
  );
}


/**
 * Advances a deterministic unsigned 32-bit
 * pseudo-random number generator by one step.
 *
 * Identical seeds produce identical sequences.
 */
export function nextRandomState(
  state: number
): number {
  return (
    Math.imul(state, 1664525) +
    1013904223
  ) >>> 0;
}

/**
 * Creates a deterministic random number source.
 * Each call returns a number in [0, 1).
 */
export function createSeededRandom(
  seed: number
): () => number {
  let state = seed >>> 0;

  return () => {
    state = nextRandomState(state);
    return state / 0x100000000;
  };
}

