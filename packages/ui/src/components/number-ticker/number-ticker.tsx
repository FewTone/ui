"use client";

import { flow as timing } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type CSSProperties,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
 * Number Ticker: a number that flows to its value (owner's roadmap, 2026-10-16), for prices, stats and counters.
 * Light DOM, no dependencies (licence notice below).
 * - Each digit is a column of 0–9 placed by CSS: one number, the digit it shows, decides every row's offset
 *   through mod(), so only its neighbours are ever in view. A spin animates that one number (a registered custom
 *   property) from the old digit to the new, on a spring sampled into linear() (`flow` in our motion presets).
 * - The number fades at its edges, 0.25em above and below (digits spin out of sight) and 0.5em at the sides
 *   (characters come, go and glide), through our shipped `--size-roll-fade` tokens.
 * - When it changes length, the integer part holds to its right and the fraction to its left: each character
 *   that stays glides to its new place, and the number's width glides as a counter-scaled transform, so text
 *   beside it moves smoothly. New characters fade in, a new digit spinning up from 0; characters that go stay
 *   where they were and fade out, a leaving digit spinning down to 0. Changed signs cross-fade.
 * - Continuous (on by default): when a higher place changes, the unchanged places below
 *   it spin a whole turn, so 9 → 2,481 reads as counting up.
 * - It rolls from `from` once it's half in view (once), or on mount with startOnView={false). The server sends
 *   the final value, so it's indexed and hydrates without a mismatch.
 * - Screen readers get the formatted value: the number is an image named by it, so the moving parts are never read.
 * - With reduced motion, or a browser without CSS mod() and linear(), it changes without moving.
 */

/*
 * Portions of this file are adapted from number-flow, © 2024 Maxwell Barvian, under the MIT licence:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/** A part of the formatted number */
type Part = { type: string; value: number | string; key: string; pos?: number };
type Data = { pre: Part[]; integer: Part[]; fraction: Part[]; post: Part[]; label: string; value: number };

/** How much of it shows before it rolls, so the roll isn't over before it's seen */
const IN_VIEW = 0.5;
/** The digits a place shows */
const LENGTH = 10;
/** The registered custom properties the animations run on */
const D_OPACITY = "--_ticker-d-opacity";
const D_WIDTH = "--_ticker-d-width";
const DX = "--_ticker-dx";
const D = "--_ticker-d";

/** Half the fade above and below, on a whole pixel, pads each row; the fade itself is twice that */
const PAD = "round(nearest, calc(var(--size-roll-fade) / 2), 1px)";
const FADE_Y = `calc(${PAD} * 2)`;
const FADE_X = "var(--size-roll-fade-x)";
const FADE_X_SCALED = `calc(${FADE_X} / var(--scale-x))`; // check-tokens-ignore: the flow's own working variable, local to its stylesheet
const CORNER = "#000 0, transparent 71%"; // check-tokens-ignore: a mask works on alpha; #000 is opacity, never painted

/** The flow's stylesheet, with our tokens. One copy for the page: React hoists and dedupes it. */
const CSS_TEXT = `[data-slot=number-ticker]{display:inline-block;direction:ltr;white-space:nowrap;isolation:isolate;line-height:1}
.ticker-number,.ticker-number-inner{display:inline-block;transform-origin:left top}
.ticker-number{--scale-x:calc(1 + var(${D_WIDTH}) / var(--width));transform:translateX(var(${DX})) scaleX(var(--scale-x));margin:0 calc(-1 * ${FADE_X});position:relative;-webkit-mask-image:linear-gradient(to right,transparent 0,#000 ${FADE_X_SCALED},#000 calc(100% - ${FADE_X_SCALED}),transparent),linear-gradient(to bottom,transparent 0,#000 ${FADE_Y},#000 calc(100% - ${FADE_Y}),transparent 100%),radial-gradient(at bottom right,${CORNER}),radial-gradient(at bottom left,${CORNER}),radial-gradient(at top left,${CORNER}),radial-gradient(at top right,${CORNER});-webkit-mask-size:100% calc(100% - ${FADE_Y} * 2),calc(100% - ${FADE_X_SCALED} * 2) 100%,${FADE_X_SCALED} ${FADE_Y},${FADE_X_SCALED} ${FADE_Y},${FADE_X_SCALED} ${FADE_Y},${FADE_X_SCALED} ${FADE_Y};-webkit-mask-position:center,center,top left,top right,bottom right,bottom left;-webkit-mask-repeat:no-repeat;mask-image:linear-gradient(to right,transparent 0,#000 ${FADE_X_SCALED},#000 calc(100% - ${FADE_X_SCALED}),transparent),linear-gradient(to bottom,transparent 0,#000 ${FADE_Y},#000 calc(100% - ${FADE_Y}),transparent 100%),radial-gradient(at bottom right,${CORNER}),radial-gradient(at bottom left,${CORNER}),radial-gradient(at top left,${CORNER}),radial-gradient(at top right,${CORNER});mask-size:100% calc(100% - ${FADE_Y} * 2),calc(100% - ${FADE_X_SCALED} * 2) 100%,${FADE_X_SCALED} ${FADE_Y},${FADE_X_SCALED} ${FADE_Y},${FADE_X_SCALED} ${FADE_Y},${FADE_X_SCALED} ${FADE_Y};mask-position:center,center,top left,top right,bottom right,bottom left;mask-repeat:no-repeat}/* check-tokens-ignore: the flow's own working variables, local to this stylesheet; #000 is mask alpha */
.ticker-number-inner{padding:${PAD} ${FADE_X};transform:scaleX(calc(1 / var(--scale-x))) translateX(calc(-1 * var(${DX})))}/* check-tokens-ignore: the flow's own working variables, local to this stylesheet; #000 is mask alpha */
[data-slot=number-ticker] > :not(.ticker-number){z-index:5}
.ticker-section,.ticker-symbol{display:inline-block;position:relative;isolation:isolate}
.ticker-section::after{content:'\\200b';display:inline-block}
.ticker-justify-left{transform-origin:center left}
.ticker-justify-right{transform-origin:center right}
.ticker-section > [inert],.ticker-symbol > [inert]{margin:0 !important;position:absolute !important;z-index:-1}
.ticker-digit{display:inline-block;position:relative;--c:var(--current) + var(${D})}/* check-tokens-ignore: the flow's own working variables, local to this stylesheet; #000 is mask alpha */
.ticker-digit-num,.ticker-number .ticker-section::after{padding:${PAD} 0}
.ticker-digit-num{display:inline-block;--offset-raw:mod(var(--length) + var(--n) - mod(var(--c),var(--length)),var(--length));--offset:calc(var(--offset-raw) - var(--length) * round(down,var(--offset-raw) / (var(--length) / 2),1));--y:clamp(-100%,var(--offset) * 100%,100%);transform:translateY(var(--y))}/* check-tokens-ignore: the flow's own working variables, local to this stylesheet; #000 is mask alpha */
.ticker-digit-num[inert]{position:absolute;top:0;left:50%;transform:translateX(-50%) translateY(var(--y))}/* check-tokens-ignore: the flow's own working variables, local to this stylesheet; #000 is mask alpha */
.ticker-digit:not(.is-spinning) .ticker-digit-num[inert]{display:none}
.ticker-symbol-value{display:inline-block;mix-blend-mode:plus-lighter;white-space:pre}
.ticker-justify-left .ticker-symbol > [inert]{left:0}
.ticker-justify-right .ticker-symbol > [inert]{right:0}
.ticker-presence{opacity:calc(1 + var(${D_OPACITY}))}
.ticker-static{display:inline-block}
.ticker-static > span{display:inline-block;padding:${PAD} 0;white-space:pre}`;

/** Whether this browser can run the flow: CSS mod(), linear() easing and registered custom properties */
let able: boolean | null = null;
function canAnimate() {
  if (able !== null) return able;
  const modulo = typeof CSS !== "undefined" && !!CSS.supports?.("line-height", "mod(1,1)");
  let linear = false;
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
    linear = true;
  } catch {
    linear = false;
  }
  let registered = false;
  try {
    CSS.registerProperty({ name: D_OPACITY, syntax: "<number>", inherits: false, initialValue: "0" });
    CSS.registerProperty({ name: DX, syntax: "<length>", inherits: true, initialValue: "0px" });
    CSS.registerProperty({ name: D_WIDTH, syntax: "<number>", inherits: false, initialValue: "0" });
    CSS.registerProperty({ name: D, syntax: "<number>", inherits: true, initialValue: "0" });
    registered = true;
  } catch {
    // Already registered by another ticker on the page, or not supported
    registered = typeof CSS !== "undefined" && typeof CSS.registerProperty === "function";
  }
  able = modulo && linear && registered;
  return able;
}

