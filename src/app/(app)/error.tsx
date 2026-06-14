"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error", error);
  }, [error]);

  return (
    <div className="space-y-4 text-center py-16">
      <p className="font-heading text-xl font-bold">Something went wrong</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        We hit an unexpected error. Try again or return to your sessions.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button onClick={reset}>Try again</Button>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
