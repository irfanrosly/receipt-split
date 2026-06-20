"use client";

import { useState } from "react";
import { ImageIcon, X } from "lucide-react";

interface Props {
  receiptUrl: string | null;
}

export function ReceiptImage({ receiptUrl }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!receiptUrl) return null;

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ImageIcon className="h-4 w-4" />
        <span>{expanded ? "Hide receipt" : "View receipt"}</span>
      </button>
      {expanded && (
        <div className="relative rounded-xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={receiptUrl}
            alt="Receipt"
            className="w-full object-contain max-h-96"
          />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            aria-label="Close receipt preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
