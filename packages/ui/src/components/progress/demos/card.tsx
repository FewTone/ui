import { Progress, ProgressRing } from "@fewtone/ui/components/progress/progress";

/** The index card's preview: a bar and a ring at the same value. The page itself names them and steps them. */
export default function ProgressCard() {
  return (
    <div className="flex w-56 items-center gap-6">
      <Progress value={64} aria-label="Upload" />
      <ProgressRing value={64} size="lg" showValue aria-label="Upload" />
    </div>
  );
}
