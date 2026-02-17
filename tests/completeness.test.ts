import { describe, it, expect } from "vitest";
import { analyzeCompleteness } from "../src/completeness.js";

describe("analyzeCompleteness", () => {
  it("detects full presence when all objects have the same keys", () => {
    const input = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ];
    const result = analyzeCompleteness(input);

    expect(result.totalObjects).toBe(2);
    expect(result.entries).toHaveLength(2);
    for (const entry of result.entries) {
      expect(entry.present).toBe(2);
      expect(entry.missing).toBe(0);
      expect(entry.presentPercent).toBe("100.0");
    }
  });

  it("detects missing properties across objects", () => {
    const input = [{ a: 1, b: 2 }, { a: 3 }, { a: 5 }];
    const result = analyzeCompleteness(input);

    const entryA = result.entries.find((e) => e.property === "a");
    const entryB = result.entries.find((e) => e.property === "b");

    expect(entryA?.present).toBe(3);
    expect(entryA?.missing).toBe(0);
    expect(entryB?.present).toBe(1);
    expect(entryB?.missing).toBe(2);
  });

  it("handles nested properties", () => {
    const input = [{ a: { x: 1 } }, { a: { x: 2, y: 3 } }];
    const result = analyzeCompleteness(input);

    const entryY = result.entries.find((e) => e.property === "a.y");
    expect(entryY?.present).toBe(1);
    expect(entryY?.missing).toBe(1);
  });

  it("returns empty for empty array", () => {
    const result = analyzeCompleteness([]);
    expect(result.entries).toHaveLength(0);
    expect(result.totalObjects).toBe(0);
  });

  it("sorts by most missing first", () => {
    const input = [{ a: 1, b: 2, c: 3 }, { a: 1 }, { a: 1, b: 2 }];
    const result = analyzeCompleteness(input);

    // c is missing in 2 objects, b in 1, a in 0
    expect(result.entries[0].property).toBe("c");
    expect(result.entries[0].missing).toBe(2);
  });
});
