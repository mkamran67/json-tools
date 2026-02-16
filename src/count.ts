export interface CountResult {
  topLevel: number;
  total: number;
  breakdown: Record<string, number>;
}

/**
 * Count properties in a JSON value.
 * - For objects: counts keys at top level and recursively.
 * - For arrays: iterates elements and counts recursively.
 * - Primitives contribute 0 properties.
 */
export function countProperties(value: unknown): CountResult {
  if (!isObject(value)) {
    return { topLevel: 0, total: 0, breakdown: {} };
  }

  const keys = Object.keys(value);
  const breakdown: Record<string, number> = {};
  let total = keys.length;

  for (const key of keys) {
    const child = (value as Record<string, unknown>)[key];
    const nested = countAllKeys(child);
    breakdown[key] = nested;
    total += nested;
  }

  return {
    topLevel: keys.length,
    total,
    breakdown,
  };
}

/** Count every key at every nesting level inside a value. */
function countAllKeys(value: unknown): number {
  if (isObject(value)) {
    const keys = Object.keys(value);
    let sum = keys.length;
    for (const key of keys) {
      sum += countAllKeys((value as Record<string, unknown>)[key]);
    }
    return sum;
  }

  if (Array.isArray(value)) {
    let sum = 0;
    for (const item of value) {
      sum += countAllKeys(item);
    }
    return sum;
  }

  return 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
