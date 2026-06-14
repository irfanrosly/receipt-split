"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface ExtractedItem {
  name: string;
  quantity: number;
  unit_price: number;
}

interface Props {
  file: File;
  onDone: (items: ExtractedItem[]) => void;
  onError: (message: string) => void;
}

export function OcrProcessor({ file, onDone, onError }: Props) {
  const [status, setStatus] = useState("Uploading receipt...");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    runOcr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runOcr() {
    try {
      const fd = new FormData();
      fd.append("file", file);

      setStatus("Reading receipt with AI...");
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        onError(json.error ?? "Could not read the receipt. Try again or enter items manually.");
        return;
      }

      onDone(json.items);
    } catch (err) {
      console.error("OCR failed", err);
      onError("Could not read the receipt. Try again or enter items manually.");
    }
  }

  return (
    <div className="space-y-3 p-4 rounded-xl bg-muted">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
        <p className="text-sm font-medium">{status}</p>
      </div>
      <p className="text-xs text-muted-foreground">Analysing your receipt with AI…</p>
    </div>
  );
}
