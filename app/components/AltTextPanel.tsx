"use client";

import { useState } from "react";
import type { AltTextSuggestion } from "@/lib/types";

export function AltTextPanel({
  suggestions,
}: {
  suggestions: AltTextSuggestion[];
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(suggestions.map((s) => [s.selector, s.suggestedAlt]))
  );

  if (suggestions.length === 0) return null;

  return (
    <div className="border border-line bg-white/60 p-4">
      <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-3">
        Draft alt text ({suggestions.length} image
        {suggestions.length === 1 ? "" : "s"} missing it)
      </h3>
      <ul className="space-y-4">
        {suggestions.map((s) => (
          <li key={s.selector} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <code className="font-mono text-xs text-muted">
                {s.selector} — {s.srcHint || "(no src)"}
              </code>
              <span className="font-mono text-[10px] uppercase tracking-widest text-warn">
                {s.source === "ai" ? "AI-suggested — verify" : "Heuristic draft"}
              </span>
            </div>
            <input
              type="text"
              value={values[s.selector] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [s.selector]: e.target.value }))
              }
              className="border border-line bg-transparent px-3 py-2 text-sm font-mono outline-none focus-visible:outline-focus"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
