import { describe, it, expect } from "vitest";
import { countProperties } from "../src/count.js";

describe("countProperties", () => {
  it("counts a flat object", () => {
    const result = countProperties({ a: 1, b: 2, c: 3 });
    expect(result.topLevel).toBe(3);
    expect(result.total).toBe(3);
  });

  it("counts nested objects", () => {
    const result = countProperties({ a: 1, b: { c: 2, d: 3 } });
    expect(result.topLevel).toBe(2);
    // total = 2 (top) + 2 (b's children) = 4
    expect(result.total).toBe(4);
  });

  it("counts deeply nested objects", () => {
    const result = countProperties({ a: { b: { c: { d: 1 } } } });
    // top: 1 (a), nested in a: b(1), nested in b: c(1), nested in c: d(1)
    expect(result.topLevel).toBe(1);
    expect(result.total).toBe(4);
  });

  it("handles arrays of objects", () => {
    const result = countProperties({ items: [{ x: 1 }, { y: 2 }] });
    // top: 1 (items), nested: 2 (x + y from array objects)
    expect(result.topLevel).toBe(1);
    expect(result.total).toBe(3);
  });

  it("returns zero for empty object", () => {
    const result = countProperties({});
    expect(result.topLevel).toBe(0);
    expect(result.total).toBe(0);
  });

  it("returns zero for primitives", () => {
    expect(countProperties(42).total).toBe(0);
    expect(countProperties("hello").total).toBe(0);
    expect(countProperties(null).total).toBe(0);
  });

  it("provides per-key breakdown", () => {
    const result = countProperties({ a: 1, b: { c: 2 } });
    expect(result.breakdown.a).toBe(0);
    expect(result.breakdown.b).toBe(1);
  });
});
