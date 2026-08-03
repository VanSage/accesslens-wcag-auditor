"use client";

interface EditorPanelProps {
  html: string;
  onChange: (html: string) => void;
  onRun: () => void;
  onLoadSample: () => void;
  status: "idle" | "loading-axe" | "running" | "done" | "error";
}

export function EditorPanel({
  html,
  onChange,
  onRun,
  onLoadSample,
  status,
}: EditorPanelProps) {
  const isBusy = status === "loading-axe" || status === "running";

  return (
    <div className="border border-line bg-white/60 flex flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <label
          htmlFor="html-input"
          className="font-mono text-xs uppercase tracking-widest text-muted"
        >
          HTML to audit
        </label>
        <button
          type="button"
          onClick={onLoadSample}
          className="font-mono text-xs text-focus underline underline-offset-2 hover:text-ink"
        >
          Load sample page
        </button>
      </div>

      <textarea
        id="html-input"
        value={html}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 min-h-[320px] resize-y p-4 font-mono text-sm bg-transparent outline-none focus-visible:outline-focus"
        placeholder="Paste a snippet of HTML here, or load the sample page →"
      />

      <div className="border-t border-line p-4">
        <button
          type="button"
          onClick={onRun}
          disabled={isBusy || html.trim().length === 0}
          className="w-full sm:w-auto px-6 py-3 bg-ink text-paper font-mono text-sm uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-focus transition-colors"
        >
          {status === "loading-axe" && "Loading auditor…"}
          {status === "running" && "Scanning…"}
          {(status === "idle" || status === "done" || status === "error") &&
            "Run audit"}
        </button>
      </div>
    </div>
  );
}
