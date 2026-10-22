import { demos } from "@fewtone/ui/registry/demos";
import { kinds } from "@fewtone/ui/registry/kinds";
import type { Item } from "@fewtone/ui/registry/schema";
import { readSource, toProjectImports } from "@/lib/code";
import { CodeBlock } from "./code-block";
import { PreviewTabs } from "./preview-tabs";

/** One demo with its Preview, Usage (hero only) and Code tabs */
export async function ComponentPreview({
  item,
  demo,
  withUsage = false,
}: {
  item: Item;
  demo: string;
  withUsage?: boolean;
}) {
  const Demo = demos[`${item.name}/${demo}`];
  if (!Demo) return null;
  const zoom = item.demos.find((entry) => entry.name === demo)?.zoom;
  const source = toProjectImports(await readSource(`${item.dir}/demos/${demo}.tsx`));

  return (
    <PreviewTabs
      preview={<Demo />}
      usage={withUsage && item.usage ? <CodeBlock code={item.usage.code} /> : undefined}
      code={<CodeBlock code={source} filename={`${demo}.tsx`} />}
      replay={item.motion.animated}
      zoom={zoom}
      height={item.preview.height}
      align={item.preview.align}
      template={item.preview.template ?? kinds[item.kind].template}
    />
  );
}
