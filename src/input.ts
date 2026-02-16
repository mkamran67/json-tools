import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Resolve input to a parsed JSON value.
 *
 * @param source - A file path (when isFile=true) or a raw JSON string.
 * @param isFile - Whether to read from a file.
 * @returns The parsed JSON value.
 */
export function resolveInput(source: string, isFile: boolean): unknown {
  let raw: string;

  if (isFile) {
    const filePath = resolve(source);
    try {
      raw = readFileSync(filePath, "utf-8");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Could not read file "${filePath}": ${message}`);
    }
  } else {
    raw = source;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      `Invalid JSON: ${raw.length > 80 ? raw.slice(0, 80) + "…" : raw}`,
    );
  }
}
