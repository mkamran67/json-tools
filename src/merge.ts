export interface MergeResult {
  merged: Record<string, unknown>;
  totalObjects: number;
  totalKeys: number;
}

/**
 * Merge all objects in an array into a single object.
 * Later entries override earlier ones for duplicate keys.
 */
export function mergeAll(array: unknown[]): MergeResult {
  if (!Array.isArray(array) || array.length === 0) {
    return { merged: {}, totalObjects: 0, totalKeys: 0 };
  }

  const merged = array.reduce<Record<string, unknown>>(
    (acc, current) => ({ ...acc, ...(isObject(current) ? current : {}) }),
    {},
  );

  return {
    merged,
    totalObjects: array.length,
    totalKeys: Object.keys(merged).length,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
