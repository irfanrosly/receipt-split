import {
  GoogleGenerativeAI,
  SchemaType,
  type ObjectSchema,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const PROMPT = `You are a receipt parser. Extract every purchased line item from this receipt photo.

For each item, extract:
- name: the product name exactly as printed
- quantity: number of units (default 1 if not shown)
- unit_price: price per unit as a decimal number

If visible, also extract:
- merchant: the store/merchant name
- subtotal: the subtotal before tax
- total: the final total paid
- payment_method: e.g. VISA, cash, etc.

If no items can be identified, return an empty items array.`;

const schema = {
  description: "Parsed receipt data",
  type: SchemaType.OBJECT,
  properties: {
    items: {
      type: SchemaType.ARRAY,
      description: "Purchased line items",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: {
            type: SchemaType.STRING,
            description: "Product name exactly as printed on receipt",
          },
          quantity: {
            type: SchemaType.NUMBER,
            description: "Number of units purchased (default 1)",
          },
          unit_price: {
            type: SchemaType.NUMBER,
            description: "Price per unit as a decimal number",
          },
        },
        required: ["name", "quantity", "unit_price"],
      },
    },
    merchant: {
      type: SchemaType.STRING,
      description: "Store or merchant name from the receipt",
    },
    subtotal: {
      type: SchemaType.NUMBER,
      description: "Subtotal before tax/discount",
    },
    total: {
      type: SchemaType.NUMBER,
      description: "Final total amount paid",
    },
    payment_method: {
      type: SchemaType.STRING,
      description: "Payment method used (e.g. VISA, cash)",
    },
  },
  required: ["items"],
} as unknown as ObjectSchema;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface LineItem {
  name: string;
  quantity: number;
  unit_price: number;
}

interface OcrResponse {
  items: LineItem[];
  merchant?: string;
  subtotal?: number;
  total?: number;
  payment_method?: string;
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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const result = await model.generateContent([
      { text: PROMPT },
      { inlineData: { mimeType, data: base64 } },
    ]);

    const raw = result.response.text();
    const parsed: OcrResponse = JSON.parse(raw);

    if (!parsed.items || parsed.items.length === 0) {
      return NextResponse.json(
        { error: "No line items found. Try a clearer photo or enter items manually." },
        { status: 422 }
      );
    }

    // Strip any items with empty names (edge-case safety)
    const items = parsed.items.filter((item) => item.name.trim().length > 0);

    return NextResponse.json({
      items,
      ...(parsed.merchant && { merchant: parsed.merchant }),
      ...(parsed.subtotal !== undefined && { subtotal: parsed.subtotal }),
      ...(parsed.total !== undefined && { total: parsed.total }),
      ...(parsed.payment_method && { payment_method: parsed.payment_method }),
    });
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
