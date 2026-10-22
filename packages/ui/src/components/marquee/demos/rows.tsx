"use client";

import { Card, CardContent } from "@fewtone/ui/components/card/card";
import { Marquee } from "@fewtone/ui/components/marquee/marquee";
import { Switch } from "@fewtone/ui/components/switch/switch";
import { cn } from "@fewtone/ui/lib/utils";
import { useId, useState } from "react";

/** Wordmarks set in type, each with its own weight and spacing, the way real logos differ */
const logos = [
  { name: "Northwind", style: "font-semibold tracking-tight" },
  { name: "ATLAS", style: "font-semibold tracking-wide" },
  { name: "orbit", style: "font-mono font-medium" },
  { name: "Kite & Co", style: "font-semibold italic" },
  { name: "Vertex", style: "font-bold tracking-tight" },
  { name: "harbor", style: "font-medium" },
  { name: "Quill", style: "font-semibold italic tracking-tight" },
  { name: "LUMEN", style: "font-medium tracking-wide" },
];

const quotes = [
  { quote: "Setup took an afternoon, not a sprint.", name: "Maya Chen", role: "Design lead" },
  {
    quote: "It looked right in our theme on the first try.",
    name: "Tomás Rivera",
    role: "Frontend engineer",
  },
  { quote: "The motion is quiet. Nothing shows off.", name: "Priya Nair", role: "Product designer" },
  { quote: "Keyboard support was already there.", name: "Jonas Berg", role: "Accessibility consultant" },
  { quote: "We deleted half our custom CSS.", name: "Ava Thompson", role: "Founder" },
];

/*
 * A row of wordmarks travelling left and a row of small quote cards travelling right, named underneath. Hover a
 * row and it slows to a stop; Pause, at the top right, stops both the same way (a pause control for moving
 * content).
 */
export default function MarqueeRows() {
  const id = useId();
  const [paused, setPaused] = useState(false);

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-pause`} className="text-sm text-muted-foreground">
          Pause
        </label>
        <Switch id={`${id}-pause`} size="sm" checked={paused} onCheckedChange={setPaused} />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          {/* The items carry the space between them, so gap is 0 */}
          <Marquee paused={paused} gap={0} className="w-full">
            {logos.map((logo) => (
              <span key={logo.name} className={cn("px-6 text-base text-muted-foreground", logo.style)}>
                {logo.name}
              </span>
            ))}
          </Marquee>
          <span className="text-xs text-muted-foreground">Logos</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          {/* Room above and below, so the cards' shadows aren't clipped */}
          <Marquee paused={paused} direction="right" speed={30} className="w-full py-2">
            {quotes.map((item) => (
              <Card key={item.name} size="sm" className="w-64" asChild>
                <figure>
                  <CardContent className="flex flex-col gap-3">
                    <blockquote className="text-sm">“{item.quote}”</blockquote>
                    <figcaption className="text-xs">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground"> · {item.role}</span>
                    </figcaption>
                  </CardContent>
                </figure>
              </Card>
            ))}
          </Marquee>
          <span className="text-xs text-muted-foreground">Cards, the other way</span>
        </div>
      </div>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
