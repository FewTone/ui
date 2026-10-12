import type { Item } from "@fewtone/ui/registry/schema";
import type { ReactNode } from "react";
import { readSource, toProjectImports } from "@/lib/code";
import { addCommands, installCommands } from "@/lib/install";
import { CodeBlock } from "./code-block";
import { InstallTabs } from "./install-tabs";
import { Command } from "./package-manager";

function Step({ number, children }: { number: number; children: ReactNode }) {
  return (
    <li className="relative grid min-w-0 grid-cols-1 gap-3 pl-10">
      <span
        aria-hidden
        className="absolute top-0 left-0 flex size-6 items-center justify-center rounded-full border bg-muted text-caption"
      >
        {number}
      </span>
      {children}
    </li>
  );
}

/** CLI (shadcn) or Manual: dependencies, the source files, then import paths */
export async function InstallSection({ item }: { item: Item }) {
  const files = await Promise.all(
    item.files.map(async (file) => ({
      name: file,
      code: toProjectImports(await readSource(`${item.dir}/${file}`)),
    })),
  );
  const hasDeps = item.dependencies.length > 0;
  const offset = hasDeps ? 1 : 0;

  const manual = (
    <ol className="grid list-none gap-8">
      {hasDeps ? (
        <Step number={1}>
          <p className="text-body-sm">Install the dependencies.</p>
          <Command commands={installCommands(item.dependencies)} />
        </Step>
      ) : null}
      <Step number={1 + offset}>
        <p className="text-body-sm">Copy the source into your project.</p>
        {files.map((file) => (
          <CodeBlock key={file.name} code={file.code} filename={`components/ui/${file.name}`} />
        ))}
      </Step>
      <Step number={2 + offset}>
        <p className="text-body-sm">Update the import paths to match your project.</p>
      </Step>
    </ol>
  );

  return <InstallTabs commands={addCommands(item.name)} manual={manual} />;
}
