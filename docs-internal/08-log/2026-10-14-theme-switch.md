# 2026-10-14 · Theme switch exploration

The Lab at `/lab` compares ways to reveal the other theme (`components/theme-switch.ts`, `app/lab/theme-lab.tsx`). Exploration only: once the owner picks one, record it in an ADR and delete the Lab files and the unused reveals.

**Changes today:**
- **Blinds removed** (owner).
- **Six new reveals:**
  - Ink: an organic blob from the click
  - Tide: a liquid wave rising from the bottom
  - Page turn: the old page swings away in 3D
  - Zoom through: the old theme rushes past and dissolves
  - Lens: a circle with the new theme settling from a zoom
  - Radar: a hand sweeping clockwise round the click
- **One mechanism:** every reveal is now a set of Web Animations keyframes on the two view-transition snapshots, computed from the click point and screen size. `globals.css` keeps only the reset (no default cross-fade) and the "old on top" stacking rule.
- **Cost labels:** each option is labelled by what it animates: GPU only (transform and opacity), Light (clip-path) or Heavier (mask). Fade lost its blur, since an animated full-screen blur is expensive.
- **Frame rate:** after each Try it, the Lab card shows the frames per second and the slowest frame, measured between the transition's `ready` and `finished`.

**Bug found and fixed:** the reveal animations filled forwards and were never cancelled. Their last frame then applied to every later switch: after Zoom through, the old snapshot stayed invisible. They are now cancelled when the transition finishes. This was verified in headless Chrome: all 15 options flip the theme, each runs only its own animations, and nothing is left afterwards.

**Decision (later the same day):**
- **Removed:** Lens, Zoom through and Radar (owner: disliked).
- **Shipped:** the eleven remaining reveals as a library component, Theme Toggle (`packages/ui/src/components/theme-toggle/`). It has `reveal` and `speed` props, and `revealTheme()` is exported. ADR 0010 records the decision and the rejected options.
- **The site's header toggle:** now the library component, with `reveal="random"` and `speed="slow"` (owner). It never plays the same reveal twice in a row.
- **Deleted:** the Lab theme page, `theme-lab.tsx`, `theme-switch.ts` and the global reveal CSS. The component adds its own view-transition rules while a switch runs.
- **Applying the theme:** through `flushSync(() => setTheme())`. Verified in Chrome: the theme had changed by `transition.ready`, at 1000ms per switch, with nothing left over.
- **Dev server:** it served a stale server build twice (yesterday's CSS, today's header HTML) on this slow drive. A restart fixed both times. If the page and the code disagree, restart `pnpm dev` first.

**Installation "View less" (owner):**
- Once the steps are open, "View less" is sticky: it floats at the bottom of the screen, lifted by a shadow, and lands at the end of the section, so there is only ever one button.
- Pressing it folds the steps while the page glides back to the Installation heading (sections now have `scroll-mt-24`), and focus returns to "View all steps".
- Checked in headless Chrome: it floats 32px from the bottom while reading, lands flat at the end, and pressed from 3,250px down it leaves the heading at 96px.

**Theme Toggle page: All reveals (owner):**
- The first preview is now every reveal plus Random: 12 toggles with their names underneath, six per row on wide screens (four on tablets, three on phones).
- Quick / Medium / Slow buttons above the grid set the speed for all of them.
- The single-toggle Default demo was removed as redundant; the usage code under the preview still shows the basic use.
- The Random and Speeds examples stay below, for their code.
- Checked in headless Chrome: two rows of six, each name centred under its toggle. Ink played at 700ms, Tide at 1000ms after choosing Slow, and Page turn and Random switched the theme.
- **Revised (owner):** the speed is now a Select in the preview's top-right corner (Quick 450ms, Medium 700ms, Slow 1000ms). The toggles form a compact grid in the middle: 426px instead of the full width, with smaller gaps. A spacer as tall as the Select's row keeps the grid centred. Measured: the Select is 16px from the top and right edges, the grid is centred exactly, and choosing Slow made Fade take 1000ms.
- **Examples removed (owner):** the Theme Toggle page has no Examples section now. The All reveals preview covers Random and the speeds, and the API table documents the list form. `random.tsx` and `speeds.tsx` were deleted.

**Theme Toggle icon: a sun-to-moon morph (owner: "make it wow"):**
- **One drawing instead of swapping two Lucide icons.** It is a single SVG, `SunMoon` in `theme-toggle.tsx`.
- **Going to the moon:**
  - the rays shrink and spin away
  - the core swells on `spring.bouncy` to radius 9
  - a mask circle (radius 6.4) slides over the top right to carve a full crescent, with Lucide's moon proportions
  - two stars twinkle in
