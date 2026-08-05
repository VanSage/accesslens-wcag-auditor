// Copies axe-core's minified UMD build into /public so the browser can fetch
// it same-origin at runtime. We then inline that source directly into the
// sandboxed audit iframe's srcdoc (see lib/buildAuditDocument.ts) — this
// lets axe-core execute *inside* the isolated frame without the frame ever
// making a network request of its own (the frame's CSP is default-src 'none').
const fs = require("fs");                   
const path = require("path");

const src = path.join(
  __dirname,
  "..",
  "node_modules",
  "axe-core",
  "axe.min.js"
);
const destDir = path.join(__dirname, "..", "public");
const dest = path.join(destDir, "axe-core.min.js");

try {
  if (!fs.existsSync(src)) {
    console.warn(
      "[copy-axe] axe-core/axe.min.js not found — did `npm install` run? Skipping copy."
    );
    process.exit(0);
  }
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("[copy-axe] copied axe-core.min.js -> public/axe-core.min.js");
} catch (err) {
  console.warn("[copy-axe] failed to copy axe-core:", err.message);
}
