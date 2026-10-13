import { cn } from "@fewtone/ui/lib/utils";
import { highlight } from "@/lib/code";
import { CopyButton } from "./copy-button";

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
          <CopyButton value={source} />
        </div>
      ) : null}
      <div className="relative">
        {filename ? null : <CopyButton value={source} className="absolute top-2 right-2" />}
        <div
          className="overflow-x-auto px-(--space-code-x) py-(--space-code-y) text-code"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output, generated at build time from our own source files
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
