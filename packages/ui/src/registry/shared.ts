/**
 * Registry-only items (ADR 0009). They are installed as dependencies of components and never get a page.
 * The generator (scripts/registry/build-registry.mjs) reads every value from the token files: nothing is copied by hand.
 *
 * Library components may only use these tokens, the standard shadcn colour variables and Radix's `--radix-*`
 * variables. `pnpm check:tokens` enforces that list.
 */

/** Where the registry is published. `REGISTRY_URL` overrides it when testing installs against a local server. */
export const registryBase = "https://ui.fewtone.com/r";

/** Non-colour tokens from tokens.css (:root) that components use, shipped to the user's :root */
export const shippedVariables = [
  "size-control-sm",
  "size-control-md",
  "size-control-lg",
  "size-icon-sm",
  "size-icon-md",
  "size-icon-lg",
  "duration-instant",
  "duration-fast",
  "duration-base",
  "duration-slow",
  "duration-slower",
  "z-popover",
  "focus-ring-width",
  "focus-ring-offset",
  "opacity-disabled",
  "scale-press",
] as const;

/** Easing curves from tokens.css (@theme), shipped as plain variables so they never depend on Tailwind's defaults */
export const shippedEasings = ["ease-spring"] as const;

/** Colours components need that shadcn's current themes don't define; resolved to literal light and dark values */
export const shippedColors = ["destructive-foreground"] as const;

/** Keyframe animations components use; their easing is written out literally for users */
export const shippedAnimations = ["popover-in", "popover-out"] as const;

/** The standard shadcn colour variables every user project already has */
export const shadcnVariables = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "radius",
] as const;

export type SharedItemName = "tokens" | "motion";

export const sharedItems: Record<
  SharedItemName,
  { title: string; description: string; type: "registry:lib"; files: string[] }
> = {
  tokens: {
    title: "FewTone UI tokens",
    description:
      "Sizes, motion durations, easing, focus ring and popover animations that FewTone UI components use. Adds only what your project does not define yet.",
    type: "registry:lib",
    files: [],
  },
  motion: {
    title: "Motion presets",
    description:
      "The spring, duration and easing presets FewTone UI components animate with, for motion/react.",
    type: "registry:lib",
    files: ["lib/motion.ts"],
  },
};
