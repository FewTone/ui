/*
 * FewTone's switcher style for the docs (preview, install, package manager): underline tabs.
 * Plain labels on a bottom rule; a bar slides under the active one (Underline in components/motion/pill.tsx).
 */

/** The row: the tab set on the left, optional actions on the right, one rule underneath */
export const tabRow = "flex items-end justify-between gap-(--space-heading) border-b";

/** The set is the one stacking layer, so the underline passes behind every label */
export const tabList = "relative isolate flex items-end gap-(--space-tab-gap)";

export const tabTrigger =
  "focus-ring relative pb-(--space-tab-pad) text-body-sm font-medium text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground data-[state=active]:text-foreground";

/** Inactive panels stay in the HTML (for search engines and AI tools) but are hidden */
export const tabPanel = "focus-ring rounded-xl data-[state=inactive]:hidden";
