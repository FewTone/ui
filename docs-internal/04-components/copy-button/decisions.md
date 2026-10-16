# Copy Button: decisions

**Status:** published directly, without a Lab step (owner, 2026-10-14: "just add components directly, simpler, so we follow the design standards"). This is the default from now on.

- **What it is:** a `Button` that copies `value` to the clipboard. By default it's icon-only (ghost, icon size), named "Copy" for screen readers. With children it shows a label, and `copiedText` replaces the label once copied.
- **Motion:** the same swap as Loading Button, so the library feels like one family.
  - **Copying:** the copy icon lifts away blurring as a check rises 6px from blurred and draws itself in (`pathLength`, the tiny-stroke exception).
  - **Reduced motion:** a fade only.
- **Width never jumps:** both states are laid out invisibly in one cell, so a label change ("Copy link" → "Copied") doesn't resize the button.
- **Accessibility:** a polite live region says "Copied". The icon-only button keeps the name "Copy", so its name doesn't flicker.
- **Clipboard:** `navigator.clipboard.writeText`, falling back to a hidden textarea and `execCommand("copy")` where the API is unavailable (older browsers, pages not served over https). If the copy fails, nothing changes; the text is still on the page to select.
- **Reset:** the check gives way to the copy icon after `resetAfter` (2000ms), counted from the latest copy: copying again while the check shows starts its time over (2026-10-16). `onCopy(value)` fires after a successful copy, and the caller's `onClick` runs first and can call `preventDefault()` to stop the copy.
- **Demos:**
  - **Variants (hero):** Ghost, Outline, and With text, each named underneath.
  - **Examples:** a command row, and a field with a copy button.
  - **No card demo:** the hero is small enough for the index tile.
- **Tests:** copies, shows and resets; copying again restarts the timer; the textarea fallback; text only (`icon={false}`); axe before and after copying.
- **The site uses it everywhere (owner, 2026-10-15):** code blocks, the Command bar, the header install chip and Copy prompt. The site's own copy button and Copy prompt button were deleted.
  - **Icon buttons:** `icon-sm` shrunk to 28px (`size-7`), so code block bars stay 40px and the button still sits 2px inside the 32px install chip. They're muted until hovered.
  - **Copy prompt:** `default` variant, `sm`, with `rounded-lg` and `text-label` to match the chip beside it. Text only, with `icon={false}` (owner, 2026-10-15: "without icon"): "Copy prompt" swaps to "Copied" through the blur.
- **`icon` prop (2026-10-15):** `true` by default. `false` drops the copy icon and the check, for a text-only button that needs a label. It was added for the site's Copy prompt.
- **Not built yet:** copying rich content (HTML or images); an error state when the clipboard is blocked.
