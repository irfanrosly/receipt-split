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
        settled ? "bg-success text-white hover:bg-success/90" : "bg-warning/15 text-warning hover:bg-warning/20",
        className
      )}
    >
      {settled ? "Settled" : "Draft"}
    </Badge>
  );
}
