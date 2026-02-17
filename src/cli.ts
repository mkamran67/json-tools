#!/usr/bin/env node

import { Command } from "commander";
import { resolveInput } from "./input.js";
import { countProperties } from "./count.js";
import { analyzeDepth } from "./depth.js";
import { compareJSON } from "./compare.js";
import { mergeAll } from "./merge.js";
import { analyzeCompleteness } from "./completeness.js";
import {
  formatCount,
  formatDepth,
  formatCompare,
  formatMerge,
  formatCompleteness,
} from "./format.js";

const program = new Command();

program
  .name("jt")
  .description(
    "Analyze JSON objects — count properties, measure depth, compare structures, merge, and check completeness.",
  )
  .version("1.0.0");

// ── count ───────────────────────────────────────────────

program
  .command("count")
  .description("Count properties in a JSON object (top-level and total)")
  .argument("<source>", "JSON string or file path (use -f for file)")
  .option("-f, --file", "Treat <source> as a file path")
  .action((source: string, opts: { file?: boolean }) => {
    try {
      const data = resolveInput(source, !!opts.file);
      const result = countProperties(data);
      console.log(formatCount(result));
    } catch (err) {
      exitWithError(err);
    }
  });

// ── depth ───────────────────────────────────────────────

program
  .command("depth")
  .description(
    "Find the maximum nesting depth and the value at the deepest path",
  )
  .argument("<source>", "JSON string or file path (use -f for file)")
  .option("-f, --file", "Treat <source> as a file path")
  .action((source: string, opts: { file?: boolean }) => {
    try {
      const data = resolveInput(source, !!opts.file);
      const result = analyzeDepth(data);
      console.log(formatDepth(result));
    } catch (err) {
      exitWithError(err);
    }
  });

// ── compare ─────────────────────────────────────────────

program
  .command("compare")
  .description("Compare two JSON objects and show differences")
  .argument("<sourceA>", "First JSON string or file path")
  .argument("<sourceB>", "Second JSON string or file path")
  .option("-f, --file", "Treat both sources as file paths")
  .action((sourceA: string, sourceB: string, opts: { file?: boolean }) => {
    try {
      const a = resolveInput(sourceA, !!opts.file);
      const b = resolveInput(sourceB, !!opts.file);
      const result = compareJSON(a, b);
      console.log(formatCompare(result));
    } catch (err) {
      exitWithError(err);
    }
  });

// ── merge ───────────────────────────────────────────────

program
  .command("merge")
  .description("Merge all objects in a JSON array into a single object")
  .argument("<source>", "JSON array string or file path (use -f for file)")
  .option("-f, --file", "Treat <source> as a file path")
  .action((source: string, opts: { file?: boolean }) => {
    try {
      const data = resolveInput(source, !!opts.file);
      if (!Array.isArray(data)) {
        throw new Error("Input must be a JSON array of objects.");
      }
      const result = mergeAll(data);
      console.log(formatMerge(result));
    } catch (err) {
      exitWithError(err);
    }
  });

// ── completeness (comp) ────────────────────────────────

program
  .command("comp")
  .description("Analyze property completeness across a JSON array of objects")
  .argument("<source>", "JSON array string or file path (use -f for file)")
  .option("-f, --file", "Treat <source> as a file path")
  .option("-d, --depth <n>", "Max recursion depth (default: 9)", "9")
  .option("--no-table", "Output as plain list instead of table")
  .action(
    (
      source: string,
      opts: { file?: boolean; depth?: string; table?: boolean },
    ) => {
      try {
        const data = resolveInput(source, !!opts.file);
        if (!Array.isArray(data)) {
          throw new Error("Input must be a JSON array of objects.");
        }
        const maxDepth = parseInt(opts.depth ?? "9", 10);
        const result = analyzeCompleteness(data, maxDepth);
        console.log(formatCompleteness(result, opts.table !== false));
      } catch (err) {
        exitWithError(err);
      }
    },
  );

program.parse();

// ── Helpers ─────────────────────────────────────────────

function exitWithError(err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\n  ❌  ${message}\n`);
  process.exit(1);
}
