# Pitfalls

Real bugs, each found while building and checked in a browser. Symptom first, so you can find yours.

## Indicators and layout animations

**A sliding pill paints over the labels it passes.**
The items are stacking contexts (`z-index`, `isolate`, `transform`, `opacity < 1`, `filter` on them). Make the *set* `isolation: isolate`, give the pill `z-index: -1`, and keep the items free of stacking contexts.

**A pill flies between two separate tab sets.**
Shared-layout ids are global. Scope each set (`<LayoutGroup id={useId()}>` in motion).

**The indicator floats above or below its row mid-slide.**
A layout animation measures on-screen boxes once. Something moved the container a frame later (content below gliding to a new height in a vertically centred layout). Keep the container still (anchor to the top, reserve height), or place the indicator by offsets inside the set.

**Movement doubles inside a zoomed or scaled preview** (a thumb overshoots its track).
Layout animations use on-screen boxes, which CSS `zoom` and scaled parents enlarge. For controls, place things with numbers in layout pixels (`offsetLeft`, `offsetWidth`, `x`, width).

**A highlight drifts while its list scrolls.**
Layout animations in scroll containers need the scroller marked (`layoutScroll`), or place the highlight by offsets relative to the scroller.

**A highlight flies in from where it last was.**
Motion remembers the last box for a `layoutId`. Give each new appearance (after it has fully faded) a fresh id, or place it with no transition when it's coming back from nothing.

**A highlight mounting inside a list pops in instead of fading.**
`AnimatePresence initial={false}` blocks the entrance of *every* motion element under a child that was present at first, permanently. Reset it inside the child (`<PresenceContext.Provider value={null}>`).

## Springs

**The first slide overshoots badly; later ones are fine.**
Placing a motion value with `set()` right before a spring counts the jump as velocity. Use `jump()` (resets velocity) to place it, then animate.

**A drawer shows a sliver of the page at its edge as it lands.**
Spring snappy overshoots about 1%. Extend the panel 8px past the screen edge (a border or padding in its own colour) so the overshoot shows more panel.

**The page below bounces when a section opens.**
A spring on height overshoots. Use an eased tween, or a spring with damping ratio ≥ 0.9 (stiffness 120 / damping 20).

**The blur goes negative / flickers on entry.**
Opacity or blur on a spring overshoots. Spring only the transform; tween opacity and filter.

## Leftovers

**Fixed children get clipped or positioned wrongly after an animation.**
A leftover `filter` (even `blur(0)`) or `transform` makes the element a containing block for fixed children and a stacking context. Clear them when the animation ends (`transitionEnd: { filter: "none" }`, remove inline transforms).

**The next animation starts from the wrong place.**
A forwards-filling Web Animation is still applied. Cancel finished animations, or commit their styles and cancel.

**Memory and CPU climb on a page with loops.**
Loops never paused or cancelled. Pause off-screen and in hidden tabs; cancel on unmount; disconnect observers.

## SVG

**An SVG part loses its position when animated.**
A CSS `transform` replaces the element's `transform` attribute. Wrap it in a `<g transform="…">` and animate the inner element (or a wrapper span for icons).

**Two instances of an icon break each other's masks.**
Mask and gradient ids are global. Generate one per instance (`useId()`).

**A stroke dash jumps at a corner of the path.**
A dash restarts at every subpath (`M` command). Draw the path as one continuous subpath.

**A dot remains where a check or arc should be gone.**
Round line caps draw a dot at length 0. Tie the stroke's opacity to its length.

## React specifics

**A measurement never happens / an animation never starts in development.**
A merged ref that's a new function every render detaches and reattaches each update, and Strict Mode attaches refs twice. Make merged refs stable (`useCallback`), and don't "take" a one-time value on the first attach.

**`AnimatePresence` doesn't animate siblings that leave.**
It needs keyed children. Unkeyed static siblings all share an empty key; pass `Children.toArray(children)`, which keys them by position.

**Content flashes in its final place, then animates.**
It was shown one render before the animation started (a primitive's presence logic). Mount it yourself in the same commit and start the animation in a layout effect, before paint.

**Server HTML is wrong until hydration** (a thumb at a guessed spot until hover).
It was placed from a measurement. Place it with percentages or CSS so server HTML is already right; measure only to refine.

**`initial={false}` was forgotten** and everything animates on page load.
Every motion element whose first state is its resting state needs `initial={false}`.

## Loops

**A marquee shifts when you hover it, then snaps back when you leave.**
`playbackRate` changed every frame on a compositor animation lets the two clocks drift. Pause it and step `currentTime` by hand while easing the speed, then play again.

**Skeletons sweep out of step.**
Each started when it mounted. Set `animation.startTime = 0` on the document timeline so every loop shares one phase.

## Scrolling and overlays

**A list's fade overlay scrolls with the content, or the list scrolls forever.**
Overlays inside the scroller move with it and inflate `scrollHeight`. Put fades outside the scroll container; measure the end from the last visible child.

**A sub-menu is clipped by its parent menu.**
The parent's entrance left a `transform`/`filter` (fill mode `both`), making it the containing block. Portal sub-menus.

**A toast list is trapped inside an animated container.**
`position: fixed` inside a transformed or filtered parent is relative to that parent. Portal it to the end of `<body>`.

## Timers

**Two related animations drift apart** (a toggle's colour and its thumb, a fill and its label).
They were synced with separate timers. Drive one from the other's live value (derived motion values).

**A toast never closes after its siblings were dismissed.**
The primitive's pause flag was reset only by listeners that detached with the last toast. Own the timer; pause on pointer, focus and `document.hidden`; reset when the last toast goes.

**Tooltips along a toolbar start waiting again after resting on one.**
The closing tooltip started the skip timer while the next was showing. Keep the group "warm" while any tooltip shows and for the hand-over window after.
