import { Example } from "@fewtone/ui/components/example/example";

export default function ExampleVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Example>Continue</Example>
      <Example variant="outline">Cancel</Example>
    </div>
  );
}
