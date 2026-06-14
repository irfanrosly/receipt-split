import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
}

export function WizardNav({
  onBack,
  onNext,
  nextLabel = "Next",
  backDisabled,
  nextDisabled,
}: Props) {
  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={onBack} className="flex-1 min-h-11" disabled={backDisabled}>
        Back
      </Button>
      <Button onClick={onNext} className="flex-1 min-h-11" disabled={nextDisabled}>
        {nextLabel}
      </Button>
    </div>
  );
}