- **Going back:** the rays pop out one after another.
- **Hover:** no tilt. A 12° hover tilt was tried and removed (owner: it's good as it is).
- **Rules kept:** only transforms and opacity move, reduced motion jumps straight to the end state, and each instance has its own mask ID.
- **Dependencies:** the registry item no longer needs `lucide-react`.
- **First attempt rejected:** a mask of radius 9 left a thin sliver in the lower left. Screenshots at 10× showed it, and the mask was shrunk to fix it.
- **Example back:** "With a switch". Our Switch drives `revealTheme` with a circle growing from the switch, with sun and moon icons that light up for the current theme. Screenshots confirmed it shows on in dark, and off after one press, in light.
- **Checks:** `pnpm check` passes.

**Standards captured as always-on rules (owner: "so all new components or changes have that and not need to tell them"):**
- **`.agents/rules/design.md`:** neutral first, tokens and `--space-*`, few borders, accessibility, copy.
- **`.agents/rules/motion.md`:** the situation → pattern table:
  - sliding Pill or indicator
  - RowIndicator
  - AutoHeight for height
  - Expandable with the floating "View less"
  - popover keyframes
  - Dialog enter and exit
  - layout thumbs
  - icon morphs
  - CSS press
  - colour-only hover (no tilts)
  - staggered rise-in
  - revealTheme

  Plus the pitfalls already hit.
- **`.agents/rules/components.md`:** files, the portable vocabulary, a shadcn-shaped API, meta, a hero demo that shows the range (compact grid, settings in a top-right Select), and examples only for what the hero can't show.
- **`.agents/skills/new-component/SKILL.md`:** before, build, check (`pnpm check` plus real-browser measuring and screenshots in light and dark at 1440 and 390, keyboard, reduced motion, restart a stale dev server, delete temporary profiles), record, hand over. `.claude/skills/new-component` points to it.
- **Loading:** `CLAUDE.md` imports the three rules files, so Claude always loads them, and AGENTS.md points other tools to them.
- **Owner:** components come next, one at a time and only when asked. Nothing was generated today.

**Component improvements (owner's list), all verified in Chrome with real mouse and keyboard input, plus `pnpm check` (23 tests):**
- **Button:**
  - no press scale; a colour step instead, and `cursor-pointer`
  - `--scale-press` removed, along with its uses on the landing CTA and Copy prompt
- **Input:**
  - the Invalid demo is live: the error goes once the value is valid, and comes back if it isn't
  - the File example was removed
- **Select:**
  - scroll arrows removed; native scroll capped at 18rem with edge fades, and the selected option opens centred
  - new `searchable` with a pinned field, filtering, arrow and Enter keys, and an empty state, with tests
- **Switch:**
  - thumb motion rewritten: hover lean, press stretch, and a stretched trip that settles round, placed with numbers rather than `layout`
  - hero zoomed 2× through a new per-demo `zoom` meta field
  - "Airplane mode" removed
- **Rules updated:** `.agents/rules/motion.md` (press, the thumb, validation messages, long lists, the zoom and scroll pitfalls) and `components.md` (zoom for small controls).
- **Found and fixed while checking:**
  - the zoomed Switch overshot its track during `layout` animations
  - edge fades inflated the list's scroll height
  - a stale bottom fade was left behind by the gliding highlight
  - the selected option opened under the bottom fade

**Second pass (owner):**
- **Switch:** the hover now stretches the thumb from its end instead of shifting it. The "on" colour sweeps across behind the thumb as it travels, and fades. No shadows.
- **Button:** a single tint-layer hover for every variant (fades in while rising 4px, deeper on press), a fading underline for Link, and no shadows.
- **Rules updated:** motion.md (the thumb row, and button hover and press), and design.md (controls are flat).
- **Checked in Chrome with a real mouse.**
- **Switch off now mirrors on:** the colour retracts solid behind the thumb and only fades at the end (owner).
- **Switch off reworked (owner disliked the ring):** going off, the colour now ends at the thumb's near edge, so the thumb pushes it home with no ring, and it fades over the last fifth of the trip. The thumb and colour now share motion values.
- **Switch off, final:** the colour is driven only by the thumb's position, so off is on played backwards: the same edge, and the same progress-based opacity reaching 0 on arrival. The near-edge attempt was rejected by the owner as disconnected.
- **Index cards can use their own demo:** `preview.card` in the meta (schema, `build-index.mjs`, `ItemCard`). Theme Toggle's card shows a single toggle; its page still opens on every reveal.

**Public roadmap (/roadmap, owner chose public):**
- **The plan:** `lib/roadmap.ts`, with 51 components in 7 groups.
- **Status from the index:** 5 Available (linked), 10 Next up (Checkbox, Radio Group, Textarea, Dialog, Dropdown Menu, Tooltip, Popover, Tabs, Accordion, Toast) and 36 Planned. A planned component that ships under the same name flips to Available on its own.
- **Where it's linked:** with the guides (sidebar, search, sitemap) and in the footer's Library column.
- **Look:** neutral styling (Navy stays for New) and wording for visitors.