/**
 * The formatted number in parts: what comes before it (a currency sign), the integer digits and
 * separators keyed from the right (so the ones stay the ones as it grows), the fraction keyed from the left, and
 * what comes after (a percent sign). Digits carry their place: 0 the ones, -1 the tenths.
 */
function toData(value: number, formatter: Intl.NumberFormat, prefix?: string, suffix?: string): Data {
  const parts: { type: string; value: string }[] = formatter.formatToParts(value);
  if (prefix) parts.unshift({ type: "prefix", value: prefix });
  if (suffix) parts.push({ type: "suffix", value: suffix });
  const pre: Part[] = [];
  const integers: Part[] = [];
  const fraction: Part[] = [];
  const post: Part[] = [];
  const counts: Record<string, number> = {};
  const keyOf = (type: string) => {
    counts[type] = (counts[type] ?? -1) + 1;
    return `${type}:${counts[type]}`;
  };
  let label = "";
  let seenInteger = false;
  let seenDecimal = false;
  for (const part of parts) {
    label += part.value;
    const type = part.type === "minusSign" || part.type === "plusSign" ? "sign" : part.type;
    if (type === "integer") {
      seenInteger = true;
      for (const char of part.value) integers.push({ type, value: Number.parseInt(char, 10), key: "" });
    } else if (type === "group") integers.push({ type, value: part.value, key: "" });
    else if (type === "decimal") {
      seenDecimal = true;
      fraction.push({ type, value: part.value, key: keyOf(type) });
    } else if (type === "fraction") {
      for (const char of part.value) {
        const key = keyOf(type);
        fraction.push({ type, value: Number.parseInt(char, 10), key, pos: -1 - (counts[type] ?? 0) });
      }
    } else (seenInteger || seenDecimal ? post : pre).push({ type, value: part.value, key: keyOf(type) });
  }
  const integer: Part[] = [];
  for (let index = integers.length - 1; index >= 0; index--) {
    const part = integers[index];
    if (!part) continue;
    const key = keyOf(part.type);
    integer.unshift(part.type === "integer" ? { ...part, key, pos: counts[part.type] } : { ...part, key });
  }
  return { pre, integer, fraction, post, label, value };
}

