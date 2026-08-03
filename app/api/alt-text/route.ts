import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface AltTextRequestBody {
  images: { selector: string; srcHint: string; heuristicAlt: string }[];
  pageContext?: string;
}

/**
 * POST /api/alt-text
 *
 * Optional enrichment only. If OPENAI_API_KEY is not set, this route
 * returns 501 and the client silently falls back to the deterministic
 * heuristic in lib/altText.ts — AccessLens works fully without this route.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI alt-text is not configured on this deployment." },
      { status: 501 }
    );
  }

  let body: AltTextRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.images) || body.images.length === 0) {
    return NextResponse.json({ error: "No images provided." }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const prompt = `You are drafting DRAFT alt text for images on a webpage, for a human to review and edit before publishing. You cannot see the images — you only have their filename/src and surrounding page context. Do not invent specific visual details you cannot know. Keep each alt text under 120 characters, plain and literal, no "image of" prefix.

Page context: ${body.pageContext?.slice(0, 500) ?? "(none provided)"}

Images (respond with a JSON array of {selector, alt} in the same order, nothing else):
${body.images
  .map((img) => `- selector: ${img.selector}, src: ${img.srcHint}, current heuristic guess: "${img.heuristicAlt}"`)
  .join("\n")}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Upstream error: ${text}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let parsed: { selector: string; alt: string }[];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON." },
        { status: 502 }
      );
    }

    return NextResponse.json({ suggestions: parsed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
