import { Input } from "@fewtone/ui/components/input/input";

export default function InputSizes() {
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Input size="sm" placeholder="Small" aria-label="Small input" />
      <Input placeholder="Medium" aria-label="Medium input" />
      <Input size="lg" placeholder="Large" aria-label="Large input" />
    </div>
  );
}
