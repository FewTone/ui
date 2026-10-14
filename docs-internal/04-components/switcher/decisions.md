# Switcher: decisions

**Status:** published (owner, 2026-10-14) after review in the Lab, whose workbench was then deleted. The page opens on both variants side by side, named underneath, with a Size Select in the top-right corner. The examples are Icons, and Icons and text. The index card shows a single Switcher (`preview.card`), and the keywords include "segmented control".

- **What it is:** one choice from a few (Day / Week / Month, List / Grid, alignment). It was split from Toggle Group (owner, 2026-10-14), and the owner chose the name over Segmented Control and Option Picker.
- **API:** `Switcher` and `SwitcherItem`, with `value`, `defaultValue` and `onValueChange` as strings, plus `variant` (default, outline) and `size` (sm, md, lg). It's built on Radix Toggle Group, single.
- **Always a choice:** clicking the active option keeps it. Radix sends an empty value, which is ignored. There is no deselect option, because a switcher with nothing chosen isn't a switcher.
- **Accessibility:** a `radiogroup` of radio items. Arrow keys move focus and loop; Home and End jump.
- **Motion:** one pill slides to the active option (`layoutId` on `spring.snappy`), inside `LayoutGroup id={useId()}`, so two Switchers never trade a pill. The option's radius is read at mount and given to motion as a number, so the corners stay true while the pill changes width. With reduced motion it jumps.
- **Stacking:** the Switcher is `isolate` and the options aren't stacking contexts, so the sliding pill passes behind every label.
- **Look:** the same as Toggle Group (default: muted track with a background pill; outline: outlined track with an accent pill). It's flat, and the group is a control height.
- **Tests:** keeps a choice, arrow keys, and axe.
- **Outline fixed** (owner, 2026-10-14: the Outline version had no dark or light background, so only the text changed).
  - **Cause:** the pill was `bg-accent`, which is the same grey as the preview canvas in both themes, so it was invisible there.
  - **Now:** Outline uses an inverted pill (`bg-primary`, dark on light and light on dark) with the active label in `text-primary-foreground`, so it reads on any surface and differs clearly from Default's soft pill.
  - **Text timing:** the label's colour changes over `duration.base`, so the flip keeps pace with the pill.
  - **Hover:** it now only brightens options that are off (`data-[state=off]:hover`), so it can't wash out the active label.
- **Outline, final** (owner, 2026-10-14: "dark in dark and light in light"). The inverted pill was rejected, so the pill now takes the theme's background on both variants. On Outline it also gets a hairline (`border-input`), so it stays visible even where the surface beneath is the page colour. The active label is the normal foreground again; hover still only affects options that are off.
