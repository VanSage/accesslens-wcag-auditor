/**
 * AccessLens audit sandbox.
 *
 * Why this shape:
 * - The iframe uses sandbox="allow-scripts" and NOT "allow-same-origin".
 *   That gives the frame an opaque (null) origin, which means the parent
 *   window can never reach into it via contentWindow/contentDocument —
 *   this is the whole point: arbitrary pasted markup runs fully isolated.
 * - Because the origin is opaque, the only safe channel back to the parent
 *   is postMessage, which works regardless of origin.
 * - The frame's own CSP is `default-src 'none'; script-src 'unsafe-inline'`
 *   so it cannot fetch anything over the network, load external scripts,
 *   or exfiltrate data — it can only run the inline script we embedded and
 *   postMessage its findings back.
 * - axe-core itself is never fetched by the frame. The PARENT page fetches
 *   /axe-core.min.js (same-origin, ordinary request) and this function
 *   inlines that source text directly into the document we hand the frame.
 */

export interface BuildAuditDocumentOptions {
  userHtml: string;
  axeSource: string;
  runnerOrigin: string; // window.location.origin of the parent, for postMessage targeting
}

export function buildAuditDocument({
  userHtml,
  axeSource,
}: BuildAuditDocumentOptions): string {
  // Strip any <script>-closing sequences an attacker might use to break out
  // of our inline <script> blocks below.
  const safeAxeSource = axeSource.replace(/<\/script/gi, "<\\/script");

  const runnerScript = `
    (function () {
      function post(type, payload) {
        try {
          window.parent.postMessage({ source: "accesslens-audit", type: type, payload: payload }, "*");
        } catch (e) { /* isolated frame — nothing else we can do */ }
      }

      function run() {
        if (typeof window.axe === "undefined") {
          post("error", { message: "axe-core failed to initialize inside the sandbox." });
          return;
        }
        window.axe
          .run(document, {
            resultTypes: ["violations", "incomplete"],
          })
          .then(function (results) {
            post("results", {
              violations: results.violations,
              incomplete: results.incomplete,
              url: results.url,
              timestamp: results.timestamp,
            });
          })
          .catch(function (err) {
            post("error", { message: String((err && err.message) || err) });
          });
      }

      if (document.readyState === "complete") {
        run();
      } else {
        window.addEventListener("load", run);
      }

      // Watchdog: pasted markup could contain something that hangs the frame.
      setTimeout(function () {
        post("timeout", { message: "Audit did not complete within 8s." });
      }, 8000);
    })();
  `;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:;" />
<title>AccessLens sandbox</title>
</head>
<body>
${userHtml}
<script>${safeAxeSource}</script>
<script>${runnerScript}</script>
</body>
</html>`;
}
