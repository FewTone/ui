import { Marquee } from "@fewtone/ui/components/marquee/marquee";
import { cn } from "@fewtone/ui/lib/utils";

const logos = [
  { name: "Northwind", style: "font-semibold tracking-tight" },
  { name: "ATLAS", style: "font-semibold tracking-wide" },
  { name: "orbit", style: "font-mono font-medium" },
  { name: "Vertex", style: "font-bold tracking-tight" },
  { name: "Quill", style: "font-semibold italic tracking-tight" },
];

/** The index card's preview: one row of wordmarks. The page itself adds a row of cards going the other way. */
export default function MarqueeCard() {
  return (
    <Marquee gap={0} className="w-64">
      {logos.map((logo) => (
        <span key={logo.name} className={cn("px-4 text-sm text-muted-foreground", logo.style)}>
          {logo.name}
        </span>
      ))}
    </Marquee>
  );
}
