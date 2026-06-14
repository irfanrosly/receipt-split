"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ParticipantAvatar } from "@/components/session/ParticipantAvatar";
import { useWizardStore } from "@/stores/sessionWizardStore";
import { computeSubtotal, computeTotals, calculateSplit } from "@/lib/split/calculator";
import { saveSessionFromWizard, uploadReceiptImage } from "@/lib/sessions/saveSessionFromWizard";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { WizardNav } from "./WizardNav";

function sliderValue(pct: number): number[] {
  return [pct];
}

function fromSlider(v: number | readonly number[]): number {
  return typeof v === "number" ? v : (v[0] ?? 0);
}

export function Step5Charges() {
  const router = useRouter();
  const {
    title,
    setTitle,
    items,
    participants,
    splitMode,
    assignments,
    charges,
    receiptFile,
    setCharges,
    setStep,
    reset,
  } = useWizardStore();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const subtotal = computeSubtotal(items);
  const { service, tax, grand } = computeTotals(subtotal, charges);
  const splits = showPreview
    ? calculateSplit(items, participants, charges, splitMode, assignments)
    : [];

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const sessionId = await saveSessionFromWizard(supabase, {
        userId: user.id,
        title: title.trim() || "Receipt",
        items,
        participants,
        splitMode,
        assignments,
        charges,
      });

      if (receiptFile) {
        const receiptUrl = await uploadReceiptImage(supabase, user.id, sessionId, receiptFile);
        if (receiptUrl) {
          await supabase.from("sessions").update({ receipt_url: receiptUrl }).eq("id", sessionId);
        }
      }

      reset();
      router.push(`/sessions/${sessionId}`);
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Failed to save session. Try again.");
      setSaving(false);
    }
  }

  const perPersonHint =
    splitMode === "equal"
      ? `~${formatCurrency(grand / (participants.length || 1))} each (equal split)`
      : "Amounts vary by assignment";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="session-title-final">Session name</Label>
        <Input
          id="session-title-final"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="service-slider">Service charge</Label>
            <span className="text-sm font-semibold tabular-nums">
              {charges.service_pct.toFixed(1)}%
            </span>
          </div>
          <Slider
            id="service-slider"
            min={0}
            max={20}
            step={0.5}
            value={sliderValue(charges.service_pct)}
            onValueChange={(v) => setCharges({ service_pct: fromSlider(v) })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>20%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="tax-slider">Tax / GST / SST</Label>
            <span className="text-sm font-semibold tabular-nums">{charges.tax_pct.toFixed(1)}%</span>
          </div>
          <Slider
            id="tax-slider"
            min={0}
            max={20}
            step={0.5}
            value={sliderValue(charges.tax_pct)}
            onValueChange={(v) => setCharges({ tax_pct: fromSlider(v) })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>20%</span>
          </div>
        </div>

        {charges.tax_pct > 0 && charges.service_pct > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tax calculated on</Label>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tax calculated on">
              {(["subtotal", "after_service"] as const).map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  variant={charges.tax_on === opt ? "default" : "outline"}
                  size="sm"
                  className="h-11 text-xs"
                  aria-pressed={charges.tax_on === opt}
                  onClick={() => setCharges({ tax_on: opt })}
                >
                  {opt === "subtotal" ? "Subtotal only" : "After service charge"}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {service > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service ({charges.service_pct}%)</span>
              <span>{formatCurrency(service)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({charges.tax_pct}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary text-lg">{formatCurrency(grand)}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {participants.length} {participants.length === 1 ? "person" : "people"} · {perPersonHint}
          </p>
        </CardContent>
      </Card>

      {participants.length > 0 && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-primary/40 text-primary"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "Hide" : "Preview"} per-person split
          </Button>
          {showPreview && (
            <div className="motion-safe:animate-in motion-safe:slide-in-from-top-2 motion-safe:fade-in-0 motion-safe:duration-200 space-y-2">
              {splits.map((ps) => (
                <div
                  key={ps.participant.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <ParticipantAvatar name={ps.participant.name} color={ps.participant.color} />
                  <span className="flex-1 text-sm font-medium">{ps.participant.name}</span>
                  <span className="font-bold text-primary">{formatCurrency(ps.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <WizardNav
        onBack={() => setStep(splitMode === "per_item" ? 4 : 3)}
        onNext={handleSave}
        nextLabel={saving ? "Saving..." : "Save & view summary"}
        backDisabled={saving}
        nextDisabled={saving}
      />
    </div>
  );
}
