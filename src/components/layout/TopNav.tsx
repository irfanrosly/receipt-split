"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Moon, Plus, Sun } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function TopNav({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
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
          <span aria-hidden="true">✂️ </span>
          SplitLah
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
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
