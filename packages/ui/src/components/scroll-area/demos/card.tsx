import { ScrollArea } from "@fewtone/ui/components/scroll-area/scroll-area";

const tags = Array.from({ length: 20 }, (_, index) => `v1.2.0-beta.${20 - index}`);

/** The index card's preview: one short list, with the fade at its foot. The page itself opens on both directions. */
export default function ScrollAreaCard() {
  return (
    <ScrollArea aria-label="Tags" className="h-28 w-44 rounded-lg">
      <ul className="flex flex-col gap-2 p-3 text-sm">
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </ScrollArea>
  );
}