/** The server's markup, and the first paint before the flow takes over: each character in a padded box */
function staticHtml(data: Data) {
  const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const all = [...data.pre, ...data.integer, ...data.fraction, ...data.post];
  return `<span class="ticker-static">${all.map((part) => `<span>${escapeHtml(String(part.value))}</span>`).join("")}</span>`;
}

const span = (props: { className?: string; part?: string; textContent?: string }, children: Node[] = []) => {
  const element = document.createElement("span");
  if (props.className) element.className = props.className;
  if (props.textContent !== undefined) element.textContent = props.textContent;
  for (const child of children) element.appendChild(child);
  return element;
};

/** Where a popped character sits, from the edge its section holds to */
const offsetFrom = (element: HTMLElement, edge: "left" | "right") =>
  edge === "left"
    ? element.offsetLeft
    : ((element.offsetParent instanceof HTMLElement ? element.offsetParent.offsetWidth : 0) ?? 0) -
      element.offsetWidth -
      element.offsetLeft;

const accumulate = (effect: EffectTiming): KeyframeAnimationOptions => ({
  ...effect,
  composite: "accumulate",
});

type Options = { trend: number | ((before: number, after: number) => number); continuous: boolean };

/** The flow on one host: a plain object driving our span */
class Flow {
  host: HTMLElement;
  options: Options;
  data: Data | null = null;
  animated = true;
  reduce = false;
  computedAnimated = false;
  computedTrend = 0;
  /** Continuous: the highest place that changes, or nothing */
  changedUpTo: number | undefined;
  private wasReady = false;
  private finishing: AbortController | undefined;
  private pre!: SymbolSection;
  private num!: NumberPart;
  private post!: SymbolSection;

