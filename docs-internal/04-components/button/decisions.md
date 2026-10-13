# Button: decisions

- **API follows shadcn on purpose.** Variants `default | secondary | outline | ghost | destructive | link` and sizes `sm | md | lg | icon | icon-sm | icon-lg`, plus `asChild` (Radix Slot) and an exported `buttonVariants`. Familiar names make it a drop-in.
- **`type` defaults to `"button"`.** This is a change from the native default (`submit`). It prevents accidental form submits, and passing `type="submit"` is explicit.
- **The press is CSS, not motion** (ADR 0009). `active:scale-(--scale-press)` with `active:ease-(--ease-spring)`: a quick sink on the spring curve, released on `ease-out`.
  - No `"use client"`, so it works in server components.
  - `asChild` links get the same press.
  - The most-installed item doesn't pull in `motion`.
- **Heights come from `--size-control-*`.** These are 32/36/40px, shared with Toggle, Input and Select, so they line up in a row.
- **Icons size themselves** to `--size-icon-md` unless they carry their own `size-*` class (the shadcn selector).
- **Plain `bg-primary`.** The site's gradient primary (`bg-gradient-primary`) is site-only and isn't portable.
- **Not built:** a loading state. Loading Button gets its own page later (owner, 2026-10-12: one component per page).
