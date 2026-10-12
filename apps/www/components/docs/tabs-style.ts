/** Shared pill-tab classes for the docs (preview, install) */
export const tabList =
  "inline-flex items-center gap-0.5 justify-self-start rounded-full border bg-muted p-0.5";

export const tabTrigger =
  "focus-ring rounded-full px-3 py-1 text-label text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs";

/** Inactive panels stay in the HTML (for search engines and AI tools) but are hidden */
export const tabPanel = "focus-ring rounded-xl data-[state=inactive]:hidden";
