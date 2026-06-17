"use client";

import { useState } from "react";
import { X, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWizardStore } from "@/stores/sessionWizardStore";
import { readableTextColor } from "@/lib/utils";
import type { SplitMode } from "@/types/session";
import { WizardNav } from "./WizardNav";

export function Step3People() {
  const { participants, addParticipant, removeParticipant, splitMode, setSplitMode, setStep } =
    useWizardStore();
  const [name, setName] = useState("");

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addParticipant(trimmed);
    setName("");
  }

  const canProceed = participants.length >= 1;

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Input
          placeholder="Person's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          autoComplete="off"
          className="h-11"
        />
        <Button onClick={handleAdd} disabled={!name.trim()} className="h-11">
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[44px]">
        {participants.map((p) => (
          <span
            key={p.id}
            className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: p.color, color: readableTextColor(p.color) }}
          >
            {p.name}
            <button
              type="button"
              onClick={() => removeParticipant(p.id)}
              className="hover:opacity-70 transition-opacity min-h-11 min-w-11 flex items-center justify-center -m-2"
              aria-label={`Remove ${p.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {participants.length === 0 && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="h-4 w-4" /> Add at least one person
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p id="split-mode-label" className="text-sm font-medium text-muted-foreground">
          How to split?
        </p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="split-mode-label">
          {(
            [
              { mode: "equal" as SplitMode, emoji: "⚖️", title: "Split equally", desc: "Everyone pays same" },
              { mode: "per_item" as SplitMode, emoji: "🍽️", title: "Per item", desc: "Assign who ate what" },
            ] as const
          ).map(({ mode, emoji, title, desc }) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={splitMode === mode}
              onClick={() => setSplitMode(mode)}
              className={`p-5 rounded-2xl border-2 text-center transition-all active:scale-95 min-h-[120px] ${
                splitMode === mode
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="text-3xl mb-2" aria-hidden="true">
                {emoji}
              </div>
              <p className="font-bold text-sm">{title}</p>
              <p
                className={`text-xs mt-0.5 ${splitMode === mode ? "opacity-75" : "text-muted-foreground"}`}
              >
                {desc}
              </p>
              {splitMode === mode && <CheckCircle2 className="h-4 w-4 mt-2 mx-auto" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>

      <WizardNav
        onBack={() => setStep(2)}
        onNext={() => setStep(splitMode === "per_item" ? 4 : 5)}
        nextDisabled={!canProceed}
      />
    </div>
  );
}
