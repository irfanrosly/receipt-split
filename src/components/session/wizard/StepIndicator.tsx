interface Props {
  current: number;
  total: number;
  labels: string[];
}

export function StepIndicator({ current, total, labels }: Props) {
  return (
    <div className="space-y-2">
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${current} of ${total}: ${labels[current - 1]}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i + 1 <= current ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Step {current} of {total} — {labels[current - 1]}
      </p>
    </div>
  );
}
