"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Receipt, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatCurrency, PARTICIPANT_COLORS } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { deleteSession } from "@/lib/sessions/saveSessionFromWizard";
import { toast } from "sonner";
import type { Session } from "@/types/session";

interface Props {
  session: Session;
  participantCount: number;
  itemCount: number;
}

export function SessionCard({ session, participantCount, itemCount }: Props) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const date = new Date(session.created_at).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const visibleCount = Math.min(participantCount, 4);
  const overflowCount = participantCount > 4 ? participantCount - 4 : 0;

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await deleteSession(supabase, session.id, user.id);
      toast.success("Session deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete session");
    }
    setDeleting(false);
  }

  return (
    <>
      <Link href={`/sessions/${session.id}`} className="block">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{session.title}</h3>
                  <StatusBadge status={session.status} className="shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground">{date}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex -space-x-1.5" aria-hidden="true">
                    {Array.from({ length: visibleCount }).map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-card"
                        style={{ backgroundColor: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] }}
                      />
                    ))}
                    {overflowCount > 0 && (
                      <div className="w-5 h-5 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          +{overflowCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Receipt className="h-3 w-3" />
                    {itemCount} items
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <p className="font-bold text-xl text-primary">
                  {formatCurrency(session.total, session.currency)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                  aria-label={`Delete ${session.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this session?</DialogTitle>
            <DialogDescription>
              &ldquo;{session.title}&rdquo; and all its data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
