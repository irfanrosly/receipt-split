// Presentational phone-frame wrapper for landing screenshots.
// Plain <img> (no next/image config surprises). Until real PNGs land in
// public/screenshots/, the muted background + bezel keep the layout intact.

import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt: string;
  className?: string;
}

export function PhoneFrame({ src, alt, className }: Props) {
  return (
    <div
      className={cn(
        "relative aspect-[9/19.5] w-full overflow-hidden rounded-[2rem] border-4 border-foreground/10 bg-muted shadow-sm",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}