  constructor(host: HTMLElement, options: Options) {
    this.host = host;
    this.options = options;
  }

  private ready() {
    return (
      canAnimate() && this.animated && !this.reduce && this.host.ownerDocument.visibilityState !== "hidden"
    );
  }

  set(data: Data) {
    if (data === this.data) return;
    if (!this.data) {
      this.data = data;
      this.host.replaceChildren();
      this.pre = new SymbolSection(this, data.pre, "right");
      this.num = new NumberPart(this, data.integer, data.fraction);
      this.post = new SymbolSection(this, data.post, "left");
      this.host.append(this.pre.el, this.num.el, this.post.el);
      return;
    }
    const before = this.data;
    this.data = data;
    const { trend, continuous } = this.options;
    this.computedTrend = typeof trend === "function" ? trend(before.value, data.value) : trend;
    this.computedAnimated =
      this.ready() &&
      // Nothing to animate while it isn't laid out (in a hidden tab panel, say)
      this.host.offsetWidth > 0 &&
      this.host.offsetHeight > 0;
    this.changedUpTo = continuous && this.computedTrend ? highestChange(before, data) : undefined;
    this.willUpdate();
    this.pre.update(data.pre);
    this.num.update(data.integer, data.fraction);
    this.post.update(data.post);
    this.didUpdate();
  }

  /** Changing `animated` finishes whatever is running */
  setAnimated(animated: boolean) {
    if (animated === this.animated) return;
    this.animated = animated;
    for (const animation of this.animations()) animation.finish();
  }

  animations() {
    return this.host.getAnimations?.({ subtree: true }) ?? [];
  }

  private willUpdate() {
    this.wasReady = this.ready();
    if (!this.wasReady) return;
    this.pre.willUpdate();
    this.num.willUpdate();
    this.post.willUpdate();
  }

  private didUpdate() {
    if (!this.computedAnimated || !this.wasReady) return;
    if (this.finishing) this.finishing.abort();
    this.pre.didUpdate();
    this.num.didUpdate();
    this.post.didUpdate();
    const controller = new AbortController();
    Promise.all(this.animations().map((animation) => animation.finished)).then(
      () => {
        if (controller.signal.aborted) return;
        this.host.dispatchEvent(new Event("animationsfinish"));
        this.finishing = undefined;
      },
      () => {},
    );
    this.finishing = controller;
  }

  /** Stops everything, for unmounting */
  destroy() {
    for (const animation of this.animations()) animation.cancel();
  }
}

/** Continuous: the highest place where the digits differ, either way */
function highestChange(before: Data, after: Data) {
  const digits = (data: Data) =>
    data.integer.concat(data.fraction).filter((part) => part.type === "integer" || part.type === "fraction");
  const old = digits(before);
  const next = digits(after);
  const gone = old.find(
    (part) => !next.find((other) => other.pos === part.pos && other.value === part.value),
  );
  const came = next.find(
    (part) => !old.find((other) => part.pos === other.pos && part.value === other.value),
  );
  const a = gone?.pos;
  const b = came?.pos;
  return a == null ? b : b == null ? a : Math.max(a, b);
}

/** The number itself: the integer and fraction sections, inside the faded, counter-scaled frame */
class NumberPart {
  el: HTMLElement;
  private integer: IntegerSection;
  private fraction: IntegerSection;
  private prevWidth = 0;
  private prevLeft = 0;

