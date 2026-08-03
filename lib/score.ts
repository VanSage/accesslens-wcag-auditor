import type { AxeViolation } from "./types";

/**
 * Deterministic 0–100 accessibility score.
 *
 * Rule (documented so it's checkable, not a black box):
 *   score = 100 − Σ (impactWeight[node.impact] for every failing node)
 *   clamped to [0, 100]
 *
 * Weights are per FAILING NODE (not per rule), so a rule that fails on
 * 10 elements costs more than one that fails on a single element —
 * this matches how a real audit "feels" more violated.
 */
export const IMPACT_WEIGHTS: Record<string, number> = {
  critical: 10,
  serious: 6,
  moderate: 3,
  minor: 1,
};

export function scorePage(violations: AxeViolation[]): number {
  let penalty = 0;
  for (const violation of violations) {
    const weight = IMPACT_WEIGHTS[violation.impact ?? "minor"] ?? 1;
    const nodeCount = violation.nodes?.length ?? 1;
    penalty += weight * nodeCount;
  }
  const score = 100 - penalty;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function countByImpact(
  violations: AxeViolation[]
): Record<"critical" | "serious" | "moderate" | "minor", number> {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const violation of violations) {
    const impact = (violation.impact ?? "minor") as keyof typeof counts;
    const nodeCount = violation.nodes?.length ?? 1;
    if (impact in counts) counts[impact] += nodeCount;
  }
  return counts;
}

export function scoreLabel(score: number): string {
  if (score >= 90) return "20/20 — excellent";
  if (score >= 75) return "20/40 — good, minor issues";
  if (score >= 50) return "20/70 — needs correction";
  return "20/200 — significant barriers";
}
