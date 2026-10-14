# Input: decisions

- **A native `input`, no wrapper.** It is fully stylable and every native prop works.
- **`size` is a height variant** (`sm | md | lg`), so the native numeric `size` attribute is removed from the props type with `Omit`. Heights match Button.
- **Invalid state comes from `aria-invalid`,** not a prop. This keeps screen readers and styles in sync: a destructive border and focus outline. Demos link the message with `aria-describedby`.
- **No motion beyond colour transitions.** Text fields shouldn't move.
- **Focus is the shared outline ring plus `border-ring`,** the same as Select's trigger.
- **Not built yet:** an input group (icons, prefixes, buttons inside), and a Field/Label component. Labels are plain `<label>` in demos for now.
- **Invalid demo is live** (owner, 2026-10-14). The error follows the value: it shows while the username is too short and goes once it has 3 characters, returning if the user deletes back. The message glides open and shut (opacity and height) in a polite live region, and the border colour fades with `aria-invalid`.
- **File example removed** (owner). The component still styles `type="file"`.