  constructor(flow: Flow, integer: Part[], fraction: Part[]) {
    this.integer = new IntegerSection(flow, integer, "right");
    this.fraction = new IntegerSection(flow, fraction, "left");
    const inner = span({ className: "ticker-number-inner" }, [this.integer.el, this.fraction.el]);
    this.el = span({ className: "ticker-number" }, [inner]);
  }

  willUpdate() {
    this.prevWidth = this.el.offsetWidth;
    this.prevLeft = this.el.getBoundingClientRect().left;
    this.integer.willUpdate();
    this.fraction.willUpdate();
  }

  update(integer: Part[], fraction: Part[]) {
    this.integer.update(integer);
    this.fraction.update(fraction);
  }

  didUpdate() {
    const rect = this.el.getBoundingClientRect();
    this.integer.didUpdate();
    this.fraction.didUpdate();
    const dx = this.prevLeft - rect.left;
    const width = this.el.offsetWidth;
    const dw = this.prevWidth - width;
    this.el.style.setProperty("--width", String(width));
    this.el.animate({ [DX]: [`${dx}px`, "0px"], [D_WIDTH]: [dw, 0] }, accumulate(timing.transform));
  }
}

/** Something that fades in as it comes and out as it goes, then removes itself */
class Presence {
  el: HTMLElement;
  protected flow: Flow;
  private shown = true;
  private onRemove: (() => void) | undefined;
  private remove = () => {
    this.el.remove();
    this.onRemove?.();
  };

  constructor(
    flow: Flow,
    el: HTMLElement,
    { onRemove, animateIn = false }: { onRemove?: () => void; animateIn?: boolean },
  ) {
    this.flow = flow;
    this.el = el;
    this.onRemove = onRemove;
    el.classList.add("ticker-presence");
    if (flow.computedAnimated && animateIn)
      el.animate({ [D_OPACITY]: [-0.9999, 0] }, accumulate(timing.opacity));
  }

  get present() {
    return this.shown;
  }

  set present(present: boolean) {
    if (this.shown === present) return;
    this.shown = present;
    if (present) this.el.removeAttribute("inert");
    else this.el.setAttribute("inert", "");
    if (!this.flow.computedAnimated) {
      if (!present) this.remove();
      return;
    }
    this.el.style.setProperty(D_OPACITY, present ? "0" : "-.999");
    this.el.animate({ [D_OPACITY]: present ? [-0.9999, 0] : [0.999, 0] }, accumulate(timing.opacity));
    if (present) this.flow.host.removeEventListener("animationsfinish", this.remove);
    else this.flow.host.addEventListener("animationsfinish", this.remove, { once: true });
  }
}

type Edge = "left" | "right";

abstract class Char extends Presence {
  section: Section;
  value: number | string;
  constructor(
    section: Section,
    value: number | string,
    el: HTMLElement,
    options: { onRemove?: () => void; animateIn?: boolean },
  ) {
    super(section.flow, el, options);
    this.section = section;
    this.value = value;
  }
  abstract willUpdate(sectionRect: DOMRect): void;
  abstract update(value: number | string): void;
  abstract didUpdate(sectionRect: DOMRect): void;
}

/** One digit: a column of 0–9 whose rows CSS places from the digit it shows */
class Digit extends Char {
  pos: number;
  private numbers: HTMLElement[];
  private prevValue = 0;
  private prevCenter = 0;
  private stopSpinning = () => this.el.classList.remove("is-spinning");

  constructor(
    section: Section,
    type: string,
    value: number,
    pos: number,
    options: { onRemove?: () => void; animateIn?: boolean },
  ) {
    const numbers = Array.from({ length: LENGTH }, (_, n) => {
      const number = span({ className: "ticker-digit-num", textContent: String(n) });
      if (n !== value) number.setAttribute("inert", "");
      number.style.setProperty("--n", String(n));
      return number;
    });
    const el = span({ className: `ticker-digit ticker-${type}-digit` }, numbers);
    el.style.setProperty("--current", String(value));
    el.style.setProperty("--length", String(LENGTH));
    super(section, value, el, options);
    this.pos = pos;
    this.numbers = numbers;
  }

