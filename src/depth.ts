export interface DepthResult {
  maxDepth: number;
  path: string;
  valueAtPath: unknown;
}

/**
 * Analyze the depth of a JSON value.
 * Returns the maximum nesting depth, the dot-path to the deepest node,
 * and the value found at that path.
 *
 * Depth 0 = the root value itself (primitive or empty object/array).
 * Depth 1 = root is an object/array with at least one child.
 */
export function analyzeDepth(value: unknown): DepthResult {
  if (!isContainer(value)) {
    return { maxDepth: 0, path: "(root)", valueAtPath: value };
  }

  const result: DepthResult = {
    maxDepth: 0,
    path: "(root)",
    valueAtPath: value,
  };
  walk(value, "", 0, result);
  return result;
}

function walk(
  value: unknown,
  currentPath: string,
  currentDepth: number,
  result: DepthResult,
): void {
  if (currentDepth > result.maxDepth) {
    result.maxDepth = currentDepth;
    result.path = currentPath || "(root)";
    result.valueAtPath = value;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const childPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
      if (isContainer(value[i])) {
        walk(value[i], childPath, currentDepth + 1, result);
      } else if (currentDepth + 1 > result.maxDepth) {
        result.maxDepth = currentDepth + 1;
        result.path = childPath;
        result.valueAtPath = value[i];
      }
    }
  } else if (isObject(value)) {
    const keys = Object.keys(value);
    for (const key of keys) {
      const child = value[key];
      const childPath = currentPath ? `${currentPath}.${key}` : key;
      if (isContainer(child)) {
        walk(child, childPath, currentDepth + 1, result);
      } else if (currentDepth + 1 > result.maxDepth) {
        result.maxDepth = currentDepth + 1;
        result.path = childPath;
        result.valueAtPath = child;
      }
    }
  }
}

function isContainer(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0;
  return false;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
