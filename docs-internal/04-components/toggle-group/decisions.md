# Toggle Group: decisions

**Status:** published (owner, 2026-10-14) after review in the Lab, whose workbench was then deleted. The page opens on both variants side by side, named underneath, with a Size Select in the top-right corner. The examples are Days and A disabled option. The index card shows a single Toggle Group (`preview.card`).

- **Split from Switcher** (owner, 2026-10-14). Toggle Group started with both modes; now it's only buttons switched on and off independently (Bold / Italic / Underline, weekdays, notification channels). Picking one option is the Switcher.
  - **Names:** the owner chose "Toggle Group" (shadcn and Radix's name, so shadcn users find it) and "Switcher". Segmented Control, Toggle Buttons and Toolbar Toggles were the other options.
- **API:** `ToggleGroup` and `ToggleGroupItem`, with `value`, `defaultValue` and `onValueChange` all as string arrays, plus `variant` (default, outline) and `size` (sm, md, lg). There's no `type` prop; it's always Radix's `multiple`.
- **Accessibility:** a `toolbar` of `aria-pressed` buttons. Arrow keys move focus and loop, Home and End jump, and disabled options are skipped.
- **Motion:** each pressed option fades its own pill in (opacity, plus a scale from 0.92 on `spring.snappy`) and out quickly (`duration.fast`, `ease.in`). With reduced motion it only fades. Nothing slides between options; that's the Switcher's job.
- **Look:** shared with the Switcher.
  - **Default:** a muted track with a background pill.
  - **Outline:** an outlined track with an accent pill.
  - **Flat:** no shadow and no scale on the buttons. Inactive options are muted and brighten on hover.
  - **Corners and height:** the pill's radius is read from the option. Options sit 2px inside the track, so the group is a control height.
- **Self-contained:** the styles are repeated in `switcher.tsx` rather than imported, so installing one doesn't bring in the other.
- **Tests:** toggling on and off (with the value array), arrow keys skipping a disabled option, and axe.
- **Outline fixed** (owner, 2026-10-14: the Outline version had no dark or light background, so only the text changed).
  - **Cause:** the pill was `bg-accent`, which is the same grey as the preview canvas in both themes, so it was invisible there.
  - **Now:** Outline uses an inverted pill (`bg-primary`, dark on light and light on dark) with the active label in `text-primary-foreground`, so it reads on any surface and differs clearly from Default's soft pill.
  - **Text timing:** the label's colour changes over `duration.base`, so the flip keeps pace with the pill.
  - **Hover:** it now only brightens options that are off (`data-[state=off]:hover`), so it can't wash out the active label.
- **Outline, final** (owner, 2026-10-14: "dark in dark and light in light"). The inverted pill was rejected, so the pill now takes the theme's background on both variants. On Outline it also gets a hairline (`border-input`), so it stays visible even where the surface beneath is the page colour. The active label is the normal foreground again; hover still only affects options that are off.
