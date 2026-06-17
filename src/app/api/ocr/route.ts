import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const PROMPT = `You are a receipt parser. Extract every purchased line item.
Return ONLY a JSON array, no markdown, no extra text:
[{"name":"Item","quantity":1,"unit_price":12.50}]
- Exclude totals, taxes, service charges, discounts, headers
- quantity: number, default 1 if not shown
- unit_price: price per unit as decimal number
- If no items found, return []`;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface RawItem {
  name: unknown;
  quantity: unknown;
  unit_price: unknown;
}

function isValidItem(item: unknown): item is RawItem {
  if (!item || typeof item !== "object") return false;
  const o = item as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    o.name.trim().length > 0 &&
    typeof o.quantity === "number" &&
    o.quantity > 0 &&
    typeof o.unit_price === "number" &&
    o.unit_price >= 0
  );
}

function parseGeminiResponse(raw: string) {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isValidItem).map((item) => ({
    name: String(item.name).trim(),
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
  }));
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json({ error: "OCR service is not configured." }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image too large. Maximum size is 5 MB." }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = (file.type || "image/jpeg") as "image/jpeg";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { text: PROMPT },
      { inlineData: { mimeType, data: base64 } },
    ]);

    const raw = result.response.text();
    const items = parseGeminiResponse(raw);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No line items found. Try a clearer photo or enter items manually." },
        { status: 422 }
      );
    }

    return NextResponse.json({ items });
  } catch (err) {
    const isParseError = err instanceof SyntaxError;
    if (isParseError) {
      return NextResponse.json(
        { error: "Could not parse receipt. Try a clearer photo or enter items manually." },
        { status: 422 }
      );
    }
    console.error("Gemini OCR error", err);
    return NextResponse.json(
      { error: "Could not reach the OCR service. Try again." },
      { status: 502 }
    );
  }
}
