import sharp from "sharp";
import {
  GoogleGenerativeAI,
  SchemaType,
  type ObjectSchema,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const PROMPT = `You are a receipt parser. Extract every purchased line item from this receipt photo.

For each item, extract:
- name: the product name exactly as printed (strip dine-in/takeaway markers like "D" or "TA")
- quantity: number of units (default 1 if not shown)
- unit_price: price PER UNIT as a decimal number

Quantity/price rule: when a line shows "price*qty" (e.g. 1.40*3), "qty X price" (e.g. 1 X 2.70),
or "qty X price = total", the unit_price is the PER-UNIT price and quantity is the count — never put
the line total in unit_price. The integer-looking operand is the quantity; the 2-decimal operand is the
unit price. For weighed items (KG), quantity is the decimal weight and unit_price is the price per KG.

Combo/set meals: return ONLY the priced parent line. Ignore sub-component lines printed at 0.00.

NEVER include these as line items (exclude entirely):
- subtotal, total, nett, rounding adjustment
- tax / SST / GST / service charge
- discount / saving summary lines, member / points / loyalty lines
- change / cash / payment / approval code / RRN / card numbers
- barcodes, SKU or product codes (long numeric strings)
- store header/footer: SDN BHD, SSM registration no., address, table no., invoice/ticket no., cashier

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
const COMPRESS_MAX_DIM = 2048;
const COMPRESS_QUALITY = 85;

async function compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    let pipeline = sharp(buffer).rotate(); // auto-orient based on EXIF

    const metadata = await pipeline.metadata();
    if (metadata.width && metadata.height) {
      const longest = Math.max(metadata.width, metadata.height);
      if (longest > COMPRESS_MAX_DIM) {
        pipeline = pipeline.resize({
          width: metadata.width >= metadata.height ? COMPRESS_MAX_DIM : undefined,
          height: metadata.height > metadata.width ? COMPRESS_MAX_DIM : undefined,
          fit: "inside",
          withoutEnlargement: true,
        });
      }
    }

    if (mimeType === "image/png") {
      return pipeline.jpeg({ quality: COMPRESS_QUALITY }).toBuffer() as Promise<Buffer>;
    }

    return pipeline.jpeg({ quality: COMPRESS_QUALITY }).toBuffer() as Promise<Buffer>;
  } catch {
    return buffer;
  }
}

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
  const originalMime = file.type || "image/jpeg";
  const imageBuffer = await compressImage(Buffer.from(bytes), originalMime);
  const mimeType = "image/jpeg"; // always JPEG after compression
  const base64 = imageBuffer.toString("base64");

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

    // Drop invalid lines: empty names, and non-positive qty/price (also removes
    // any 0.00 combo sub-components the model still returns).
    const items = parsed.items.filter(
      (item) =>
        item.name.trim().length > 0 &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.unit_price) &&
        item.unit_price > 0
    );

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No line items found. Try a clearer photo or enter items manually." },
        { status: 422 }
      );
    }

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
