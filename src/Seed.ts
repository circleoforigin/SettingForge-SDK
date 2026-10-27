
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
