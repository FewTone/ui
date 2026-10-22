# Slider: decisions

**Status:** published directly, without a Lab step (2026-10-16, roadmap build). Waiting for the owner's review on the dev server.

- **What it is:** one value or a range on Radix Slider: drag, click the track, arrow keys (Shift for ten steps), Page Up/Down, Home/End, a hidden input per thumb in forms, `minStepsBetweenThumbs`, vertical, inverted and right to left. shadcn's API: one `Slider` with `value` / `defaultValue` arrays (one number per thumb), plus `tooltip`, `formatValue` and `thumbLabels`.
- **Names:** the thumbs are what screen readers see (`role="slider"`), so the slider's `aria-label` / `aria-labelledby` move to them (left on the root they'd name nothing).
  - One thumb takes the name as it is.
  - A range's thumbs: "Price, minimum" / "Price, maximum" from `aria-label`; from `aria-labelledby`, the label's text then the thumb's own part, by pointing `aria-labelledby` at the label and the thumb itself.
  - `thumbLabels` sets each name outright.
  - `formatValue` also gives `aria-valuetext` ("$120").
- **Look:** flat. A `bg-muted` track 6px high, a `bg-primary` range, a 16px round thumb, `bg-background` with a 2px `border-primary`, no shadow. The root is 20px high (so the grown thumb fits and the track is easy to hit). Vertical is at least 11rem tall.
- **Motion** (the thumb is a cousin of Switch's):
  - **A track click glides** the thumb to the point on `spring.snappy` instead of jumping. On the way it stretches along the track with its speed, up to a quarter (the 1rem → 1.25rem of Switch's thumb), and lands round. Keyboard steps and changes from outside glide the same way; a held arrow key keeps turning the same spring.
  - **Dragging follows the pointer exactly:** values from a drag jump, with no spring (and `jump()` resets the speed, so a drag never stretches). Dragging straight after a track click, while the glide is still going, keeps turning the glide towards the pointer until it settles, then follows exactly.
  - **Elastic ends** (owner, 2026-10-22: "too basic… make it cool and creative"): dragging past either end, the track stretches towards the pointer, resisting harder the further it goes (`16px × (1 − e^(−over/32px))`, so it never reaches 16px), and slims by 1.2% of its thickness per pixel, like rubber. It stretches from its far end (a scale, so only transforms move), and the end's thumb rides the pull to stay on its tip. Released, it snaps back on `spring.bouncy`, the rare-delight spring, the overshoot reading as a band let go. The pointer's overrun comes from the slider's box while Radix holds the pointer capture. Off with reduced motion.
  - **The track wakes under the hand:** hovered (mouse only) or pressed, it thickens from 6px to 9px (`scale`, ×1.5) on `spring.snappy`, and settles back when you leave. Not while disabled.
  - **Pressed or dragged, the thumb grows** a little (×1.2, about 19px) on `spring.snappy`.
  - **The range follows the drawn thumbs,** so it never runs ahead of a gliding thumb (like Switch's colour following its thumb).
  - **`tooltip`:** the value shows above the thumb (beside it when vertical) while it's dragged, or once the keys move it, and stays while it has keyboard focus. It rises out of the thumb through the blur (`swap`) and sinks back. The library's tooltip look: `rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground`, `z-(--z-tooltip)`, tabular figures.
  - **Focus:** keyboard focus shows the outline ring round the thumb; pointer focus doesn't (Radix focuses with `focusVisible: false`).
  - **First paint and reduced motion:** nothing animates on first paint. With reduced motion the thumb jumps, doesn't stretch or grow, and the tooltip only fades.
- **How the glide works:** Radix places each thumb at its value at once, through an inline `left` on a wrapper we can't style. So the glide is drawn on top:
  - two motion values hold where the range's ends are drawn (percent), and two where Radix has placed them
  - each thumb is offset by the difference, converted with the slider's length less a thumb (offsetWidth, layout pixels, so a zoomed preview doesn't double it; measured with a ResizeObserver)
  - the range is our own full-size bar in the track, translated to the first thumb and scaled to the last from its start (transforms only; the track's `overflow-hidden` clips it)
  - the stretch comes from the drawn value's velocity (`useVelocity`), full at 800px/s
  - Radix's own `Range` part isn't used, since it jumps.
  - With three or more thumbs, the middle ones don't glide.
- **The thumb's parts:** the focusable `role="slider"` span carries the glide offset and the tooltip; a `pointer-events-none` knob inside it is what's scaled, so the tooltip and the hit area keep their size, and a press on the thumb is seen as a press on the thumb (Radix checks the event target).
- **Demos:**
  - **Hero:** Single (volume, %) and Range (price, $0–1000 in $10 steps, 5 steps apart), both with `tooltip`, named underneath.
  - **Card demo:** one slider.
  - **Examples:** With a label (aria-labelledby, the value beside the label, controlled), Vertical (three bands).
- **Tests:** a named slider with value and bounds; arrow keys, Page Up, Home, End; a track click goes to the point and focuses the thumb (with a stubbed bounding box); a range named from aria-label and from a visible label, moved with the keys; formatValue as aria-valuetext and in the tooltip, which goes when focus leaves; disabled; axe for single and range.
- **Not built yet:** marks or ticks under the track; a tooltip that's always on; sizes. The tooltip can be covered by a later positioned sibling, since Radix's thumb wrapper is a stacking context; a portalled tooltip would fix that if it matters.
