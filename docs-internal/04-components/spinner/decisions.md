# Spinner: decisions

**Status:** published 2026-10-16 (a ring with a turning arc, from the roadmap note "A small loading indicator"), then redesigned in the Lab on 2026-10-22: the owner found the ring "so much basic" and asked for something unique and premium. The page opens on the three sizes and one in a button, named underneath, with Finish and With text as examples. The index card shows the three sizes alone (`preview.card`).

## The Lab rounds (2026-10-22)
- **Round one** (comet ring, chasing arc, petals, orbit, morph, wave): "still simpler like basic one".
- **Round two** (gyroscope, infinity, sliding tiles, dot matrix, liquid drops, square runner): the owner liked Dot matrix ("cool") and Infinity ("good").
- **Round three:** Infinity became one line going round and round, and "at the end it fills the whole infinity to show finished". The owner chose it for the library. It's ported from the Lab exactly (same path, line, timings and finish); the Slider taught that a rebuild that drifts from the Lab isn't what was chosen.

## What it is
- **The drawing:** an infinity on a 24 grid, 2.2 strokes, round caps and joins, in `currentColor`. A faint track (15%) under one line a quarter of the way round (24 hundredths, `pathLength={100}`).
- **One continuous stroke:** the path runs from the centre into the right loop, round it, back through the centre into the left loop and home, as one subpath. A dash restarts at every subpath, so two circles couldn't carry the line from one loop into the other.
- **API:** `size` (`sm | md | lg`, the icon sizes: 14, 16 and 20px, so it can stand in for an icon), `aria-label` (default "Loading"), `done` and `doneLabel` (default "Done"). Every native span prop passes through.

## Motion
- **Loading:** the line's dash offset travels −100 every 1.6s (`duration.slower * 3.2`), linear, forever, on from wherever it is. Only the stroke moves.
- **Done:** the line stops where it is and grows forward to the whole infinity (length 24 → 100, `duration.slower * 1.6`, `ease.out`), the track fading out under it (`duration.slower`, `ease.out`).
- **Back to loading:** it shrinks to the line (`duration.slow`, `ease.out`) and travels on from the same place.
- Both live in motion values (`useMotionValue`), so done and back never jump, and the dasharray is derived from the length.
- **Reduced motion:** the line doesn't travel; the drawing pulses its opacity between 1 and 0.4 (`duration.slower * 3`, `ease.inOut`). Done fills at once and holds still. Switching remounts the pulse, so it never lingers.
- **Before hydration** the line is drawn still at its start; motion starts once React runs.

## Accessibility
- `role="status"`, named by `aria-label`, or by `doneLabel` once done.
- Inside a button or beside text that already says what's happening, the spinner is `aria-hidden`; otherwise the button's name would become "Loading Saving…". The With text and Finish examples put `role="status"` on the row instead, so it's read once as its text.
- Live regions added to the page together with their content aren't always announced; for a reliable announcement, keep a live region on the page and change its text (as Loading Button does).

## Demos and tests
- **Demos:** Sizes (hero: Small, Medium, Large, and a disabled outline Button with "Saving…"), Finish (a row reading "Saving…" / "Saved" with a Finish / Restart button), With text, and the card.
- **Tests:** a status named Loading; another name and a size; one line ("24 76") travelling; done fills ("100 0") and is named Done; with reduced motion it pulses instead of travelling and holds still once done; a hidden spinner leaves the button's name alone; axe.

## Not built yet
- Dot matrix, the other direction the owner liked, as a variant.
- Loading Button using this component instead of its own spinner.
