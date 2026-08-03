"use client";

import { useCallback, useRef, useState } from "react";
import { buildAuditDocument } from "./buildAuditDocument";
import { buildHeuristicSuggestions } from "./altText";
import { scorePage } from "./score";
import type { AuditRun, AxeRunResults } from "./types";

type AuditStatus = "idle" | "loading-axe" | "running" | "done" | "error";

let cachedAxeSource: string | null = null;

async function getAxeSource(): Promise<string> {
  if (cachedAxeSource) return cachedAxeSource;
  const res = await fetch("/axe-core.min.js");
  if (!res.ok) {
    throw new Error(
      `Could not load axe-core.min.js (status ${res.status}). Did the postinstall script run?`
    );
  }
  cachedAxeSource = await res.text();
  return cachedAxeSource;
}

export function useAudit() {
  const [status, setStatus] = useState<AuditStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [run, setRun] = useState<AuditRun | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const runAudit = useCallback(async (html: string) => {
    cleanupRef.current?.();
    setStatus("loading-axe");
    setErrorMessage(null);
    setRun(null);

    let axeSource: string;
    try {
      axeSource = await getAxeSource();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : String(err));
      return;
    }

    setStatus("running");

    const doc = buildAuditDocument({
      userHtml: html,
      axeSource,
      runnerOrigin: window.location.origin,
    });

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute("title", "AccessLens audit sandbox");
    iframe.style.position = "fixed";
    iframe.style.width = "1280px";
    iframe.style.height = "1024px";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.border = "0";
    iframe.srcdoc = doc;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.source !== "accesslens-audit") return;

      if (event.data.type === "results") {
        const results = event.data.payload as AxeRunResults;
        const altTextSuggestions = buildHeuristicSuggestions(html);
        const auditRun: AuditRun = {
          id: `run-${Date.now()}`,
          ranAt: new Date().toISOString(),
          score: scorePage(results.violations),
          violations: results.violations,
          incomplete: results.incomplete,
          altTextSuggestions,
        };
        setRun(auditRun);
        setStatus("done");
        cleanup();
      } else if (event.data.type === "error" || event.data.type === "timeout") {
        setErrorMessage(event.data.payload?.message ?? "Audit failed.");
        setStatus("error");
        cleanup();
      }
    };

    function cleanup() {
      window.removeEventListener("message", handleMessage);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }
    cleanupRef.current = cleanup;

    window.addEventListener("message", handleMessage);
    document.body.appendChild(iframe);
    iframeRef.current = iframe;
  }, []);

  return { status, errorMessage, run, runAudit };
}
