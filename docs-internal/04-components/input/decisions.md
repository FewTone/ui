# Input: decisions

- **A native `input`, no wrapper.** It is fully stylable and every native prop works.
- **`size` is a height variant** (`sm | md | lg`), so the native numeric `size` attribute is removed from the props type with `Omit`. Heights match Button.
- **Invalid state comes from `aria-invalid`,** not a prop. This keeps screen readers and styles in sync: a destructive border and focus outline. Demos link the message with `aria-describedby`.
- **No motion beyond colour transitions.** Text fields shouldn't move.
- **Focus is the shared outline ring plus `border-ring`,** the same as Select's trigger.
- **Not built yet:** an input group (icons, prefixes, buttons inside), and a Field/Label component. Labels are plain `<label>` in demos for now.
