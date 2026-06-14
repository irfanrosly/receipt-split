"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWizardStore } from "@/stores/sessionWizardStore";
import { computeSubtotal } from "@/lib/split/calculator";
import { formatCurrency } from "@/lib/utils";
import { WizardNav } from "./WizardNav";

export function Step2Items() {
  const { items, addItem, updateItem, removeItem, setStep } = useWizardStore();

  const subtotal = computeSubtotal(items);
  const canProceed = items.length > 0 && items.every((i) => i.name.trim() && i.unit_price > 0);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:fade-in-0 motion-safe:duration-200 rounded-xl border border-border bg-card p-3 space-y-2"
            style={{ animationDelay: `${Math.min(idx, 7) * 50}ms`, animationFillMode: "backwards" }}
          >
            <div className="flex items-center gap-2">
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                className="flex-1 border-0 shadow-none px-0 font-medium h-11"
                aria-label="Item name"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive/50 hover:text-destructive shrink-0 h-11 w-11"
                onClick={() => removeItem(item.id)}
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => updateItem(item.id, { quantity: Math.max(0.5, item.quantity - 0.5) })}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center text-sm font-medium tabular-nums">
                  {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => updateItem(item.id, { quantity: item.quantity + 0.5 })}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">×</span>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Unit price"
                value={item.unit_price || ""}
                min="0"
                step="0.01"
                onChange={(e) => updateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                className="flex-1 h-11"
                aria-label="Unit price"
              />
              <span className="text-sm font-semibold text-primary w-16 text-right shrink-0">
                {formatCurrency(item.quantity * item.unit_price)}
              </span>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed h-11"
          onClick={addItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add item
        </Button>
      </div>

      {!canProceed && (
        <p className="text-sm text-muted-foreground">
          Add at least one item with a name and price to continue.
        </p>
      )}

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
        <span className="font-medium">Subtotal</span>
        <span className="font-bold text-lg">{formatCurrency(subtotal)}</span>
      </div>

      <WizardNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!canProceed} />
    </div>
  );
}
