/*
 * FewTone's switcher style for the docs (Preview / Usage / Code, the package manager): "Framed · ink"
 * (owner, 2026-10-13, picked in the Lab). No track: the active option is a solid ink pill (Pill with
 * `switchPill`) with inverted text, gliding between options. The set is the one stacking layer, so the
 * pill passes behind every label (components/motion/pill.tsx).
 */

/** The set of options */
export const switchList = "relative isolate inline-flex gap-1";

const switchItem =
  "focus-ring relative inline-flex items-center rounded-full px-(--space-tab-x) py-(--space-tab-y) text-label text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground";

/** A Radix tab trigger */
export const switchTab = `${switchItem} data-[state=active]:text-background data-[state=active]:hover:text-background`;

/** A toggle button (aria-pressed), such as a package manager */
export const switchButton = `${switchItem} aria-pressed:text-background aria-pressed:hover:text-background`;

/** The gliding pill's colour */
export const switchPill = "bg-foreground";

/** Inactive panels stay in the HTML (for search engines and AI tools) but are hidden */
export const tabPanel = "focus-ring rounded-xl data-[state=inactive]:hidden";
