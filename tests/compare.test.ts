import { describe, it, expect } from "vitest";
import { compareJSON } from "../src/compare.js";

describe("compareJSON", () => {
  it("returns no diffs for identical objects", () => {
    const result = compareJSON({ a: 1, b: 2 }, { a: 1, b: 2 });
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
    expect(result.unchanged).toBe(2);
  });

  it("detects added keys", () => {
    const result = compareJSON({ a: 1 }, { a: 1, b: 2 });
    expect(result.added).toHaveLength(1);
    expect(result.added[0].path).toBe("b");
    expect(result.added[0].newValue).toBe(2);
  });

  it("detects removed keys", () => {
    const result = compareJSON({ a: 1, b: 2 }, { a: 1 });
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].path).toBe("b");
    expect(result.removed[0].oldValue).toBe(2);
  });

  it("detects changed values", () => {
    const result = compareJSON({ a: 1 }, { a: 99 });
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0].path).toBe("a");
    expect(result.changed[0].oldValue).toBe(1);
    expect(result.changed[0].newValue).toBe(99);
  });

  it("handles nested diffs", () => {
    const a = { user: { name: "Alice", age: 30 } };
    const b = { user: { name: "Alice", age: 31 } };
    const result = compareJSON(a, b);
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0].path).toBe("user.age");
    expect(result.unchanged).toBe(1); // user.name
  });

  it("handles array diffs", () => {
    const result = compareJSON([1, 2, 3], [1, 2, 4, 5]);
    expect(result.changed).toHaveLength(1); // [2]: 3 -> 4
    expect(result.added).toHaveLength(1); // [3]: 5
    expect(result.unchanged).toBe(2); // [0], [1]
  });

  it("reports totals correctly", () => {
    const result = compareJSON({ a: 1, b: { c: 2 } }, { a: 1, d: 3 });
    expect(result.totalA).toBe(3); // a, b, c
    expect(result.totalB).toBe(2); // a, d
  });
});
