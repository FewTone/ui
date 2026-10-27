# 0016 · Drawer: an iOS bottom sheet on Vaul

- **Status:** Accepted (2026-10-26, owner's brief: "add this component with our touch on it as a FewTone component")
- **Builds on:** ADR 0009 (distribution), 0011 (the blur); Dialog and Sheet

## Context
On phones, popups should feel like iOS sheets: drag down to close, the page steps back, and forms work with the keyboard. Dialog (a centred window) and Sheet (a panel from an edge, on our springs) don't drag. Building a drag-to-dismiss sheet with iOS physics, scroll handoff and background scaling from scratch is a large job; Vaul does it, and shadcn's Drawer is built on it.

## Decision
- **A new component, Drawer:** an iOS bottom sheet on phones, our Dialog on larger screens (`mode`: `auto` by default, or always `sheet` / `dialog`), chosen when it opens and kept while open.
- **The sheet is Vaul 1.1.2**, the library's first third-party overlay primitive. It's on Radix Dialog, the same single copy `radix-ui` uses (checked), so behaviour and accessibility match our other overlays. Its own curve and drag stay: they're what makes it native. The owner's brief adds fixes Vaul lacks (a body that scrolls instead of the sheet, our own keyboard handling, 16px fields, the nested step back from code, a clean-up of styles a fast toggle leaves) and our touch (tokens, our Button for the close, Dialog on larger screens, reduced motion, focus to the sheet). Details: `docs-internal/04-components/drawer/decisions.md`.
- **The site** wraps its pages in `data-vaul-drawer-wrapper` (so the page steps back behind a sheet) and sets `viewport-fit=cover` (so the sheet's safe-area padding works); the body pads itself by the left and right safe areas, so a sideways phone's notch never covers content.
- **Three shipped tokens:** `--size-sheet-top-gap`, `--size-sheet-max`, `--size-sheet-inset-bottom`.

## Consequences
- Users' projects get `vaul` as a dependency when they add Drawer (derived from its import). Vaul's repository says it's no longer actively maintained; it's stable and widely used through shadcn. If it breaks with a future React or Radix, the fallback is our Sheet's bottom side plus a drag of our own.
- Reduced motion is ours to handle (Vaul ignores it): the sheet fades, the page doesn't step back.
- Our Input and Textarea are 14px, which makes iOS zoom on focus anywhere on a page. Drawer fixes it inside the sheet only; fixing the fields themselves (16px on phones, as shadcn does) is a separate change.
- Not verified on a real iPhone yet.
