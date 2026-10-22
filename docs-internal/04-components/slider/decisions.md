# Slider: decisions

**Status:** published 2026-10-16 (roadmap build). Redesigned on 2026-10-22 as the **value thumb**, chosen by the owner in the Lab from eight directions in two rounds: a control bar (iOS Control Center), a ruler dial, level bars, a knob and a scrubber (the first round; all but the control bar were for one kind of value), then the control bar refined, a split track (Material 3 Expressive), the value thumb and detents. The Lab's concepts were deleted once it was chosen. Before that it was a track with a round thumb, a value tooltip and elastic ends ("too basic").

- **What it is:** one value or a range, the WAI-ARIA slider pattern built here rather than on Radix Slider (2026-10-22): each thumb is a `role="slider"` with arrow keys (Shift for ten steps), Page Up/Down (ten steps), Home/End; a press on the track moves the nearest thumb there and focuses it; a range's thumbs can't cross (`minStepsBetweenThumbs`); vertical, right to left and inverted; `onValueCommit` when a drag ends or a key moves it; with `name`, a hidden input per value for forms.
- **Why not Radix (2026-10-22):** the first library version of the value thumb kept Radix and drew the pill on top of Radix's own thumb placement (an offset from where Radix put it, inside the ends). The owner: "really different from the Lab, not smooth at all, we need it exactly the same." So the Lab's code is the component now, line for line: the thumb's centre placed straight from its value along the whole track (`left` / `top` at the value's percent, so the server's HTML draws it in place before anything is measured: placed from a measured length, it sat at a guess until the page woke up, owner 2026-10-22), the glide on `spring.snappy` from a motion value per thumb (jumped while dragging), the pointer read off the whole slider, the 14px dot and 46×26 pill, the speed stretch from the position's velocity, the track's ×1.5 thickening. Radix's keyboard, names and form inputs are rebuilt to match its behaviour.
- **Names:** the thumbs are what screen readers see (`role="slider"`), so the slider's `aria-label` / `aria-labelledby` move to them (left on the root they'd name nothing).
  - One thumb takes the name as it is.
  - A range's thumbs: "Price, minimum" / "Price, maximum" from `aria-label`; from `aria-labelledby`, the label's text then the thumb's own part, by pointing `aria-labelledby` at the label and the thumb itself.
  - `thumbLabels` sets each name outright.
  - `format` (Intl options) also gives `aria-valuetext` ("$120"), the same text the pill shows.
- **The value thumb (2026-10-22):** a thin track and a small round thumb that, the moment you reach for it, grows into a pill with the value inside. The number is the thumb, so there's no tooltip to float or follow, and at rest the slider is quiet: a line and a dot.
  - **Reaching for it:** the pointer over the slider (mouse only) opens every thumb (a range shows both values); keyboard focus with the keys, or a press, opens the thumb in use. Leaving, it shrinks back to a dot.
  - **The pill** grows from the 14px dot to 26px tall and as wide as its value plus 10px either side, never narrower than 46px (the Lab's size; a fixed 46px let "51 hours" spill out, owner 2026-10-22; the value's width is measured by a ResizeObserver, so a change of width glides on the same spring), on `spring.snappy`, centred on the thumb so growing never moves where it sits. Its number comes through the blur as it opens (`duration.base`, `ease.out`) and leaves quicker (`duration.fast`, `ease.in`).
  - **The number flows:** our Number Ticker, with the slider's `format` and `locale`, so its digits roll as it changes and a quick drag counts through the values. Nothing rolls when the pill opens (`from` is the value).
  - **It stretches with its speed:** moving, the pill stretches along the track by up to a quarter (full at 900px/s), like Switch's thumb, and settles round when it stops.
  - **The track wakes:** while a thumb is open, the 4px track thickens to 6px (`scale`, ×1.5) on `spring.snappy`.
  - **API:** `format` and `locale` (Intl options, like Number Ticker) replace `tooltip` and `formatValue`: the pill always shows the value when open, and one format serves the pill and screen readers. Breaking, but nothing was released.
  - **Removed with the redesign:** the elastic ends (the track stretching past an end and snapping back on `spring.bouncy`), the press-to-grow thumb and the tooltip. The motion rule for elastic ends went with them.
- **Look:** flat and neutral: a `bg-muted` track 4px high in a 44px-tall slider (the Lab's), a `bg-primary` range, a `bg-primary` thumb, the value in `primary-foreground`, `text-xs` medium, tabular. Disabled: the disabled opacity, no hover.
- **Motion** (the thumb is a cousin of Switch's):
  - **A track click glides** the thumb to the point on `spring.snappy` instead of jumping; keyboard steps and outside changes glide the same way.
  - **Dragging follows the pointer exactly:** values from a drag jump, with no spring (and `jump()` resets the speed).
  - **The range follows the drawn thumbs,** so it never runs ahead of a gliding thumb.
  - **Focus:** keyboard focus shows the outline ring round the pill; pointer focus doesn't.
  - **First paint and reduced motion:** nothing animates on first paint. With reduced motion the thumb jumps, the pill opens at once without stretching, the track keeps its thickness and the number only fades.
- **How the glide works:** Radix places each thumb at its value at once, through an inline `left` on a wrapper we can't style. So the glide is drawn on top:
  - two motion values hold where the range's ends are drawn (percent), and two where Radix has placed them
  - each thumb is offset by the difference, converted with the slider's length less a thumb (offsetWidth, layout pixels, so a zoomed preview doesn't double it; measured with a ResizeObserver)
  - the range is our own full-size bar in the track, translated to the first thumb and scaled to the last from its start (transforms only; the track's `overflow-hidden` clips it)
  - the stretch comes from the drawn value's velocity (`useVelocity`), full at 800px/s
  - Radix's own `Range` part isn't used, since it jumps.
  - With three or more thumbs, the middle ones don't glide.
- **The thumb's parts:** the thumb is one element: the focusable `role="slider"` span is the dot and the pill (`data-open` while it's open), with the Number Ticker inside (aria-hidden; the thumb's `aria-valuenow` / `aria-valuetext` is what's read). It's centred on its value's point (translated −50%), so it overhangs the ends at 0 and 100, as in the Lab.
- **Demos:**
  - **Hero:** Single (volume, `unit: percent`) and Range (price in whole dollars, $0–1000 in $10 steps, 5 steps apart), named underneath.
  - **Card demo:** one slider.
  - **Examples:** With a label (aria-labelledby, the value beside the label, controlled), Vertical (three bands).
- **Tests:** a named slider with value and bounds; arrow keys, Page Up, Home, End; a track click goes to the point and focuses its thumb; a range's thumbs named from `aria-label` and from a visible label; the pill opening with the keys and on hover and closing when focus leaves, with the formatted value inside and as `aria-valuetext`; disabled; axe.
- **Not built yet:** marks or ticks under the track; sizes; a pill that stays open; two pills of a range overlapping when the thumbs are close (they stack).
