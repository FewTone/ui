import { Button } from "@fewtone/ui/components/button/button";

export default function ButtonDefault() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button>Continue</Button>
      <Button variant="outline">Cancel</Button>
    </div>
  );
}
