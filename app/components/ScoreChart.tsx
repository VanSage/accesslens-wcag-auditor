"use client";

import { scoreLabel } from "@/lib/score";

const CHART_ROWS = [
  { size: 96, glyphs: "E" },
  { size: 64, glyphs: "F P" },
  { size: 44, glyphs: "T O Z" },
  { size: 32, glyphs: "L P E D" },
  { size: 24, glyphs: "P E C F D" },
];

function toneForScore(score: number): { text: string; ring: string } {
  if (score >= 90) return { text: "text-pass", ring: "border-pass" };
  if (score >= 75) return { text: "text-ink", ring: "border-line" };
  if (score >= 50) return { text: "text-warn", ring: "border-warn" };
  return { text: "text-critical", ring: "border-critical" };
}

export function ScoreChart({ score }: { score: number }) {
  const tone = toneForScore(score);
  // The number of chart rows rendered "in focus" (fully opaque) scales with
  // score — a low score visibly blurs out toward the bottom of the chart,
  // literally illustrating "the further you go, the less legible it gets."
  const rowsInFocus = Math.max(1, Math.round((score / 100) * CHART_ROWS.length));

  return (
    <div
      className={`relative w-full max-w-md border ${tone.ring} bg-white/60 px-8 py-10 animate-focusIn`}
      role="img"
      aria-label={`Accessibility score ${score} out of 100, ${scoreLabel(score)}`}
    >
      <div className="flex items-baseline justify-between mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Legibility score
        </span>
        <span className={`font-mono text-3xl font-semibold ${tone.text}`}>
          {score}
          <span className="text-base text-muted">/100</span>
        </span>
      </div>

      <div className="space-y-3" aria-hidden="true">
        {CHART_ROWS.map((row, i) => {
          const inFocus = i < rowsInFocus;
          return (
            <div
              key={row.size}
              className="chart-letter text-ink text-center tracking-[0.3em]"
              style={{
                fontSize: row.size,
                lineHeight: 1,
                opacity: inFocus ? 1 : 0.22,
                filter: inFocus ? "none" : `blur(${(rowsInFocus < i ? i - rowsInFocus : 0) * 1.5}px)`,
              }}
            >
              {row.glyphs}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-muted font-mono">{scoreLabel(score)}</p>
    </div>
  );
}
