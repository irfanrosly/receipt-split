import { cn, readableTextColor } from "@/lib/utils";

interface Props {
  name: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

export function ParticipantAvatar({ name, color, size = "md", className }: Props) {
  const sizeClass = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0",
        sizeClass,
        className
      )}
      style={{ backgroundColor: color, color: readableTextColor(color) }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
