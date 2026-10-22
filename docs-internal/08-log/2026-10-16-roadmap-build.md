# 2026-10-16: building the whole roadmap

**The ask (owner):** build every component left on the roadmap (41), following the design standards, the premium feel and distinctive micro-interactions. The owner reviews them all together afterwards. This overrides "one component at a time" for this batch.

**How it's built:**
- **Builders:** parallel builders, one per family, each working only inside its own component folders and `decisions.md`. They all followed one brief (the rules files, the reference components, a shared look per family, the verification commands).
- **The coordinator** owns the shared files, regenerates the index and runs `pnpm check`.

**Shared groundwork, before the builders started:**
- **Shipped to users:**
  - the z-index tokens `--z-overlay`, `--z-modal`, `--z-toast` and `--z-tooltip`, alongside `--z-popover`
  - the `overlay` colour (the backdrop behind dialogs and sheets). The token check no longer bans `bg-overlay` in library code.
  - the `collapsible-open` / `collapsible-close` keyframes: height on an eased tween with the content coming through the blur. The component sets `--collapsible-height` from Radix's `--radix-*-content-height`. Opening has no fill mode, so the height returns to auto.
- **Recorded in** design-system §13.

**Families:**
1. Popover, Tooltip, Hover Card
2. Dialog, Alert Dialog, Sheet
3. Dropdown Menu, Context Menu
4. Tabs, Accordion
5. Badge, Kbd, Separator, Spinner
6. Textarea, Field
7. Input OTP, Number Input, Slider
8. Toast, Alert, Progress
9. Card, Avatar, Skeleton, Empty State
10. Table, Scroll Area, Pagination, Breadcrumb
11. Calendar, Date Picker
12. Combobox, Command
13. Navigation Menu
14. Sidebar
15. Number Ticker, Marquee, Text Effects, Stepper
16. Backgrounds

**Result:**
- **43 new items** (the 41 roadmap entries, with Backgrounds split into three), each with meta, demos, tests and `decisions.md`.
- **The index** has 54 items. `pnpm check` passes: lint, index, types, tokens, and 406 tests in 54 files.
- **On the dev server,** every page returns 200 and renders its demos, with no server errors.

**Fixed while putting it together:**
- **Dropdown Menu and Context Menu items accept `asChild`.** Their label is in `Slot.Slottable`, so a link can be the item. The Breadcrumb demo's hidden levels are now real links.
- **Backgrounds install as `registry:ui`,** next to components. With `registry:component` they landed in `components/` and broke the imports between their own files.
- **The roadmap's single "backgrounds" entry** is now Dot Grid, Line Grid and Gradient Drift.
- **Sidebar:** two variables typed by hand. The site's typecheck found a circular inference in a loop.
- **Toast's card demo is a client component.** It called `toastVariants()` on the server, which broke Alert's and Progress's pages through their related cards.
- **Field's `FieldControl` unwraps a lazy child** (a control rendered by a server component), as Radix Slot does. Tested.
- **Tooltip's hand-over test** has wider margins; it failed only when the whole suite ran at once.
- **Toast's tests** look text up only inside a toast's title and description. Radix briefly copies the text into a hidden announcer, so a plain text lookup could see it twice under load.
- **Running the full suite with the dev server up** can run the machine out of memory. Stop `pnpm dev` before `pnpm check`.
- **The dev server needs a restart** after `pnpm index` to see new demos (the known stale-cache issue).

**Rules updated:**
- **motion.md:**
  - Accordion's height pattern, decided for good
  - the Dialog and Sheet patterns
  - new rows: the odometer number roll, sorting with FLIP, Stepper's travelling progress, the tooltip hand-over, self-running loops, the morphing mega-menu panel
  - pitfalls: a spring at a screen edge, and `set()` before a spring
- **design-system §9 and §13:** the shipped z-index tokens, `overlay`, and the collapsible keyframes.

**Open questions for the owner's review:**
- **Input fields:** Input has `shadow-xs`, and Input OTP, Number Input and Textarea copy it. The rule says controls are flat; drop it everywhere, or keep it?
- **Error colour:** Toast's error is red text on the neutral surface, like Alert's destructive. Loading Button's error is solid red. Should toasts match?
- **Combobox** is type-in-the-field (Select's `searchable` already covers a button that opens a search).
- **Command:** the dialog example opens with ⌘J, so it doesn't clash with the site's ⌘K search.
- **Dropdown Menu** marks checks and radios at the end of the row (like Select); shadcn puts them at the start.
- **Context Menu** imports Dropdown Menu's code, so installing it brings Dropdown Menu along.
- **Tabs** default to the underline look; Pill is the other variant.
- **Date Picker** closes 220ms after a pick; the range picker stays open; a third click starts a new range.
- **Card** has a hairline ring as well as `shadow-sm`.
- **Defaults to judge:**
  - Badge's shine speed
  - Skeleton's sheen strength
  - the backgrounds' strength (dot 0.4, drift 0.05)
  - Marquee's 40 px/s
  - the Slider thumb's grow (×1.2) and stretch
- **Sidebar** reads its own width variables. Four lines carry `check-tokens-ignore`. Should the token check learn component-defined variables instead?
- **Optional shared additions** the builders suggested:
  - a shipped `spin` keyframe and a sheen keyframe, so Spinner, Badge's shine and Skeleton move before hydration
  - Loading Button rendering the new Spinner
