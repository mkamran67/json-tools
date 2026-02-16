#!/usr/bin/env node

import { Command } from "commander";
import { resolveInput } from "./input.js";
import { countProperties } from "./count.js";
import { analyzeDepth } from "./depth.js";
import { compareJSON } from "./compare.js";
import { formatCount, formatDepth, formatCompare } from "./format.js";

const program = new Command();

program
  .name("jt")
  .description(
    "Analyze JSON objects — count properties, measure depth, and compare structures.",
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

program.parse();

// ── Helpers ─────────────────────────────────────────────

function exitWithError(err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\n  ❌  ${message}\n`);
  process.exit(1);
}
