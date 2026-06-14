import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SessionList } from "@/components/dashboard/SessionList";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*, participants(count), items(count)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Dashboard query failed", error);
    return (
      <div className="space-y-4 text-center py-12">
        <p className="font-semibold">Could not load sessions</p>
        <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
          Retry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Your Sessions</h1>
        <Link href="/sessions/new" className={cn(buttonVariants(), "gap-1.5 min-h-11")}>
          <Plus className="h-4 w-4" />
          New session
        </Link>
      </div>

      {sessions && sessions.length > 0 ? (
        <SessionList sessions={sessions} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
