"use client";

import { duration, spring } from "@fewtone/ui/lib/motion";
import { MoonIcon, SunIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { Tooltip } from "radix-ui";
import { useSyncExternalStore } from "react";

const noop = () => () => {};
const iconClass = "size-(--size-icon-md)";

/**
 * One button that switches between light and dark, with a tooltip saying which way it goes.
 * It shows the theme you would switch to: a moon on light, a sun on dark.
 * The theme is only known in the browser, so until then CSS picks the icon (no flash) and the label is neutral.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";
  const label = mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Switch theme";
  // The icon turns in and out on a snappy spring; with reduced motion it only fades
  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.5 };

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label={label}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="focus-ring inline-flex size-(--size-control-sm) items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground"
          >
            <span className="relative grid size-(--size-icon-md) place-items-center">
              {mounted ? (
                <AnimatePresence initial={false}>
                  <motion.span
                    key={isDark ? "sun" : "moon"}
                    className="absolute inset-0 grid place-items-center"
                    initial={hidden}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={reduceMotion ? { duration: duration.fast } : spring.snappy}
                  >
                    {isDark ? (
                      <SunIcon className={iconClass} aria-hidden />
                    ) : (
                      <MoonIcon className={iconClass} aria-hidden />
                    )}
                  </motion.span>
                </AnimatePresence>
              ) : (
                <>
                  <SunIcon className={`hidden ${iconClass} dark:block`} aria-hidden />
                  <MoonIcon className={`${iconClass} dark:hidden`} aria-hidden />
                </>
              )}
            </span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={6}
            className="z-(--z-tooltip) rounded-md bg-primary px-2 py-1 text-caption text-primary-foreground shadow-md data-[state=delayed-open]:animate-fade-in"
          >
            {label}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
