import { tokensCss } from "@fewtone/ui/registry/index.generated";
import type { Item } from "@fewtone/ui/registry/schema";
import Link from "next/link";
import type { ReactNode } from "react";
import { readSource, toProjectImports } from "@/lib/code";
import { items } from "@/lib/content";
import { addCommands, installCommands } from "@/lib/install";
import { CodeBlock } from "./code-block";
import { InstallTabs } from "./install-tabs";
import { Command } from "./package-manager";

function Step({ number, children }: { number: number; children: ReactNode }) {
  return (
    <li className="relative grid min-w-0 grid-cols-1 gap-(--space-heading) pl-(--space-step-indent)">
      <span
        aria-hidden
        className="absolute top-0 left-0 flex size-6 items-center justify-center rounded-full bg-muted text-caption"
      >
        {number}
      </span>
      {children}
    </li>
  );
}

/** "motion@^14.0.0" → "motion": versions stay in the registry, commands stay copy-safe in every shell */
const packageName = (dependency: string) => dependency.replace(/(.)@.*$/, "$1");

/**
 * CLI (shadcn) or Manual. The Manual steps come from the same derived install data as the registry JSON
 * (ADR 0009): npm dependencies, the tokens, shared lib files, other FewTone items, then the source.
 */
export async function InstallSection({ item, prompt }: { item: Item; prompt: string }) {
  const files = await Promise.all(
    item.files.map(async (file) => ({
      name: file,
      code: toProjectImports(await readSource(`${item.dir}/${file}`)),
    })),
  );
  const { dependencies, registry } = item.install;
  const motionSource = registry.includes("motion") ? await readSource("lib/motion.ts") : null;
  const builtOn = registry
    .filter((name) => name !== "tokens" && name !== "motion")
    .map((name) => items.find((other) => other.name === name))
    .filter((other) => other !== undefined);

  const steps: ReactNode[] = [];
  if (dependencies.length > 0) {
    steps.push(
      <>
        <p className="text-body-sm">Install the dependencies.</p>
        <Command commands={installCommands(dependencies.map(packageName))} />
      </>,
    );
  }
  steps.push(
    <>
      <p className="text-body-sm">
        Add the FewTone UI tokens to your global CSS file. Skip any variable your project already defines.
      </p>
      <CodeBlock code={tokensCss} lang="css" filename="app/globals.css" />
    </>,
  );
  if (motionSource) {
    steps.push(
      <>
        <p className="text-body-sm">Add the motion presets.</p>
        <CodeBlock code={motionSource} filename="lib/motion.ts" />
      </>,
    );
  }
  if (builtOn.length > 0) {
    steps.push(
      <p className="text-body-sm">
        Add{" "}
        {builtOn.map((other, index) => (
          <span key={other.name}>
            {index > 0 ? ", " : null}
            <Link href={other.href} className="focus-ring rounded-sm underline underline-offset-4">
              {other.title}
            </Link>
          </span>
        ))}{" "}
        first.
      </p>,
    );
  }
  steps.push(
    <>
      <p className="text-body-sm">Copy the source into your project.</p>
      {files.map((file) => (
        <CodeBlock key={file.name} code={file.code} filename={`components/ui/${file.name}`} />
      ))}
    </>,
    <p className="text-body-sm">Update the import paths to match your project.</p>,
  );

  const manual = (
    <ol className="grid list-none gap-(--space-steps)">
      {steps.map((step, index) => (
        // Steps are built in a fixed order for this item, so the position is a stable key
        // biome-ignore lint/suspicious/noArrayIndexKey: static list, never reordered
        <Step key={index} number={index + 1}>
          {step}
        </Step>
      ))}
    </ol>
  );

  return <InstallTabs commands={addCommands(item.name)} manual={manual} prompt={prompt} title={item.title} />;
}
