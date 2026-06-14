"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExportCard } from "./ExportCard";
import { captureElement } from "@/lib/export/captureElement";
import type { PersonSplit } from "@/types/session";

interface Props {
  splits: PersonSplit[];
  sessionTitle: string;
}

export function ExportAll({ splits, sessionTitle }: Props) {
  const [exporting, setExporting] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  async function handleExportAll() {
    setExporting(true);
    try {
      for (let i = 0; i < splits.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const name = splits[i].participant.name.replace(/\s+/g, "-").toLowerCase();
        await captureElement(el, `cozy-crown-${name}.png`);
        // Small delay between downloads to avoid browser blocking
        await new Promise((r) => setTimeout(r, 200));
      }
      toast.success(`${splits.length} PNG${splits.length > 1 ? "s" : ""} downloaded`);
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Export failed. Try again.");
    }
    setExporting(false);
  }

  async function handleExportOne(idx: number) {
    const el = cardRefs.current[idx];
    if (!el) return;
    const name = splits[idx].participant.name.replace(/\s+/g, "-").toLowerCase();
    try {
      await captureElement(el, `cozy-crown-${name}.png`);
    } catch {
      toast.error("Export failed");
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleExportAll} disabled={exporting} className="w-full gap-2">
        <Download className="h-4 w-4" />
        {exporting ? "Exporting..." : `Export all (${splits.length})`}
      </Button>

      {/* Off-screen cards — positioned outside viewport but still in DOM for capture */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
        aria-hidden="true"
      >
        {splits.map((split, i) => (
          <ExportCard
            key={split.participant.id}
            split={split}
            sessionTitle={sessionTitle}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>

      {/* Per-person export buttons */}
      <div className="grid grid-cols-2 gap-2">
        {splits.map((split, i) => (
          <button
            key={split.participant.id}
            onClick={() => handleExportOne(i)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <div
              className="w-5 h-5 rounded-full shrink-0"
              style={{ backgroundColor: split.participant.color }}
            />
            <span className="truncate">{split.participant.name}</span>
            <Download className="h-3.5 w-3.5 ml-auto shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
