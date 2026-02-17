import { describe, it, expect } from "vitest";
import { mergeAll } from "../src/merge.js";

describe("mergeAll", () => {
  it("merges multiple objects into one", () => {
    const input = [{ a: 1 }, { b: 2 }, { c: 3 }];
    const result = mergeAll(input);

    expect(result.merged).toEqual({ a: 1, b: 2, c: 3 });
    expect(result.totalObjects).toBe(3);
    expect(result.totalKeys).toBe(3);
  });

  it("later values override earlier ones for duplicate keys", () => {
    const input = [
      { a: 1, b: 2 },
      { b: 99, c: 3 },
    ];
    const result = mergeAll(input);

    expect(result.merged).toEqual({ a: 1, b: 99, c: 3 });
    expect(result.totalKeys).toBe(3);
  });

  it("handles empty array", () => {
    const result = mergeAll([]);
    expect(result.merged).toEqual({});
    expect(result.totalObjects).toBe(0);
    expect(result.totalKeys).toBe(0);
  });

  it("skips non-object items in the array", () => {
    const input = [{ a: 1 }, "not an object", { b: 2 }];
    const result = mergeAll(input);

    expect(result.merged).toEqual({ a: 1, b: 2 });
    expect(result.totalObjects).toBe(3);
  });
});
