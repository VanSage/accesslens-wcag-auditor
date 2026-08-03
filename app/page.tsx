"use client";

import { useState } from "react";
import { EditorPanel } from "./components/EditorPanel";
import { ScoreChart } from "./components/ScoreChart";
import { ViolationsList } from "./components/ViolationsList";
import { AltTextPanel } from "./components/AltTextPanel";
import { useAudit } from "@/lib/useAudit";
import { buildMarkdownReport, downloadMarkdown } from "@/lib/report";
import { countByImpact } from "@/lib/score";

export default function HomePage() {
  const [html, setHtml] = useState("");
  const { status, errorMessage, run, runAudit } = useAudit();

  async function handleLoadSample() {
    const res = await fetch("/sample.html");
    const text = await res.text();
    setHtml(text);
  }

  function handleRun() {
    runAudit(html);
  }

  function handleDownload() {
    if (!run) return;
    downloadMarkdown(`accesslens-report-${run.id}.md`, buildMarkdownReport(run));
  }

  const counts = run ? countByImpact(run.violations) : null;

  return (
    <main className="min-h-screen">
      <header className="border-b border-line px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
            AccessLens
          </p>
          <h1 className="chart-letter text-4xl sm:text-5xl font-medium leading-tight max-w-2xl">
            See what your users can&apos;t.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Paste any HTML and AccessLens runs a real WCAG audit — via{" "}
            <span className="font-mono text-sm">axe-core</span>, isolated in a
            sandboxed frame — right in your browser. No login, no API key,
            nothing leaves your machine.
          </p>
          <p className="mt-3 max-w-xl text-xs text-muted font-mono">
            This is a drafting and triage aid. It is not a certification of
            legal WCAG compliance — always pair automated results with manual
            testing and real assistive technology.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <EditorPanel
            html={html}
            onChange={setHtml}
            onRun={handleRun}
            onLoadSample={handleLoadSample}
            status={status}
          />

          <div className="flex flex-col items-start gap-6">
            {status === "idle" && !run && (
              <div className="w-full border border-dashed border-line p-10 text-center text-muted font-mono text-sm">
                Run an audit to see the score chart, flagged issues, and draft
                alt text here.
              </div>
            )}

            {status === "error" && (
              <div className="w-full border border-critical bg-critical/5 p-4 text-critical font-mono text-sm">
                {errorMessage}
              </div>
            )}

            {run && (
              <>
                <ScoreChart score={run.score} />
                {counts && (
                  <div className="grid w-full max-w-md grid-cols-4 gap-2 font-mono text-xs">
                    <div className="border border-line p-2 text-center">
                      <div className="text-critical text-lg">
                        {counts.critical}
                      </div>
                      <div className="text-muted">critical</div>
                    </div>
                    <div className="border border-line p-2 text-center">
                      <div className="text-critical text-lg">
                        {counts.serious}
                      </div>
                      <div className="text-muted">serious</div>
                    </div>
                    <div className="border border-line p-2 text-center">
                      <div className="text-warn text-lg">
                        {counts.moderate}
                      </div>
                      <div className="text-muted">moderate</div>
                    </div>
                    <div className="border border-line p-2 text-center">
                      <div className="text-muted text-lg">{counts.minor}</div>
                      <div className="text-muted">minor</div>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="font-mono text-xs uppercase tracking-widest text-focus underline underline-offset-2"
                >
                  Download report (Markdown)
                </button>
              </>
            )}
          </div>
        </div>

        {run && (
          <div className="mt-12 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
                Violations
              </h2>
              <ViolationsList violations={run.violations} />
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
                Alt text
              </h2>
              <AltTextPanel suggestions={run.altTextSuggestions} />
            </div>
          </div>
        )}
      </section>

      <footer className="border-t border-line px-6 py-6 sm:px-10 mt-16">
        <p className="mx-auto max-w-6xl font-mono text-xs text-muted">
          Built with OpenAI Codex for the ChatGPT Codex India Hackathon 2026.
        </p>
      </footer>
    </main>
  );
}
