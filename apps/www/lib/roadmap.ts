import { items } from "./content";

/*
 * The public roadmap (/roadmap, owner 2026-10-14). Edit this list to plan; the status of each entry comes
 * from the content index:
 * - Available: a component with this `name` exists, so the entry links to its page
 * - Next up: `next: true` and not built yet
 * - Planned: everything else
 * When a planned component ships under the same name, it becomes Available here with no other change.
 * When you change the plan, bump the Roadmap's updatedAt in guides.ts (the sitemap uses it).
 */

export type RoadmapStatus = "available" | "next" | "planned";

type Entry = {
  /** The component's slug once built, for example "dropdown-menu" */
  name: string;
  title: string;
  /** One line for visitors: what it is, and how it will feel */
  note: string;
  /** In the next batch to build */
  next?: boolean;
};

const plan: { group: string; entries: Entry[] }[] = [
  {
    group: "Buttons",
    entries: [
      { name: "button", title: "Button", note: "Six variants and six sizes, with a soft tint on hover." },
      {
        name: "theme-toggle",
        title: "Theme Toggle",
        note: "Light and dark switching that reveals the new theme from the button.",
      },
      {
        name: "loading-button",
        title: "Loading Button",
        note: "Loading, success and error for async actions, at a steady width.",
      },
      {
        name: "switcher",
        title: "Switcher",
        note: "One choice from a few, with a pill that slides to it.",
      },
      {
        name: "toggle-group",
        title: "Toggle Group",
        note: "Buttons you switch on and off, like Bold and Italic.",
      },
      {
        name: "copy-button",
        title: "Copy Button",
        note: "Copies text, with the icon morphing into a check.",
      },
    ],
  },
  {
    group: "Forms",
    entries: [
      {
        name: "input",
        title: "Input",
        note: "Text field with live validation that clears as the value is fixed.",
      },
      { name: "select", title: "Select", note: "Single choice, with search for long lists." },
      { name: "switch", title: "Switch", note: "On and off, with a thumb that stretches as it travels." },
      {
        name: "checkbox",
        title: "Checkbox",
        note: "A check that draws itself in, plus an indeterminate state.",
        next: true,
      },
      {
        name: "radio-group",
        title: "Radio Group",
        note: "One choice from a few, including a card style for plans.",
        next: true,
      },
      {
        name: "textarea",
        title: "Textarea",
        note: "Multi-line text that grows smoothly with its content.",
        next: true,
      },
      { name: "combobox", title: "Combobox", note: "Type to filter and pick, right in the field." },
      { name: "slider", title: "Slider", note: "Pick a value or a range by dragging." },
      { name: "input-otp", title: "Input OTP", note: "One-time code boxes that move on as you type." },
      {
        name: "number-input",
        title: "Number Input",
        note: "Numbers with step buttons and keyboard control.",
      },
      { name: "date-picker", title: "Date Picker", note: "A calendar in a popover, for dates and ranges." },
      { name: "calendar", title: "Calendar", note: "A month view to pick dates from." },
    ],
  },
  {
    group: "Overlays",
    entries: [
      {
        name: "dialog",
        title: "Dialog",
        note: "A modal that springs in and fades out, with focus handled.",
        next: true,
      },
      {
        name: "dropdown-menu",
        title: "Dropdown Menu",
        note: "A menu of actions with a highlight that glides between items.",
        next: true,
      },
      { name: "tooltip", title: "Tooltip", note: "A short hint on hover and focus.", next: true },
      { name: "popover", title: "Popover", note: "Rich content anchored to a trigger.", next: true },
      { name: "sheet", title: "Sheet", note: "A panel that slides in from any edge." },
      { name: "alert-dialog", title: "Alert Dialog", note: "Confirmation for destructive actions." },
      { name: "context-menu", title: "Context Menu", note: "A right-click menu." },
      { name: "hover-card", title: "Hover Card", note: "A preview card on hover." },
    ],
  },
  {
    group: "Navigation",
    entries: [
      {
        name: "tabs",
        title: "Tabs",
        note: "Panels switched by an underline that slides between tabs.",
        next: true,
      },
      {
        name: "accordion",
        title: "Accordion",
        note: "Sections that open and close with a smooth height change.",
        next: true,
      },
      { name: "breadcrumb", title: "Breadcrumb", note: "Where you are in the site, as a trail of links." },
      { name: "pagination", title: "Pagination", note: "Move through pages of results." },
      { name: "navigation-menu", title: "Navigation Menu", note: "A top bar with rich dropdown panels." },
      {
        name: "sidebar",
        title: "Sidebar",
        note: "A collapsible app sidebar with a gliding active indicator.",
      },
      { name: "command", title: "Command Palette", note: "⌘K search for pages and actions." },
    ],
  },
  {
    group: "Feedback",
    entries: [
      { name: "toast", title: "Toast", note: "Notifications that slide in and stack.", next: true },
      {
        name: "badge",
        title: "Badge",
        note: "Small status labels, including one with a shining edge.",
      },
      { name: "progress", title: "Progress", note: "A bar or ring that shows how far along a task is." },
      { name: "skeleton", title: "Skeleton", note: "Placeholders while content loads." },
      { name: "spinner", title: "Spinner", note: "A small loading indicator." },
    ],
  },
  {
    group: "Display",
    entries: [
      { name: "card", title: "Card", note: "A surface for grouped content." },
      { name: "avatar", title: "Avatar", note: "A picture or initials, alone or in a group." },
      { name: "table", title: "Table", note: "Data in rows and columns, with sortable headers." },
      { name: "scroll-area", title: "Scroll Area", note: "Scrolling with soft fades at the edges." },
    ],
  },
  {
    group: "Effects",
    entries: [
      { name: "number-ticker", title: "Number Ticker", note: "Numbers that roll to their value." },
      { name: "stepper", title: "Stepper", note: "Progress through the steps of a task." },
      { name: "marquee", title: "Marquee", note: "A row of logos or cards that scrolls on its own." },
      { name: "text-effects", title: "Text Effects", note: "Shimmer, reveal and typewriter text." },
      // The backgrounds are their own kind (/backgrounds), one entry each (2026-10-16)
      {
        name: "dot-grid",
        title: "Dot Grid",
        note: "A fine dot pattern behind a section; the dots near the pointer brighten.",
      },
      { name: "line-grid", title: "Line Grid", note: "Thin grid lines that can pan slowly and seamlessly." },
      {
        name: "gradient-drift",
        title: "Gradient Drift",
        note: "Soft single-colour light that drifts very slowly behind a hero.",
      },
    ],
  },
];

const order: Record<RoadmapStatus, number> = { available: 0, next: 1, planned: 2 };

/** The plan with each entry's status and, once available, its page. Available first, then next, then planned. */
export function getRoadmap() {
  const built = new Map(items.map((item) => [item.name, item.href]));
  const groups = plan.map(({ group, entries }) => ({
    group,
    entries: entries
      .map((entry) => {
        const href = built.get(entry.name);
        const status: RoadmapStatus = href ? "available" : entry.next ? "next" : "planned";
        return { ...entry, status, href };
      })
      .sort((a, b) => order[a.status] - order[b.status]),
  }));
  const all = groups.flatMap((group) => group.entries);
  const count = (status: RoadmapStatus) => all.filter((entry) => entry.status === status).length;
  return {
    groups,
    counts: { available: count("available"), next: count("next"), planned: count("planned") },
  };
}
