/**
 * The metadata every item carries in its `<name>.meta.ts` (ADR 0008).
 * scripts/build-index.mjs validates each file against this schema and writes the typed index
 * the site reads. Pages, navigation, SEO and (later) the registry all come from this data.
 */
import { z } from "zod";
import { kinds } from "./kinds.ts";

const kindNames = Object.keys(kinds) as [keyof typeof kinds, ...(keyof typeof kinds)[]];
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use kebab-case, for example loading-button");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");

export const propSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  default: z.string().optional(),
  required: z.boolean().optional(),
  description: z.string().min(1),
});

export const itemSchema = z.object({
  /** URL slug and registry name: /components/<name>, @fewtone/<name> */
  name: slug,
  /** Display name: the page h1 */
  title: z.string().min(1),
  /** One sentence. Used under the h1, as the meta and social description, and on cards */
  description: z.string().min(20).max(170),
  kind: z.enum(kindNames),
  /** Grouping on index pages, for example "Buttons" or "Overlays" */
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  /** Extra search phrases, for example "react dropdown" */
  keywords: z.array(z.string()).default([]),
  /** draft: dev only. new: shows a "New" badge. deprecated: kept for old links */
  status: z.enum(["draft", "new", "beta", "stable", "deprecated"]),
  addedAt: isoDate,
  /** Drives the sitemap lastmod and "Last updated" */
  updatedAt: isoDate,
  tier: z.enum(["free", "pro"]).default("free"),
  /** Source files, relative to the item folder. The first is the main file */
  files: z.array(z.string()).min(1),
  /** npm packages the item needs */
  dependencies: z.array(z.string()).default([]),
  /** Other FewTone UI items it builds on */
  registryDependencies: z.array(slug).default([]),
  /** The snippet shown in the Usage tab and section */
  usage: z.object({ code: z.string().min(1) }).optional(),
  /** demos/<name>.tsx files. The first is the hero preview, the rest are Examples */
  demos: z
    .array(z.object({ name: slug, title: z.string().min(1), description: z.string().optional() }))
    .min(1),
  /** API reference, one entry per part (Root, Trigger...) */
  api: z
    .array(
      z.object({ name: z.string().min(1), description: z.string().optional(), props: z.array(propSchema) }),
    )
    .default([]),
  /** Underlying primitives, for example "Radix Dialog" */
  primitives: z.array(z.string()).default([]),
  /** WAI-ARIA pattern link, shown in the info row */
  ariaPattern: z.url().optional(),
  /** Animated items get a Replay button on their previews */
  motion: z.object({ animated: z.boolean().default(false) }).default({ animated: false }),
  preview: z
    .object({
      template: z.enum(["centered", "full-bleed", "viewport"]).optional(),
      height: z.enum(["sm", "md", "lg"]).default("md"),
    })
    .default({ height: "md" }),
  /** Related items shown at the bottom of the page. Falls back to the same category */
  related: z.array(slug).default([]),
  seo: z.object({ title: z.string().optional(), description: z.string().max(170).optional() }).default({}),
  ai: z.object({ whenToUse: z.string().optional() }).default({}),
  /** Knobs for the internal Lab (Phase 3) */
  controls: z.record(z.string(), z.unknown()).default({}),
});

/** What an author writes in `<name>.meta.ts` */
export type ItemMeta = z.input<typeof itemSchema>;

/** What the site reads from the generated index: defaults filled in, plus derived fields */
export type Item = z.output<typeof itemSchema> & {
  /** Page URL, for example /components/button */
  href: string;
  /** Folder relative to packages/ui/src, for example components/button */
  dir: string;
};
