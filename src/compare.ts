export interface Difference {
  path: string;
  type: "added" | "removed" | "changed";
  oldValue?: unknown;
  newValue?: unknown;
}

export interface CompareResult {
  added: Difference[];
  removed: Difference[];
  changed: Difference[];
  unchanged: number;
  totalA: number;
  totalB: number;
}

/**
 * Recursively compare two JSON values and produce a structured diff.
 */
export function compareJSON(a: unknown, b: unknown): CompareResult {
  const result: CompareResult = {
    added: [],
    removed: [],
    changed: [],
    unchanged: 0,
    totalA: 0,
    totalB: 0,
  };

  diff(a, b, "", result);
  result.totalA = countKeys(a);
  result.totalB = countKeys(b);
  return result;
}

function diff(
  a: unknown,
  b: unknown,
  path: string,
  result: CompareResult,
): void {
  // Both are objects
  if (isObject(a) && isObject(b)) {
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

    for (const key of allKeys) {
      const childPath = path ? `${path}.${key}` : key;
      const inA = key in a;
      const inB = key in b;

      if (inA && !inB) {
        result.removed.push({
          path: childPath,
          type: "removed",
          oldValue: a[key],
        });
      } else if (!inA && inB) {
        result.added.push({ path: childPath, type: "added", newValue: b[key] });
      } else {
        diff(a[key], b[key], childPath, result);
      }
    }
    return;
  }

  // Both are arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = path ? `${path}[${i}]` : `[${i}]`;
      if (i >= a.length) {
        result.added.push({ path: childPath, type: "added", newValue: b[i] });
      } else if (i >= b.length) {
        result.removed.push({
          path: childPath,
          type: "removed",
          oldValue: a[i],
        });
      } else {
        diff(a[i], b[i], childPath, result);
      }
    }
    return;
  }

  // Primitives or type mismatch
  if (a === b) {
    result.unchanged++;
  } else {
    result.changed.push({
      path: path || "(root)",
      type: "changed",
      oldValue: a,
      newValue: b,
    });
  }
}

function countKeys(value: unknown): number {
  if (isObject(value)) {
    let count = Object.keys(value).length;
    for (const v of Object.values(value)) {
      count += countKeys(v);
    }
    return count;
  }
  if (Array.isArray(value)) {
    let count = 0;
    for (const item of value) {
      count += countKeys(item);
    }
    return count;
  }
  return 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
