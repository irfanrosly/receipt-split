import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center space-y-4">
        <p className="text-4xl motion-safe:animate-float" aria-hidden="true">
          🧾
        </p>
        <div className="space-y-1">
          <p className="font-semibold">No sessions yet</p>
          <p className="text-sm text-muted-foreground">
            Start your first bill split in a few steps
          </p>
        </div>
        <Link href="/sessions/new" className={cn(buttonVariants(), "min-h-11")}>
          New session
        </Link>
      </CardContent>
    </Card>
  );
}
