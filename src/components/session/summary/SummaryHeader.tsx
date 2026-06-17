"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { loadSessionForSplit } from "@/lib/sessions/saveSessionFromWizard";
import { useWizardStore } from "@/stores/sessionWizardStore";
import { toast } from "sonner";
import type { Session } from "@/types/database";
import type { Database } from "@/types/database";

type SessionUpdate = Database["public"]["Tables"]["sessions"]["Update"];

interface Props {
  session: Session;
}

export function SummaryHeader({ session }: Props) {
  const router = useRouter();
  const hydrateFromSession = useWizardStore((s) => s.hydrateFromSession);
  const [status, setStatus] = useState<"draft" | "settled">(session.status);
  const [settling, setSettling] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const isSettled = status === "settled";

  async function handleSettle() {
    setSettling(true);
    const supabase = createClient();
    const patch: SessionUpdate = { status: "settled" };
    const { error } = await supabase.from("sessions").update(patch).eq("id", session.id);
    if (error) {
      toast.error("Failed to settle session");
    } else {
      setStatus("settled");
      setSettleOpen(false);
      toast.success("Session settled! Editing is now locked.");
    }
    setSettling(false);
  }

  async function handleEdit() {
    setEditing(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const data = await loadSessionForSplit(supabase, session.id, user.id);
      if (!data) throw new Error("Session not found");

      hydrateFromSession({
        title: data.session.title,
        items: data.items,
        participants: data.participants,
        splitMode: data.splitMode,
        assignments: data.assignments,
        charges: data.charges,
      });

      router.push("/sessions/new");
    } catch (err) {
      console.error("Edit failed", err);
      toast.error("Could not load session for editing");
    }
    setEditing(false);
  }

  return (
    <div className="space-y-3">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        All sessions
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">{session.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date(session.created_at).toLocaleDateString("en-MY", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {isSettled && (
            <p className="text-xs text-muted-foreground mt-1">This session is locked after settling.</p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Grand total</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(session.total)}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {!isSettled && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 min-h-11"
                onClick={handleEdit}
                disabled={editing}
              >
                <Pencil className="h-4 w-4" />
                {editing ? "Loading..." : "Edit"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 min-h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => setSettleOpen(true)}
                disabled={settling}
              >
                <CheckCircle2 className="h-4 w-4" />
                Settle
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle this session?</DialogTitle>
            <DialogDescription>
              Settling locks the session from further edits. You can still view splits and export cards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSettleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSettle} disabled={settling}>
              {settling ? "Settling..." : "Settle session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
