import { readFileSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";

/**
 * Resolve input to a parsed JSON value.
 *
 * If `isFile` is true, the source is always read as a file.
 * Otherwise, the source is first tried as raw JSON.  If that fails
 * and the source looks like a file path (has a common extension or
 * exists on disk), it is automatically read as a file.
 *
 * @param source - A file path or a raw JSON string.
 * @param isFile - Force file mode.
 * @returns The parsed JSON value.
 */
export function resolveInput(source: string, isFile: boolean): unknown {
  // Explicit file mode
  if (isFile) {
    return parseJSON(readFile(source), source);
  }

  // Try parsing as raw JSON first
  try {
    return JSON.parse(source);
  } catch {
    // Not valid JSON — check if it looks like a file path
  }

  // Auto-detect: has a file extension or exists on disk
  const fileExts = [".json", ".jsonl", ".jsonc", ".txt", ".log"];
  if (fileExts.includes(extname(source).toLowerCase()) || existsSync(source)) {
    return parseJSON(readFile(source), source);
  }

  // Neither valid JSON nor a recognizable file path
  throw new Error(
    `Invalid JSON (and no matching file found): ${source.length > 80 ? source.slice(0, 80) + "…" : source}`,
  );
}

function readFile(source: string): string {
  const filePath = resolve(source);
  try {
    return readFileSync(filePath, "utf-8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Could not read file "${filePath}": ${message}`);
  }
}

function parseJSON(raw: string, label: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      `Invalid JSON in "${label}": ${raw.length > 80 ? raw.slice(0, 80) + "…" : raw}`,
    );
  }
}
