"use client";

import type { AxeViolation } from "@/lib/types";

const IMPACT_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

const IMPACT_STYLES: Record<string, string> = {
  critical: "border-critical text-critical",
  serious: "border-critical text-critical",
  moderate: "border-warn text-warn",
  minor: "border-muted text-muted",
};

function sortViolations(violations: AxeViolation[]): AxeViolation[] {
  return [...violations].sort(
    (a, b) =>
      (IMPACT_ORDER[a.impact ?? "minor"] ?? 4) -
      (IMPACT_ORDER[b.impact ?? "minor"] ?? 4)
  );
}

export function ViolationsList({ violations }: { violations: AxeViolation[] }) {
  if (violations.length === 0) {
    return (
      <div className="border border-pass bg-pass/5 p-6 text-center">
        <p className="font-mono text-sm text-pass">
          No violations found by axe-core&apos;s ruleset.
        </p>
      </div>
    );
  }

  const sorted = sortViolations(violations);

  return (
    <ul className="space-y-3">
      {sorted.map((v) => {
        const style = IMPACT_STYLES[v.impact ?? "minor"] ?? IMPACT_STYLES.minor;
        return (
          <li key={v.id} className={`border-l-4 ${style} bg-white/60 p-4`}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-ink">{v.help}</h3>
              <span
                className={`shrink-0 font-mono text-[10px] uppercase tracking-widest ${style} border px-2 py-0.5`}
              >
                {v.impact ?? "unknown"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">{v.description}</p>

            <details className="mt-2">
              <summary className="cursor-pointer font-mono text-xs text-focus">
                {v.nodes.length} element{v.nodes.length === 1 ? "" : "s"} affected
              </summary>
              <ul className="mt-2 space-y-2">
                {v.nodes.map((node, i) => (
                  <li
                    key={i}
                    className="bg-ink/[0.03] p-2 font-mono text-xs overflow-x-auto"
                  >
                    <code className="block whitespace-pre-wrap break-words">
                      {node.html}
                    </code>
                    {node.failureSummary && (
                      <p className="mt-1 text-muted whitespace-pre-line">
                        {node.failureSummary}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </details>

            <a
              href={v.helpUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block font-mono text-xs text-focus underline underline-offset-2"
            >
              How to fix this →
            </a>
          </li>
        );
      })}
    </ul>
  );
}
