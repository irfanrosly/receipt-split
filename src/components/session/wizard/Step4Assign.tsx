"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWizardStore } from "@/stores/sessionWizardStore";
import { formatCurrency, readableTextColor } from "@/lib/utils";
import { WizardNav } from "./WizardNav";

export function Step4Assign() {
  const { items, participants, assignments, setAssignment, setStep } = useWizardStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const assignedCount = items.filter((i) => (assignments[i.id] ?? []).length > 0).length;
  const unassignedCount = items.length - assignedCount;
  const allAssigned = items.length > 0 && assignedCount === items.length;

  function toggleAssignee(itemId: string, participantId: string) {
    const current = assignments[itemId] ?? [];
    const next = current.includes(participantId)
      ? current.filter((id) => id !== participantId)
      : [...current, participantId];
    setAssignment(itemId, next);
  }

  function assignAll(itemId: string) {
    setAssignment(
      itemId,
      participants.map((p) => p.id)
    );
  }

  function handleNext() {
    if (unassignedCount > 0) {
      setConfirmOpen(true);
      return;
    }
    setStep(5);
  }

  function confirmNext() {
    setConfirmOpen(false);
    setStep(5);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Tap names to assign each item. Unassigned items split equally.
          </p>
          <span
            className={`font-medium tabular-nums shrink-0 ml-3 ${allAssigned ? "text-success-foreground" : "text-muted-foreground"}`}
          >
            {assignedCount}/{items.length}
            {allAssigned ? " ✓" : ""}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={assignedCount}
          aria-valuemin={0}
          aria-valuemax={items.length || 1}
          aria-label="Assignment progress"
        >
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${items.length ? (assignedCount / items.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const assigned = assignments[item.id] ?? [];
          const isUnassigned = assigned.length === 0;
          return (
            <Card key={item.id}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {participants.map((p) => {
                    const isSelected = assigned.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleAssignee(item.id, p.id)}
                        className={`motion-safe:animate-pop px-2.5 py-1.5 min-h-11 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "border-transparent"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: p.color,
                                borderColor: p.color,
                                color: readableTextColor(p.color),
                              }
                            : {}
                        }
                      >
                        {p.name}
                      </button>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full border-dashed h-11"
                    onClick={() => assignAll(item.id)}
                  >
                    Everyone
                  </Button>
                </div>

                {isUnassigned && (
                  <p className="text-xs text-warning-foreground">Will split equally among all</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <WizardNav onBack={() => setStep(3)} onNext={handleNext} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassigned items</DialogTitle>
            <DialogDescription>
              {unassignedCount} item{unassignedCount === 1 ? "" : "s"} will be split equally among
              everyone. Continue anyway?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Go back
            </Button>
            <Button
              onClick={() => {
                confirmNext();
                toast.message("Unassigned items will split equally");
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
