# Context Menu: decisions

**Status:** published directly (2026-10-16), as part of the remaining roadmap components. The owner reviews it on the dev server with the others.

- **What it is:** a right-click menu, on Radix Context Menu. A right-click, or a long-press on touch, opens it at the pointer. On a focused trigger, the keyboard's context-menu key and Shift+F10 open it too (the browser sends a `contextmenu` event) and focus the first item. Inside, the keys are Dropdown Menu's. The parts and props are shadcn's, with the `ContextMenu` prefix. The root has no `open` prop: Radix opens it where the pointer is.
- **Dropdown Menu's twin:** the surface, rows, gliding highlight, drawn check, growing dot, sub-menu state and class names are imported from `dropdown-menu.tsx`, so the two menus look and move the same and can't drift apart. The reasons, and every motion choice, are in `../dropdown-menu/decisions.md`. Only the Radix parts and their CSS variables (`--radix-context-menu-*`) differ.
- **It grows from the pointer:** Radix puts the transform origin at the menu's corner by the pointer, so `animate-popover-in` scales it out from where you clicked, through the blur.
- **The trigger** gets the outline focus-ring classes by default. It isn't focusable on its own (Radix renders a span), so the docs and the demo add `tabIndex={0}` for keyboard users.
- **Demo:** a dashed "Right-click here" area (dashed, because it's a target area; its border firms up to `ring` while its menu is open, showing which area the menu belongs to), with Back, Forward (disabled), Reload, a More tools sub-menu, two checkbox items and a Text size radio group. Settings and choices keep this menu open (`onSelect` with `preventDefault`), so the check and the dot are seen changing. It's a single area, so it doubles as the index card.
- **Tests:** right-click opens a menu with its item, checkbox and radio roles; arrow keys move one highlight and skip a disabled item; Enter picks and closes; the keyboard path (Shift+F10, then the `contextmenu` event) focuses the first item; a sub-menu on ArrowRight and Escape closing everything; checkbox and radio state across openings; axe, closed and open.
- **Risks:**
  - **Installing it brings Dropdown Menu along.** A project that already has shadcn's `dropdown-menu.tsx` and declines the overwrite keeps a file without the shared pieces, and Context Menu's import fails. Repeating the shared code in this file would avoid that at the cost of two copies.
  - **Keyboard-opened position:** where the menu opens after Shift+F10 depends on the coordinates the browser gives the keyboard's `contextmenu` event. It's not checked in a browser yet.
- **Not built yet:** a controlled `open` (Radix doesn't offer one for context menus); the arrow.