  private centre(rect: DOMRect, sectionRect: DOMRect) {
    const edge = this.section.justify;
    const offset = rect[edge] - sectionRect[edge];
    const half = rect.width / 2;
    return edge === "left" ? offset + half : offset - half;
  }

  willUpdate(sectionRect: DOMRect) {
    this.prevValue = Number(this.value);
    this.prevCenter = this.centre(this.el.getBoundingClientRect(), sectionRect);
  }

  update(value: number | string) {
    const digit = Number(value);
    this.el.style.setProperty("--current", String(digit));
    this.numbers.forEach((number, n) => {
      if (n === digit) number.removeAttribute("inert");
      else number.setAttribute("inert", "");
    });
    this.value = digit;
  }

  didUpdate(sectionRect: DOMRect) {
    const shift = this.prevCenter - this.centre(this.el.getBoundingClientRect(), sectionRect);
    if (shift)
      this.el.animate({ transform: [`translateX(${shift}px)`, "none"] }, accumulate(timing.transform));
    const delta = this.delta();
    if (!delta) return;
    this.el.classList.add("is-spinning");
    this.el.animate({ [D]: [-delta, 0] }, accumulate(timing.transform));
    this.flow.host.addEventListener("animationsfinish", this.stopSpinning, { once: true });
  }

  /** How far it spins: the way the trend says, round the column if it has to; a whole turn when continuous */
  private delta() {
    const value = Number(this.value);
    const diff = value - this.prevValue;
    const { changedUpTo, computedTrend } = this.flow;
    if (!diff && changedUpTo != null && changedUpTo >= this.pos) return LENGTH * computedTrend;
    const trend = computedTrend || Math.sign(diff);
    if (trend < 0 && value > this.prevValue) return value - LENGTH - this.prevValue;
    if (trend > 0 && value < this.prevValue) return LENGTH - this.prevValue + value;
    return diff;
  }
}

/** A separator, sign or symbol: a changed one cross-fades */
class Symbol_ extends Char {
  type: string;
  private values = new Map<string, Presence>();
  private prevOffset = 0;

  constructor(
    section: Section,
    type: string,
    value: string,
    options: { onRemove?: () => void; animateIn?: boolean },
  ) {
    const inner = span({ className: "ticker-symbol-value", textContent: value });
    super(section, value, span({ className: `ticker-symbol ticker-${type}` }, [inner]), options);
    this.type = type;
    this.values.set(value, new Presence(this.flow, inner, { onRemove: () => this.values.delete(value) }));
  }

  willUpdate(sectionRect: DOMRect) {
    if (this.type === "decimal") return;
    const edge = this.section.justify;
    this.prevOffset = this.el.getBoundingClientRect()[edge] - sectionRect[edge];
  }

  update(value: number | string) {
    const text = String(value);
    if (this.value !== text) {
      const old = this.values.get(String(this.value));
      if (old) old.present = false;
      const kept = this.values.get(text);
      if (kept) kept.present = true;
      else {
        const inner = span({ className: "ticker-symbol-value", textContent: text });
        this.el.appendChild(inner);
        this.values.set(
          text,
          new Presence(this.flow, inner, { animateIn: true, onRemove: () => this.values.delete(text) }),
        );
      }
    }
    this.value = text;
  }

  didUpdate(sectionRect: DOMRect) {
    if (this.type === "decimal") return;
    const edge = this.section.justify;
    const shift = this.prevOffset - (this.el.getBoundingClientRect()[edge] - sectionRect[edge]);
    if (shift)
      this.el.animate({ transform: [`translateX(${shift}px)`, "none"] }, accumulate(timing.transform));
  }
}

/** A run of characters held to one edge: characters that go are popped out where they were, then fade */
abstract class Section {
  flow: Flow;
  el: HTMLElement;
  justify: Edge;
  protected children = new Map<string, Char>();
  private prevOffset = 0;

