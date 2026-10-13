"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useEffect } from "react";

const navigationKeys = new Set([
  "Tab",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

/**
 * Marks how the visitor last moved focus, so focus rings show for the keyboard only (globals.css):
 * "pointer" after a click or tap, "keyboard" after Tab, or an arrow key outside a text field
 * (arrows that move the caret while typing don't count). Typing itself never switches it.
 */
function useInputModality() {
  useEffect(() => {
    const root = document.documentElement;
    const onPointer = () => {
      root.dataset.modality = "pointer";
    };
    const onKey = (event: KeyboardEvent) => {
      if (!navigationKeys.has(event.key)) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      const inText =
        target !== null && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (event.key === "Tab" || !inText) root.dataset.modality = "keyboard";
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, []);
}

export function Providers({ children }: { children: ReactNode }) {
  useInputModality();
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {/* Site motion follows the system's reduced-motion setting: movement off, fades kept */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
