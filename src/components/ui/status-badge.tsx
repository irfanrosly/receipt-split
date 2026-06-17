import type { SessionStatus } from "@/types/session";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  status: SessionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const settled = status === "settled";

  return (
    <Badge
      variant={settled ? "default" : "secondary"}
      className={cn(
        settled
          ? "bg-success/15 text-success-foreground hover:bg-success/20"
          : "bg-warning/15 text-warning-foreground hover:bg-warning/20",
        className
      )}
    >
      {settled ? "Settled" : "Draft"}
    </Badge>
  );
}
