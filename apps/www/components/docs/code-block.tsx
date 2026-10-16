import { CopyButton } from "@fewtone/ui/components/copy-button/copy-button";
import { cn } from "@fewtone/ui/lib/utils";
import { highlight } from "@/lib/code";

/** The library's Copy Button, quiet until hovered and sized to fit the 40px bar */
const copy = "size-7 text-muted-foreground hover:text-foreground";

/** Highlighted on the server at build time; colours switch with the theme in app/globals.css */
export async function CodeBlock({
  code,
  lang = "tsx",
  filename,
  className,
}: {
  code: string;
  lang?: string;
  filename?: string;
  className?: string;
}) {
  const source = code.trimEnd();
  const html = await highlight(source, lang);

  return (
    <div className={cn("code-block overflow-hidden rounded-xl border bg-muted", className)}>
      {filename ? (
        <div className="flex items-center justify-between gap-2 border-b px-(--space-bar-x) py-(--space-bar-y)">
          <span className="truncate font-mono text-caption text-muted-foreground">{filename}</span>
          <CopyButton value={source} size="icon-sm" aria-label="Copy code" className={copy} />
        </div>
      ) : null}
      <div className="relative">
        {filename ? null : (
          <CopyButton
            value={source}
            size="icon-sm"
            aria-label="Copy code"
            className={cn(copy, "absolute top-2 right-2")}
          />
        )}
        <div
          className="overflow-x-auto px-(--space-code-x) py-(--space-code-y) text-code"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output, generated at build time from our own source files
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
