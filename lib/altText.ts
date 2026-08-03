import type { AltTextSuggestion } from "./types";

/**
 * Deterministic, keyless alt-text drafting.
 *
 * We never invent claims about image *content* we can't see — we only
 * clean up what's already implied by the filename/context, e.g.
 * "team-photo-2024-final.jpg" -> "team photo 2024 final".
 * This is intentionally modest: it's a starting draft, always editable,
 * and — when AI mode is on — clearly labelled "AI-suggested — verify".
 */
export function draftAltTextFromFilename(src: string): string {
  const withoutQuery = src.split("?")[0] ?? src;
  const filename = withoutQuery.split("/").pop() ?? withoutQuery;
  const withoutExt = filename.replace(/\.[a-zA-Z0-9]+$/, "");
  const words = withoutExt
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  if (!words || /^\d+$/.test(words)) {
    return "";
  }
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}

export interface MissingAltImage {
  selector: string;
  outerHTML: string;
  src: string;
}

export function findMissingAltImages(html: string): MissingAltImage[] {
  if (typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const imgs = Array.from(doc.querySelectorAll("img"));
  const missing: MissingAltImage[] = [];
  imgs.forEach((img, index) => {
    const hasAlt = img.hasAttribute("alt");
    const isDecorativeRole = img.getAttribute("role") === "presentation";
    if (!hasAlt && !isDecorativeRole) {
      missing.push({
        selector: `img:nth-of-type(${index + 1})`,
        outerHTML: img.outerHTML,
        src: img.getAttribute("src") ?? "",
      });
    }
  });
  return missing;
}

export function buildHeuristicSuggestions(html: string): AltTextSuggestion[] {
  return findMissingAltImages(html).map((img) => ({
    selector: img.selector,
    imgSnippet: img.outerHTML,
    srcHint: img.src,
    suggestedAlt:
      draftAltTextFromFilename(img.src) || "Describe what this image shows",
    source: "heuristic",
  }));
}
