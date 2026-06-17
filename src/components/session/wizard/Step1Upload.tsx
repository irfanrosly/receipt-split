"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { v4 as uuid } from "uuid";
import { Camera, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/stores/sessionWizardStore";

const OcrProcessor = dynamic(
  () => import("@/components/ocr/OcrProcessor").then((m) => m.OcrProcessor),
  { ssr: false }
);

export function Step1Upload() {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const {
    receiptImageBlob,
    title,
    setReceiptImage,
    setReceiptFile,
    setTitle,
    setItems,
    setStep,
  } = useWizardStore();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (receiptImageBlob) URL.revokeObjectURL(receiptImageBlob);
    const url = URL.createObjectURL(picked);
    setReceiptImage(url);
    setReceiptFile(picked);
    setFile(picked);
    setOcrError(null);
  }

  function handleOcrDone(items: Array<{ name: string; quantity: number; unit_price: number }>) {
    setItems(items.map((item) => ({ ...item, id: uuid() })));
    setStep(2);
    setProcessing(false);
    setOcrError(null);
    if (items.length > 0) {
      toast.success(`Found ${items.length} item${items.length === 1 ? "" : "s"}`);
    }
  }

  function handleOcrError(message: string) {
    setOcrError(message);
    setProcessing(false);
    toast.error(message);
  }

  function retryOcr() {
    setOcrError(null);
    setProcessing(true);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="session-title">Session name</Label>
        <Input
          id="session-title"
          placeholder="e.g. Dinner with friends"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11"
        />
      </div>

      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {!receiptImageBlob ? (
        <div className="motion-safe:animate-shimmer-border rounded-2xl border-2 p-8 bg-primary/5 flex flex-col items-center gap-6">
          <p className="text-4xl" aria-hidden="true">
            🧾
          </p>
          <p className="font-heading font-bold text-xl text-center">Upload your receipt</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 rounded-xl"
              onClick={() => cameraRef.current?.click()}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Camera</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 rounded-xl"
              onClick={() => galleryRef.current?.click()}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Gallery</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receiptImageBlob} alt="Receipt preview" className="w-full object-contain max-h-80" />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => galleryRef.current?.click()}
            >
              Change image
            </Button>
            {file && !processing && (
              <Button type="button" className="flex-1" onClick={() => setProcessing(true)}>
                Read receipt
              </Button>
            )}
          </div>
        </div>
      )}

      {ocrError && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 space-y-2">
          <p className="text-sm text-warning-foreground">{ocrError}</p>
          {file && (
            <Button type="button" variant="outline" size="sm" onClick={retryOcr}>
              Try again
            </Button>
          )}
        </div>
      )}

      {processing && file && (
        <OcrProcessor file={file} onDone={handleOcrDone} onError={handleOcrError} />
      )}

      <Button
        type="button"
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={() => {
          setItems([]);
          setStep(2);
        }}
      >
        Skip — enter items manually
      </Button>
    </div>
  );
}
