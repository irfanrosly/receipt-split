"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ParticipantAvatar } from "@/components/session/ParticipantAvatar";
import { formatCurrency } from "@/lib/utils";
import type { PersonSplit } from "@/types/session";

interface Props {
  split: PersonSplit;
}

export function PersonCard({ split }: Props) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const { participant, subtotal, service_charge, tax, total, items } = split;

  return (
    <Card>
      <CardContent className="p-0">
        <button
          type="button"
          className="w-full p-4 flex items-center justify-between gap-3"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={`${expanded ? "Hide" : "Show"} breakdown for ${participant.name}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <ParticipantAvatar name={participant.name} color={participant.color} />
            <span className="font-medium truncate">{participant.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
        </button>

        {expanded && (
          <div id={panelId} className="border-t px-4 pb-4 pt-3 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate pr-4">{item.name}</span>
                <span className="tabular-nums shrink-0">{formatCurrency(item.share)}</span>
              </div>
            ))}
            <div className="border-t pt-2 space-y-1.5 mt-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {service_charge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service charge</span>
                  <span className="tabular-nums">{formatCurrency(service_charge)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="tabular-nums">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-1.5">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
