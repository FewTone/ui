"use client";

import type { ReactNode } from "react";
import { ControlBar } from "./control-bar";
import { Detents } from "./detents";
import { SplitTrack } from "./split-track";
import { ValueThumb } from "./value-thumb";

/*
 * General-purpose slider directions side by side for the owner to try (2026-10-22). The first round's ruler,
 * level bars, knob and scrubber were each for one kind of value, so they gave way to these: four ways to set
 * any number in a range, each built differently. Every one is a real slider: arrow keys, Page Up/Down,
 * Home/End, a name and a value for screen readers.
 */

const directions: { title: string; idea: string; try: string; demo: ReactNode }[] = [
  {
    title: "Control bar",
    idea: "The fill is the control, like iOS Control Center. The label inverts where the fill covers it.",
    try: "Drag anywhere: it moves by how far you drag, so a tap never jumps. Pull past an end.",
    demo: <ControlBar />,
  },
  {
    title: "Split track",
    idea: "A thick track split round a tall, thin handle, as in Android's newest sliders.",
    try: "Click anywhere and the handle glides there; drag it. Pressing slims the handle.",
    demo: <SplitTrack />,
  },
  {
    title: "Value thumb",
    idea: "A dot on a thin line that grows into a pill with the value inside when you reach for it.",
    try: "Hover, tab to it or drag: the number is the thumb, with no tooltip to follow.",
    demo: <ValueThumb />,
  },
  {
    title: "Detents",
    idea: "A dot at every tenth; drag near one and the thumb snaps onto it, with a small pulse.",
    try: "Drag slowly past the dots. Values between them still work.",
    demo: <Detents />,
  },
];

export function SliderDirections() {
  return (
    <section className="grid gap-(--space-block)">
      <header className="grid gap-(--space-title)">
        <h2 className="text-h3">Slider: four directions</h2>
        <p className="max-w-prose text-body text-muted-foreground">
          Each sets a number in its own way. Try them with the mouse and the keys, then pick one (or say what
          to take from each) and it gets built into the library.
        </p>
      </header>
      <ul className="grid gap-(--space-grid) md:grid-cols-2">
        {directions.map((direction, index) => (
          <li
            key={direction.title}
            className="grid gap-(--space-stack) rounded-xl bg-card p-(--space-card-x) shadow-card"
          >
            <div className="grid gap-1">
              <span className="text-overline font-mono text-muted-foreground uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-body font-medium">{direction.title}</span>
              <span className="text-body-sm text-muted-foreground">{direction.idea}</span>
            </div>
            <div className="flex min-h-44 items-center justify-center">{direction.demo}</div>
            <span className="text-caption text-muted-foreground">{direction.try}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
