/** Shared pill-tab classes for the docs (preview, install). A filled list with no border, as on beUI. */
export const tabList =
  "inline-flex items-center gap-(--space-tabs) justify-self-start rounded-full bg-muted p-(--space-tabs)";

export const tabTrigger =
  "focus-ring rounded-full px-(--space-tab-x) py-(--space-tab-y) text-body-sm leading-5 font-medium text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground";

/** Inactive panels stay in the HTML (for search engines and AI tools) but are hidden */
export const tabPanel = "focus-ring rounded-xl data-[state=inactive]:hidden";
