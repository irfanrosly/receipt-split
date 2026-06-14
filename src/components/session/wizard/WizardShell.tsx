"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { hasWizardDraft, useWizardStore } from "@/stores/sessionWizardStore";
import { StepIndicator } from "./StepIndicator";
import { Step1Upload } from "./Step1Upload";
import { Step2Items } from "./Step2Items";
import { Step3People } from "./Step3People";
import { Step4Assign } from "./Step4Assign";
import { Step5Charges } from "./Step5Charges";

const STEP_LABELS = ["Upload", "Items", "People", "Assign", "Charges"];

export function WizardShell() {
  const step = useWizardStore((s) => s.step);
  const direction = useWizardStore((s) => s.direction);
  const hasDraft = useWizardStore((s) => hasWizardDraft(s));
  const reset = useWizardStore((s) => s.reset);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [checkedResume, setCheckedResume] = useState(false);

  useEffect(() => {
    if (checkedResume) return;
    const state = useWizardStore.getState();
    if (hasWizardDraft(state)) {
      setResumeOpen(true);
    }
    setCheckedResume(true);
  }, [checkedResume]);

  function handleDiscard() {
    reset();
    setDiscardOpen(false);
    toast.success("Draft discarded");
  }

  function handleStartFresh() {
    reset();
    setResumeOpen(false);
  }

  function handleContinueDraft() {
    setResumeOpen(false);
  }

  const motionClass =
    direction === "forward"
      ? "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300 motion-safe:slide-in-from-right-4"
      : "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300 motion-safe:slide-in-from-left-4";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <h1 className="font-heading text-2xl font-bold mb-4">New Session</h1>
          <StepIndicator current={step} total={STEP_LABELS.length} labels={STEP_LABELS} />
        </div>
        {hasDraft && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 text-muted-foreground"
            onClick={() => setDiscardOpen(true)}
          >
            <RotateCcw className="h-4 w-4" />
            Discard
          </Button>
        )}
      </div>

      <div key={step} className={cn(motionClass)}>
        {step === 1 && <Step1Upload />}
        {step === 2 && <Step2Items />}
        {step === 3 && <Step3People />}
        {step === 4 && <Step4Assign />}
        {step === 5 && <Step5Charges />}
      </div>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard this draft?</DialogTitle>
            <DialogDescription>
              Your progress will be cleared. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDiscardOpen(false)}>
              Keep editing
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              Discard draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resumeOpen} onOpenChange={setResumeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Continue your draft?</DialogTitle>
            <DialogDescription>
              You have an unfinished session from earlier. Continue where you left off or start fresh.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleStartFresh}>
              Start fresh
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleContinueDraft}>
              Continue draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
