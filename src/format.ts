import chalk from "chalk";
import type { CountResult } from "./count.js";
import type { DepthResult } from "./depth.js";
import type { CompareResult } from "./compare.js";
import type { MergeResult } from "./merge.js";
import type { CompletenessResult } from "./completeness.js";

// ── Count ───────────────────────────────────────────────

export function formatCount(result: CountResult): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(chalk.bold.cyan("  📊  Property Count"));
  lines.push(chalk.dim("  " + "─".repeat(40)));
  lines.push(
    `  ${chalk.gray("Top-level properties:")}  ${chalk.white.bold(String(result.topLevel))}`,
  );
  lines.push(
    `  ${chalk.gray("Total properties:")}      ${chalk.white.bold(String(result.total))}`,
  );

  if (Object.keys(result.breakdown).length > 0) {
    lines.push("");
    lines.push(chalk.bold("  Per-key breakdown:"));
    for (const [key, count] of Object.entries(result.breakdown)) {
      const bar = chalk.green("█".repeat(Math.min(count, 30)));
      lines.push(
        `    ${chalk.yellow(key)}  ${bar}  ${chalk.dim(String(count) + " nested")}`,
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ── Depth ───────────────────────────────────────────────

export function formatDepth(result: DepthResult): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(chalk.bold.cyan("  🔍  Depth Analysis"));
  lines.push(chalk.dim("  " + "─".repeat(40)));
  lines.push(
    `  ${chalk.gray("Max depth:")}  ${chalk.white.bold(String(result.maxDepth))}`,
  );
  lines.push(`  ${chalk.gray("Deepest path:")}  ${chalk.yellow(result.path)}`);
  lines.push("");
  lines.push(chalk.bold("  Value at deepest path:"));
  lines.push(
    chalk.green(indent(JSON.stringify(result.valueAtPath, null, 2), "    ")),
  );
  lines.push("");

  return lines.join("\n");
}

// ── Compare ─────────────────────────────────────────────

export function formatCompare(result: CompareResult): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(chalk.bold.cyan("  🔀  JSON Comparison"));
  lines.push(chalk.dim("  " + "─".repeat(40)));
  lines.push(
    `  ${chalk.gray("Keys in A:")} ${chalk.white.bold(String(result.totalA))}    ${chalk.gray("Keys in B:")} ${chalk.white.bold(String(result.totalB))}`,
  );
  lines.push(
    `  ${chalk.green("+" + result.added.length + " added")}  ${chalk.red("−" + result.removed.length + " removed")}  ${chalk.yellow("~" + result.changed.length + " changed")}  ${chalk.dim("=" + result.unchanged + " unchanged")}`,
  );

  if (result.added.length > 0) {
    lines.push("");
    lines.push(chalk.green.bold("  ✚ Added"));
    for (const d of result.added) {
      lines.push(
        `    ${chalk.green("+")} ${chalk.yellow(d.path)}  ${chalk.dim("→")} ${chalk.green(stringify(d.newValue))}`,
      );
    }
  }

  if (result.removed.length > 0) {
    lines.push("");
    lines.push(chalk.red.bold("  ✖ Removed"));
    for (const d of result.removed) {
      lines.push(
        `    ${chalk.red("−")} ${chalk.yellow(d.path)}  ${chalk.dim("→")} ${chalk.red(stringify(d.oldValue))}`,
      );
    }
  }

  if (result.changed.length > 0) {
    lines.push("");
    lines.push(chalk.yellow.bold("  ✎ Changed"));
    for (const d of result.changed) {
      lines.push(
        `    ${chalk.yellow("~")} ${chalk.yellow(d.path)}  ${chalk.red(stringify(d.oldValue))} ${chalk.dim("→")} ${chalk.green(stringify(d.newValue))}`,
      );
    }
  }

  if (
    result.added.length === 0 &&
    result.removed.length === 0 &&
    result.changed.length === 0
  ) {
    lines.push("");
    lines.push(chalk.green.bold("  ✓ Objects are identical"));
  }

  lines.push("");
  return lines.join("\n");
}

// ── Merge ───────────────────────────────────────────────

export function formatMerge(result: MergeResult): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(chalk.bold.cyan("  🔗  Merge All Properties"));
  lines.push(chalk.dim("  " + "─".repeat(40)));
  lines.push(
    `  ${chalk.gray("Objects merged:")}  ${chalk.white.bold(String(result.totalObjects))}`,
  );
  lines.push(
    `  ${chalk.gray("Unique keys:")}     ${chalk.white.bold(String(result.totalKeys))}`,
  );
  lines.push("");
  lines.push(chalk.bold("  Merged result:"));
  lines.push(
    chalk.green(indent(JSON.stringify(result.merged, null, 2), "    ")),
  );
  lines.push("");

  return lines.join("\n");
}

// ── Completeness ────────────────────────────────────────

export function formatCompleteness(
  result: CompletenessResult,
  table = true,
): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(chalk.bold.cyan("  📋  Completeness Analysis"));
  lines.push(chalk.dim("  " + "─".repeat(40)));
  lines.push(
    `  ${chalk.gray("Total objects:")}  ${chalk.white.bold(String(result.totalObjects))}`,
  );
  lines.push(
    `  ${chalk.gray("Unique paths:")}   ${chalk.white.bold(String(result.entries.length))}`,
  );

  if (table && result.entries.length > 0) {
    lines.push("");

    // Table header
    const propWidth = Math.max(
      8,
      ...result.entries.map((e) => e.property.length),
    );
    const header = `    ${chalk.bold("Property".padEnd(propWidth))}  ${chalk.bold("Present")}  ${chalk.bold("Missing")}  ${chalk.bold("  %  ")}`;
    lines.push(header);
    lines.push(chalk.dim("    " + "─".repeat(propWidth + 30)));

    for (const entry of result.entries) {
      const pct = parseFloat(entry.missingPercent);
      const color =
        pct === 0 ? chalk.green : pct < 50 ? chalk.yellow : chalk.red;
      lines.push(
        `    ${chalk.yellow(entry.property.padEnd(propWidth))}  ${chalk.green(String(entry.present).padStart(7))}  ${chalk.red(String(entry.missing).padStart(7))}  ${color(entry.presentPercent.padStart(5) + "%")}`,
      );
    }
  } else if (result.entries.length > 0) {
    lines.push("");
    for (const entry of result.entries) {
      lines.push(
        `    ${chalk.yellow(entry.property)}  ${chalk.green(entry.present + " present")}  ${chalk.red(entry.missing + " missing")}  (${entry.presentPercent}%)`,
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ── Helpers ─────────────────────────────────────────────

function indent(text: string, prefix: string): string {
  return text
    .split("\n")
    .map((line) => prefix + line)
    .join("\n");
}

function stringify(value: unknown): string {
  if (typeof value === "string") return `"${value}"`;
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object") {
    const s = JSON.stringify(value);
    return s.length > 60 ? s.slice(0, 57) + "…" : s;
  }
  return String(value);
}
