# 2026-10-19: reviewing the roadmap components, one by one

The owner goes through the 43 items built on 2026-10-16 (see `2026-10-16-roadmap-build.md`) one component at a time and asks for changes. Each component's own `decisions.md` holds the detail; this note keeps the order and the outcomes.

## Accordion
**Asked:** "the more good way of showing like the card style", "on hover no underline", and a variant with "the main box and under there each open close as separate boxes", plus anything else worth fixing.

**Done:**
- **Three looks** (`variant`):
  - **`card`** is the new default: one surface with Card's shadow and hairline, and a rule between sections.
  - **`separated`** makes each section its own card, 8px apart. An open section moves 4px further from its neighbours, on the height's timing. The first version sat them in a muted tray; the owner dropped the tray ("only card without main big BG card").
  - **`plain`** is the old rows and rules, for inside a Card, Sheet or Dialog.
- **Hover:** the underline is gone.
  - In card and separated, the question's row tints. Its focus ring now sits inside the row.
  - In every look, the chevron brightens.
- **The hero** shows the three looks side by side. The FAQ hero repeated it and is removed. The index card now shows the card look.
- **The preview's height stays put** (owner: opening and closing shouldn't make it grow and shrink). It's `lg`, and each demo reserves its tallest state, so only the accordion itself moves.
- **motion.md:** spacing that changes with a height change glides on the same timing. The tray had briefly needed `rounded-xl` in the portable vocabulary; that was undone when the tray went.

**Then (owner: "improve the open close animation more good with motion and more smoother"):**
- **Opening and closing run on motion** instead of the CSS keyframes:
  - **The height** glides on `spring.smooth` both ways. There's no visible overshoot, closing lands softly instead of stopping abruptly, and a section pressed again mid-glide turns round from where it is.
  - **The answer is staged:** it follows the opening box a beat later, sharpening as it settles 6px down. On close it goes first, then the empty box folds.
- **Closed answers stay in the page** as `hidden="until-found"`, so Ctrl+F finds them and opens the section, and search engines read them.
- **motion.md:** the height row allows `spring.smooth` (no visible overshoot) and describes Accordion's staging. The CSS keyframes stay for Sidebar's groups.

## Alert
**Removed** (owner: "remove alert"). The component, its demos, tests, meta and `decisions.md` are deleted, along with its roadmap entry. Toast no longer lists it as related or points to it in its AI guidance.

## Breadcrumb
**Asked:** "see if we can do anything like with motion or something."

**Done:**
- **The trail follows you:** a new level slides in from the deeper side through the blur, levels you leave slide back out, and the rest glide into place. Static trails never move; a trail mapped from a path animates when each level is keyed by its path.
- **A new example, A trail that follows you:** a small folder browser. Focus moves to the new folder list, or up the trail, when the pressed control goes away.
- **Breadcrumb is now a client component.** It still renders from server components.
- **motion.md:**
  - a row for levels that come and go
  - two pitfalls: `AnimatePresence initial={false}` blocking entrances inside a child for good, and keying static children

**Then (owner: "I think the underline looks good, then this in hover"):** a gliding hover highlight had replaced the underline. It's taken out again, and links fade their underline in as before. The trail animation stays.

**Then (owner: "in the example we can also do that more motion good like coming from left or something more smoother"):**
- **The trail grows out of itself.** A new level slides out from the one before it, from the left, on a slower, softer ease. The separator comes first and the name a beat later, and a level you leave slides back in.
- **The level you were on dims smoothly** as it becomes a link, and brightens the same way going back.
- **The folder list moves the way you went:** forward from the right, back from the left, row by row, with old and new overlapping instead of one waiting for the other.
