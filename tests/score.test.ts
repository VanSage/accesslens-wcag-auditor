import { describe, expect, it } from "vitest";
import { scorePage, countByImpact, IMPACT_WEIGHTS } from "@/lib/score";
import type { AxeViolation } from "@/lib/types";

function violation(
  impact: AxeViolation["impact"],
  nodeCount: number
): AxeViolation {
  return {
    id: `rule-${impact}-${nodeCount}`,
    impact,
    description: "test",
    help: "test",
    helpUrl: "https://example.com",
    tags: [],
    nodes: Array.from({ length: nodeCount }, () => ({
      html: "<div></div>",
      target: ["div"],
    })),
  };
}

describe("scorePage", () => {
  it("returns 100 for no violations", () => {
    expect(scorePage([])).toBe(100);
  });

  it("subtracts weight * nodeCount for a single critical violation", () => {
    // 1 critical violation, 2 nodes -> penalty = 10 * 2 = 20 -> score 80
    const score = scorePage([violation("critical", 2)]);
    expect(score).toBe(100 - IMPACT_WEIGHTS.critical * 2);
    expect(score).toBe(80);
  });

  it("combines multiple violations of different impact", () => {
    // critical: 10*1=10, serious: 6*2=12, moderate: 3*1=3, minor: 1*4=4 -> total 29
    const violations = [
      violation("critical", 1),
      violation("serious", 2),
      violation("moderate", 1),
      violation("minor", 4),
    ];
    expect(scorePage(violations)).toBe(100 - 29);
    expect(scorePage(violations)).toBe(71);
  });

  it("clamps at 0 and never goes negative", () => {
    const violations = Array.from({ length: 20 }, () => violation("critical", 5));
    expect(scorePage(violations)).toBe(0);
  });

  it("treats a null impact as minor weight", () => {
    expect(scorePage([violation(null, 1)])).toBe(100 - IMPACT_WEIGHTS.minor);
  });
});

describe("countByImpact", () => {
  it("sums node counts per impact bucket", () => {
    const violations = [violation("critical", 2), violation("critical", 1), violation("moderate", 3)];
    const counts = countByImpact(violations);
    expect(counts).toEqual({ critical: 3, serious: 0, moderate: 3, minor: 0 });
  });

  it("returns all-zero for an empty violation list", () => {
    expect(countByImpact([])).toEqual({
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    });
  });
});
