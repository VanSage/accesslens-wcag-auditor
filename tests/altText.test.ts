import { describe, expect, it } from "vitest";
import {
  draftAltTextFromFilename,
  findMissingAltImages,
  buildHeuristicSuggestions,
} from "@/lib/altText";

describe("draftAltTextFromFilename", () => {
  it("turns hyphens and underscores into spaces, title-cased", () => {
    expect(draftAltTextFromFilename("hero-banner-spring-menu.jpg")).toBe(
      "Hero banner spring menu"
    );
    expect(draftAltTextFromFilename("staff_photo_2.png")).toBe(
      "Staff photo 2"
    );
  });

  it("splits camelCase", () => {
    expect(draftAltTextFromFilename("teamPhoto.jpg")).toBe("Team photo");
  });

  it("strips query strings and paths", () => {
    expect(draftAltTextFromFilename("/assets/img/logo-final.svg?v=2")).toBe(
      "Logo final"
    );
  });

  it("returns empty string only when the whole name is purely numeric", () => {
    // "IMG_00234" still contains letters once underscores become spaces,
    // so it's a usable (if weak) draft rather than a true empty case.
    expect(draftAltTextFromFilename("IMG_00234.jpg")).toBe("Img 00234");
    expect(draftAltTextFromFilename("12345.png")).toBe("");
  });
});

describe("findMissingAltImages", () => {
  it("flags img tags with no alt attribute", () => {
    const html = `<div><img src="a.jpg"><img src="b.jpg" alt="B"><img src="c.jpg" role="presentation"></div>`;
    const missing = findMissingAltImages(html);
    expect(missing).toHaveLength(1);
    expect(missing[0]?.src).toBe("a.jpg");
  });

  it("does not flag decorative images marked role=presentation", () => {
    const html = `<img src="decor.png" role="presentation">`;
    expect(findMissingAltImages(html)).toHaveLength(0);
  });

  it("does not flag images that already have an empty alt (intentionally decorative)", () => {
    const html = `<img src="decor.png" alt="">`;
    expect(findMissingAltImages(html)).toHaveLength(0);
  });
});

describe("buildHeuristicSuggestions", () => {
  it("produces a suggestion per missing-alt image, sourced as heuristic", () => {
    const html = `<img src="hero-banner.jpg"><img src="ok.jpg" alt="fine">`;
    const suggestions = buildHeuristicSuggestions(html);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.source).toBe("heuristic");
    expect(suggestions[0]?.suggestedAlt).toBe("Hero banner");
  });

  it("still drafts a best-effort guess for weak filenames", () => {
    const html = `<img src="IMG_00234.jpg">`;
    const suggestions = buildHeuristicSuggestions(html);
    expect(suggestions[0]?.suggestedAlt).toBe("Img 00234");
  });

  it("falls back to a generic prompt when the filename is fully numeric", () => {
    const html = `<img src="12345.png">`;
    const suggestions = buildHeuristicSuggestions(html);
    expect(suggestions[0]?.suggestedAlt).toBe("Describe what this image shows");
  });
});
