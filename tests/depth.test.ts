import { describe, it, expect } from "vitest";
import { analyzeDepth } from "../src/depth.js";

describe("analyzeDepth", () => {
  it("returns depth 0 for a primitive", () => {
    const result = analyzeDepth(42);
    expect(result.maxDepth).toBe(0);
  });

  it("returns depth 1 for a flat object", () => {
    const result = analyzeDepth({ a: 1, b: 2 });
    expect(result.maxDepth).toBe(1);
  });

  it("measures deeply nested objects", () => {
    const result = analyzeDepth({ a: { b: { c: { d: 1 } } } });
    expect(result.maxDepth).toBe(4);
    expect(result.path).toBe("a.b.c.d");
    expect(result.valueAtPath).toBe(1);
  });

  it("handles arrays", () => {
    const result = analyzeDepth({ items: [{ nested: true }] });
    // root -> items -> [0] -> nested = depth 3
    expect(result.maxDepth).toBe(3);
  });

  it("returns the value at the deepest path", () => {
    const deepValue = { secret: "found" };
    const result = analyzeDepth({ a: { b: deepValue } });
    expect(result.maxDepth).toBe(3);
    expect(result.path).toBe("a.b.secret");
    expect(result.valueAtPath).toBe("found");
  });

  it("returns depth 0 for empty object", () => {
    const result = analyzeDepth({});
    expect(result.maxDepth).toBe(0);
  });
});
