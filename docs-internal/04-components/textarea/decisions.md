# Textarea: decisions

**Status:** built 2026-10-16 with the rest of the roadmap, for the owner to review on the dev server.

- **What it is:** a native `textarea` with Input's look (`border-input`, `rounded-lg`, `text-sm`, `shadow-xs`, the same focus, invalid and disabled states), and no wrapper, so `className`, `ref` and every native prop land on the textarea itself, as in shadcn. The API is shadcn's plus `minRows` / `maxRows` (the names react-textarea-autosize and MUI use).
- **The crafted detail, the growth** (roadmap: "grows smoothly with its content"):
  - As lines come and go, the height glides to fit on an eased tween (`duration.base`, `ease.out`), the height pattern in motion.md. Never a spring: its overshoot would bounce everything below the field.
  - `minRows` (default 3) is the empty height and the floor; `maxRows` (default none) is the ceiling, after which it scrolls. Both are CSS heights in `lh` units plus the padding and border (`calc(<n>lh + 1rem + 2px)`), so they hold before JavaScript runs.
  - With reduced motion it resizes at once. Nothing glides on first paint, on a width change or when webfonts load; those fit at once. A value set from outside (controlled, a Clear button, a form reset) glides like typing.
- **How it's measured, and why:**
  - **First paint:** CSS `field-sizing: content` sizes the field to its text before hydration, so a server-rendered value doesn't jump. Browsers without it start at `minRows` (the `rows` attribute and the min height) and fit on hydration.
  - **After hydration:** JavaScript drives the height, because CSS can't transition a height that comes from field-sizing (the computed height stays `auto`). It sets the height to 0 for a moment (the min height holds it at `minRows`), reads `scrollHeight`, restores the height and scroll in the same task (nothing paints in between), then animates a number from `offsetHeight` to the target with motion's `animate`, writing `style.height` each frame.
  - **Layout pixels** (`scrollHeight`, `offsetHeight`), not on-screen boxes, so a zoomed preview or a scaling dialog doesn't double the glide (the pitfall Switch and Radio Group hit).
  - **The text stays put while it grows.** Inside the shorter box the browser scrolls a new line into view, so the text would jump up a line and slide back down as the box opened. While growing into room it has, the scroll is held at the top (in the change handler and on every frame), so the box opens onto the new line instead.
  - **When it measures:** after each change, in a microtask, so a controlled field that changes or refuses the typed text is measured as React leaves it; when `value`, `minRows` or `maxRows` change; when its width changes (a ResizeObserver that ignores our own height changes); when `document.fonts` is ready; after a form reset. A target already reached or on its way isn't restarted. A field that isn't rendered (a closed tab) is skipped and fits when it shows.
  - **Overflow** is hidden while the text fits, so no scrollbar flashes as it grows, and `auto` once it passes `maxRows`.
- **Rejected:**
  - **`field-sizing` alone:** it grows instantly, with no glide, and isn't in every browser.
  - **A wrapper that glides around a borderless textarea** (no scroll to hold): it moves `className` off the textarea and breaks shadcn's API and Input's "no wrapper" decision.
  - **A hidden mirror element** sized by the text: it has to copy every text style to wrap the same way, and it's still instant.
- **`rows` is left out of the props;** `minRows` does its job. Users who override the vertical padding should know the min and max heights assume `py-2` and a 1px border.
- **No sizes.** shadcn's Textarea has none, and its height comes from its rows.
- **Demos:**
  - **Hero:** a "Message" field (2 to 6 lines). It's small enough for the index card, so there's no card demo.
  - **Examples:** Character counter (`maxLength` 160; each digit of the count swaps through the blur on its own with Copy Button's `swap`, rising as the count goes up and falling as it goes down, keyed by place so only the changed digits move; the count is linked with `aria-describedby` as text), Disabled.
- **Tests:** label and typing, a long first value fits at once, growing and shrinking line by line, stopping at `maxRows` with scrolling, a controlled value cleared from outside, `rows`, refs and native props, axe (invalid and disabled). jsdom has no layout, so `scrollHeight`, `clientWidth` and `offsetHeight` are stubbed per test.
- **Not verified by eye:** the hold on the scroll while growing. Chrome and Safari scroll the caret into view as part of the edit, before our handler, so the hold should win; if a browser scrolls later, the text could flicker for a frame on a new line. Also unchecked: typing at the very bottom of the viewport, where the page may not scroll to follow the new line once the glide ends (field-sizing alone would).
- **Not built yet:** a character counter inside the component (it's a demo), resizing by dragging (off: `resize-none`), a submit-on-Enter option.
