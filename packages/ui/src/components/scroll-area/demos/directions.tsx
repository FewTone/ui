import { ScrollArea, ScrollBar } from "@fewtone/ui/components/scroll-area/scroll-area";
import { FileTextIcon } from "lucide-react";
import { Fragment } from "react";

const tags = Array.from({ length: 40 }, (_, index) => `v1.2.0-beta.${40 - index}`);

const files = [
  { name: "Q3 report.pdf", size: "2.4 MB" },
  { name: "Roadmap.fig", size: "18 MB" },
  { name: "Invoices.csv", size: "84 KB" },
  { name: "Brand guide.pdf", size: "9.1 MB" },
  { name: "Logo.svg", size: "6 KB" },
  { name: "Launch notes.md", size: "3 KB" },
  { name: "Pitch.key", size: "42 MB" },
];

/*
 * Both directions side by side, named underneath. Scroll either one and a soft fade appears at the edge you
 * left; point at it and the scrollbar shows, thickening under the pointer.
 */
export default function ScrollAreaDirections() {
  return (
    <ul className="flex flex-wrap items-end justify-center gap-x-10 gap-y-6">
      <li className="flex flex-col items-center gap-2">
        <ScrollArea aria-label="Tags" className="h-64 w-48 rounded-lg">
          <div className="p-4">
            <p className="mb-3 text-sm font-medium">Tags</p>
            {tags.map((tag, index) => (
              <Fragment key={tag}>
                {index > 0 ? <div aria-hidden className="my-2 h-px bg-border" /> : null}
                <p className="text-sm">{tag}</p>
              </Fragment>
            ))}
          </div>
        </ScrollArea>
        <span className="text-xs text-muted-foreground">Vertical</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <ScrollArea aria-label="Recent files" className="w-72 rounded-lg">
          <ul className="flex w-max gap-3 p-4">
            {files.map((file) => (
              <li key={file.name} className="flex w-32 flex-col gap-3 rounded-md bg-muted p-3">
                <FileTextIcon aria-hidden className="size-(--size-icon-lg) text-muted-foreground" />
                <span className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{file.size}</span>
                </span>
              </li>
            ))}
          </ul>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <span className="text-xs text-muted-foreground">Horizontal</span>
      </li>
    </ul>
  );
}
