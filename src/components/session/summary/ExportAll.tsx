"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExportCard, type CardPayment } from "./ExportCard";
import { captureElement, captureToBlob } from "@/lib/export/captureElement";
import type { PersonSplit } from "@/types/session";

interface Props {
  splits: PersonSplit[];
  sessionTitle: string;
  payment: CardPayment | null;
  qrUrl: string | null;
}

const formatMYR = (n: number) =>
  new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(n);

export function ExportAll({ splits, sessionTitle, payment, qrUrl }: Props) {
  const [exporting, setExporting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Preload QR as a data URL — avoids cross-origin canvas taint during capture.
  useEffect(() => {
    if (!qrUrl) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(qrUrl);
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch (err) {
        console.error("QR preload failed", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [qrUrl]);

  const fileName = (idx: number) =>
    `cozy-crown-${splits[idx].participant.name.replace(/\s+/g, "-").toLowerCase()}.png`;

  function payToLine(): string | null {
    if (payment && (payment.name || payment.bank || payment.account)) {
      const parts = [payment.name, payment.bank, payment.account].filter(Boolean).join(" — ");
      return `Pay to: ${parts}`;
    }
    return null;
  }

  function whatsappMessage(split: PersonSplit): string {
    const lines = [
      `Hi ${split.participant.name}, your share for "${sessionTitle}" is ${formatMYR(split.total)}.`,
    ];
    const pay = payToLine();
    if (pay) lines.push(pay);
    lines.push("👑 Cozy Crown");
    return lines.join("\n");
  }

  function groupMessage(): string {
    const lines = [`*${sessionTitle}* — bill split`, ""];
    for (const s of splits) {
      lines.push(`${s.participant.name}: ${formatMYR(s.total)}`);
    }
    const pay = payToLine();
    if (pay) {
      lines.push("");
      lines.push(pay);
    }
    lines.push("👑 Cozy Crown");
    return lines.join("\n");
  }

  function handleGroupShare() {
    const url = `https://wa.me/?text=${encodeURIComponent(groupMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleExportAll() {
    setExporting(true);
    try {
      for (let i = 0; i < splits.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        await captureElement(el, fileName(i));
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

  async function handleDownloadOne(idx: number) {
    const el = cardRefs.current[idx];
    if (!el) return;
    try {
      await captureElement(el, fileName(idx));
    } catch {
      toast.error("Export failed");
    }
  }

  async function handleShareImage(idx: number) {
    const el = cardRefs.current[idx];
    if (!el) return;
    try {
      const blob = await captureToBlob(el);
      const file = new File([blob], fileName(idx), { type: "image/png" });
      const text = whatsappMessage(splits[idx]);

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: sessionTitle,
          text,
        });
      } else {
        await captureElement(el, fileName(idx));
        toast.success("Image saved — attach it in WhatsApp");
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return; // user dismissed share sheet
      console.error("Share failed", err);
      toast.error("Share failed. Try again.");
    }
  }

  function handleWhatsappText(idx: number) {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappMessage(splits[idx]))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleGroupShare} className="w-full gap-2">
        <Users className="h-4 w-4" />
        Share summary to group
      </Button>

      <Button
        onClick={handleExportAll}
        disabled={exporting}
        variant="outline"
        className="w-full gap-2"
      >
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
            payment={payment}
            qrDataUrl={qrDataUrl}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>

      {/* Per-person actions */}
      <div className="space-y-2">
        {splits.map((split, i) => (
          <div
            key={split.participant.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
          >
            <div
              className="w-5 h-5 rounded-full shrink-0"
              style={{ backgroundColor: split.participant.color }}
            />
            <span className="truncate text-sm flex-1">{split.participant.name}</span>
            <button
              onClick={() => handleWhatsappText(i)}
              aria-label={`WhatsApp text to ${split.participant.name}`}
              title="WhatsApp text"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleShareImage(i)}
              aria-label={`Share card image for ${split.participant.name}`}
              title="Share image"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDownloadOne(i)}
              aria-label={`Download card image for ${split.participant.name}`}
              title="Download PNG"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
