import { Card, CardContent } from "@fewtone/ui/components/card/card";
import { Marquee } from "@fewtone/ui/components/marquee/marquee";

const quotes = [
  { quote: "Setup took an afternoon, not a sprint.", name: "Maya Chen" },
  { quote: "It looked right in our theme on the first try.", name: "Tomás Rivera" },
  { quote: "The motion is quiet. Nothing shows off.", name: "Priya Nair" },
  { quote: "Keyboard support was already there.", name: "Jonas Berg" },
  { quote: "We deleted half our custom CSS.", name: "Ava Thompson" },
  { quote: "Dark mode just worked.", name: "Leo Park" },
];

function Quote({ quote, name }: { quote: string; name: string }) {
  return (
    <Card size="sm" asChild>
      <figure>
        <CardContent className="flex flex-col gap-3">
          <blockquote className="text-sm">“{quote}”</blockquote>
          <figcaption className="text-xs text-muted-foreground">{name}</figcaption>
        </CardContent>
      </figure>
    </Card>
  );
}

/*
 * Two columns of quotes, one travelling up and one down. A vertical marquee needs a height; the ends fade
 * top and bottom.
 */
export default function MarqueeVertical() {
  return (
    <div className="grid w-full max-w-md min-w-0 grid-cols-2 gap-4">
      {/* Room at the sides, so the cards' shadows aren't clipped */}
      <Marquee direction="up" speed={24} className="h-72 px-2">
        {quotes.map((item) => (
          <Quote key={item.name} {...item} />
        ))}
      </Marquee>
      <Marquee direction="down" speed={24} className="h-72 px-2">
        {[...quotes].reverse().map((item) => (
          <Quote key={item.name} {...item} />
        ))}
      </Marquee>
    </div>
  );
}
