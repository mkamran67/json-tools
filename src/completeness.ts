export interface CompletenessEntry {
  property: string;
  present: number;
  missing: number;
  presentPercent: string;
  missingPercent: string;
}

export interface CompletenessResult {
  entries: CompletenessEntry[];
  totalObjects: number;
}

/**
 * Analyze how complete each property path is across an array of objects.
 * Recursively discovers every dot-path and reports presence/absence counts.
 */
export function analyzeCompleteness(
  array: unknown[],
  maxDepth = 9,
): CompletenessResult {
  if (!Array.isArray(array) || array.length === 0) {
    return { entries: [], totalObjects: 0 };
  }

  const totalObjects = array.length;
  const propertyStats: Record<string, { present: number; missing: number }> =
    {};

  // Recursively get all dot-paths in an object
  function getAllPaths(obj: unknown, prefix = "", depth = 0): string[] {
    const paths: string[] = [];

    if (depth >= maxDepth || obj === null || obj === undefined) {
      return paths;
    }

    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        paths.push(...getAllPaths(obj[0], `${prefix}[0]`, depth + 1));
      }
    } else if (typeof obj === "object") {
      Object.keys(obj as Record<string, unknown>).forEach((key) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        paths.push(newPrefix);
        paths.push(
          ...getAllPaths(
            (obj as Record<string, unknown>)[key],
            newPrefix,
            depth + 1,
          ),
        );
      });
    }

    return paths;
  }

  // Get value at a dot-path
  function getValueAtPath(obj: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>((current, key) => {
      const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, prop, index] = arrayMatch;
        const c = current as Record<string, unknown[] | undefined> | undefined;
        return c?.[prop]?.[parseInt(index)];
      }
      return (current as Record<string, unknown> | undefined)?.[key];
    }, obj);
  }

  // Collect all unique paths from every object
  const allPaths = new Set<string>();
  array.forEach((obj) => {
    getAllPaths(obj).forEach((path: string) => allPaths.add(path));
  });

  // Count presence/absence for each path
  allPaths.forEach((path) => {
    propertyStats[path] = { present: 0, missing: 0 };

    array.forEach((obj) => {
      const value = getValueAtPath(obj, path);
      if (value !== null && value !== undefined) {
        propertyStats[path].present++;
      } else {
        propertyStats[path].missing++;
      }
    });
  });

  // Format results
  const entries = Object.entries(propertyStats)
    .map(([prop, stats]) => ({
      property: prop,
      present: stats.present,
      missing: stats.missing,
      presentPercent: ((stats.present / totalObjects) * 100).toFixed(1),
      missingPercent: ((stats.missing / totalObjects) * 100).toFixed(1),
    }))
    .sort((a, b) => b.missing - a.missing);

  return { entries, totalObjects };
}