  constructor(flow: Flow, parts: Part[], justify: Edge) {
    this.flow = flow;
    this.justify = justify;
    const chars = parts.map((part) => this.add(part).el);
    this.el = span({ className: `ticker-section ticker-justify-${justify}` }, chars);
  }

  protected add(part: Part, { startAtZero = false, animateIn = false } = {}): Char {
    const onRemove = () => this.children.delete(part.key);
    const char =
      part.type === "integer" || part.type === "fraction"
        ? new Digit(this, part.type, startAtZero ? 0 : Number(part.value), part.pos ?? 0, {
            onRemove,
            animateIn,
          })
        : new Symbol_(this, part.type, String(part.value), { onRemove, animateIn });
    this.children.set(part.key, char);
    return char;
  }

  protected unpop(char: Char) {
    char.el.removeAttribute("inert");
    char.el.style.top = "";
    char.el.style[this.justify] = "";
  }

  protected pop(chars: Map<string, Char>) {
    for (const char of chars.values()) {
      char.el.style.top = `${char.el.offsetTop}px`;
      char.el.style[this.justify] = `${offsetFrom(char.el, this.justify)}px`;
    }
    for (const char of chars.values()) {
      char.el.setAttribute("inert", "");
      char.present = false;
    }
  }

  protected addNewAndUpdateExisting(parts: Part[]) {
    const added = new Map<Part, Char>();
    const kept = new Map<Part, Char>();
    const left = this.justify === "left";
    const ordered = left ? [...parts].reverse() : parts;
    for (const part of ordered) {
      let char = this.children.get(part.key);
      if (char) {
        kept.set(part, char);
        this.unpop(char);
        char.present = true;
      } else {
        char = this.add(part, { startAtZero: true, animateIn: true });
        added.set(part, char);
      }
      if (left) this.el.prepend(char.el);
      else this.el.append(char.el);
    }
    if (this.flow.computedAnimated) {
      const rect = this.el.getBoundingClientRect();
      for (const char of added.values()) char.willUpdate(rect);
    }
    for (const [part, char] of added) char.update(part.value);
    for (const [part, char] of kept) char.update(part.value);
  }

  willUpdate() {
    const rect = this.el.getBoundingClientRect();
    this.prevOffset = rect[this.justify];
    for (const char of this.children.values()) char.willUpdate(rect);
  }

  didUpdate() {
    const rect = this.el.getBoundingClientRect();
    for (const char of this.children.values()) char.didUpdate(rect);
    const shift = this.prevOffset - rect[this.justify];
    if (shift && this.children.size)
      this.el.animate({ transform: [`translateX(${shift}px)`, "none"] }, accumulate(timing.transform));
  }

  abstract update(parts: Part[]): void;
}

/** The integer or fraction digits: a digit that goes spins down to 0 as it fades */
class IntegerSection extends Section {
  update(parts: Part[]) {
    const removed = new Map<string, Char>();
    for (const [key, char] of this.children) {
      if (!parts.find((part) => part.key === key)) removed.set(key, char);
      this.unpop(char);
    }
    this.addNewAndUpdateExisting(parts);
    for (const char of removed.values()) if (char instanceof Digit) char.update(0);
    this.pop(removed);
  }
}

/** What comes before or after the number */
class SymbolSection extends Section {
  update(parts: Part[]) {
    const removed = new Map<string, Char>();
    for (const [key, char] of this.children)
      if (!parts.find((part) => part.key === key)) removed.set(key, char);
    this.pop(removed);
    this.addNewAndUpdateExisting(parts);
  }
}

export type NumberTickerProps = Omit<ComponentProps<"span">, "children" | "prefix"> & {
  /** The number to show */
  value: number;
  /** Where the first roll starts */
  from?: number;
  /** Intl.NumberFormat options, for example { style: "currency", currency: "USD" } */
  format?: Intl.NumberFormatOptions;
  /** The locale to format in. en-US unless you pass one, so the server and the browser agree */
  locale?: string;
  /** Text before the number */
  prefix?: string;
  /** Text after the number */
  suffix?: string;
  /** Which way the digits turn. Up when the number grows and down when it shrinks, unless you set it */
  direction?: "up" | "down";
  /** When a higher place changes, the places below spin a whole turn, so it reads as counting */
  continuous?: boolean;
  /** Seconds to wait before the first roll */
  delay?: number;
  /** Roll when it scrolls into view (once). With false, it rolls on mount */
  startOnView?: boolean;
};

