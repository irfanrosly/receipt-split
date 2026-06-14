"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function TopNav({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const showNewSession = pathname === "/dashboard" || pathname.startsWith("/sessions/");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-heading text-xl font-bold text-primary">
          <span aria-hidden="true">👑 </span>
          Cozy Crown
        </Link>

        <div className="flex items-center gap-2">
          {showNewSession && pathname !== "/sessions/new" && (
            <Link
              href="/sessions/new"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1 min-h-11")}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New session</span>
            </Link>
          )}
          <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[160px]">
            {email}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
