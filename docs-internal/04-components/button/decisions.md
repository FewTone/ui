# Button: decisions

- **API follows shadcn on purpose.** Variants `default | secondary | outline | ghost | destructive | link` and sizes `sm | md | lg | icon | icon-sm | icon-lg`, plus `asChild` (Radix Slot) and an exported `buttonVariants`. Familiar names make it a drop-in.
- **`type` defaults to `"button"`.** This is a change from the native default (`submit`). It prevents accidental form submits, and passing `type="submit"` is explicit.
- **Hover and press are one tint layer** (owner, 2026-10-14: "simpler but good… no glow, no shadow, no scale").
  - **How:** a `::before` in `bg-current`, so it takes the label's colour on every variant. It sits behind the label in an `isolate`, `overflow-hidden` button.
  - **Hover:** it fades to 10% while rising 4px from the bottom.
  - **Press:** it deepens to 15%, at instant speed.
  - **Variant hover colours removed:** this replaced the per-variant `hover:bg-*/90` and `active:bg-*/80` classes, because one mechanism looks the same across variants.
  - **Link:** no layer; its underline fades in (`decoration-transparent` → `decoration-current`).
  - **Shadows:** the resting `shadow-xs` was removed too, so buttons are flat.
  - **Checked in Chrome on all six variants:** 0 → 0.10 → 0.15, no shadow, no transform.
  - The scale and its `--scale-press` token were removed everywhere, including the landing CTA and Copy prompt, which now use an opacity step.
  - Still pure CSS and server-safe: no `"use client"`, `asChild` links behave the same, and there's no `motion` dependency.
- **`cursor-pointer`:** Tailwind v4 resets buttons to the default cursor, so the component sets it back (disabled buttons have `pointer-events-none`).
- **Heights come from `--size-control-*`.** These are 32/36/40px, shared with Toggle, Input and Select, so they line up in a row.
- **Icons size themselves** to `--size-icon-md` unless they carry their own `size-*` class (the shadcn selector).
- **Plain `bg-primary`.** The site's gradient primary (`bg-gradient-primary`) is site-only and isn't portable.
- **Not built:** a loading state. Loading Button gets its own page later (owner, 2026-10-12: one component per page).