/**
 * A number that flows to its value, digit by digit. It inherits the text's size and colour; set them with
 * `className`. Its line height is 1, so give it a size rather than relying on the line around it.
 */
function NumberTicker({
  value,
  from = 0,
  format,
  locale = "en-US",
  prefix,
  suffix,
  direction,
  continuous = true,
  delay = 0,
  startOnView = true,
  className,
  style,
  ref,
  ...props
}: NumberTickerProps) {
  // Format options compared by content, so an inline object doesn't make a new formatter each render
  const formatKey = JSON.stringify(format ?? {});
  // biome-ignore lint/correctness/useExhaustiveDependencies: format is compared through formatKey
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, formatKey]);
  const data = useMemo(() => toData(value, formatter, prefix, suffix), [value, formatter, prefix, suffix]);
  const reduce = useReducedMotion() ?? false;
  const host = useRef<HTMLSpanElement | null>(null);
  const flow = useRef<Flow | null>(null);
  // Whether the first roll has happened; until then a new value waits for it
  const started = useRef(false);
  // The server's markup and the first paint; fixed, so React never touches what the flow builds inside
  const [initial] = useState(() => ({ __html: staticHtml(data) }));
  const latest = useRef({ data, from, formatter, prefix, suffix, delay, startOnView, reduce });
  latest.current = { data, from, formatter, prefix, suffix, delay, startOnView, reduce };
  const options: Options = {
    trend: direction === "up" ? 1 : direction === "down" ? -1 : (before, after) => Math.sign(after - before),
    continuous,
  };
  if (flow.current) flow.current.options = options;

  const setRef = useCallback(
    (node: HTMLSpanElement | null) => {
      host.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // The flow takes over the server's markup before the first paint: at `from`, then the value once it's seen
  // biome-ignore lint/correctness/useExhaustiveDependencies: built once; later values go through the effect below
  useLayoutEffect(() => {
    const node = host.current;
    if (!node) return;
    const settings = latest.current;
    const engine = new Flow(node, options);
    flow.current = engine;
    engine.reduce = settings.reduce;
    const rolls = !settings.reduce && canAnimate();
    engine.set(
      rolls ? toData(settings.from, settings.formatter, settings.prefix, settings.suffix) : settings.data,
    );
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      timer = setTimeout(() => {
        started.current = true;
        engine.set(latest.current.data);
      }, settings.delay * 1000);
    };
    let observer: IntersectionObserver | undefined;
    if (!rolls) started.current = true;
    else if (!settings.startOnView || typeof IntersectionObserver === "undefined") go();
    else {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= IN_VIEW)) return;
          observer?.disconnect();
          go();
        },
        { threshold: IN_VIEW },
      );
      observer.observe(node);
    }
    return () => {
      observer?.disconnect();
      clearTimeout(timer);
      engine.destroy();
      flow.current = null;
      started.current = false;
    };
  }, []);

  // Later values flow from what's on screen
  useLayoutEffect(() => {
    const engine = flow.current;
    if (!engine || !started.current) return;
    engine.reduce = reduce;
    engine.set(data);
  }, [data, reduce]);

  return (
    <>
      {/* One stylesheet for the page: React hoists it to the head and keeps one copy however many tickers */}
      <style href="fewtone-number-ticker" precedence="medium">
        {CSS_TEXT}
      </style>
      <span
        ref={setRef}
        data-slot="number-ticker"
        // The number is a picture named by its value, so screen readers read it once and never the roll
        role="img"
        aria-label={data.label}
        className={cn("tabular-nums", className)}
        style={style as CSSProperties}
        {...props}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: our own escaped digits, the server's markup; the flow builds inside it after
        dangerouslySetInnerHTML={initial}
      />
    </>
  );
}

export { NumberTicker };
