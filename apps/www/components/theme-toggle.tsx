"use client";

import { ThemeToggle as LibraryThemeToggle } from "@fewtone/ui/components/theme-toggle/theme-toggle";
import { useTheme } from "next-themes";
import { Tooltip } from "radix-ui";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * The header's theme switch: FewTone UI's Theme Toggle, with a tooltip saying which way it goes. Every switch
 * plays a different reveal at slow speed (owner, 2026-10-14), so visitors see the range the component has.
 * Styled like the header's other icon buttons.
 */
export function ThemeToggle() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const label = mounted ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme` : "Switch theme";

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <LibraryThemeToggle
            reveal="random"
            speed="slow"
            variant="ghost"
            className="rounded-lg border text-muted-foreground hover:text-foreground"
          />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={6}
            className="z-(--z-tooltip) rounded-md bg-primary px-2 py-1 text-caption text-primary-foreground shadow-md data-[state=delayed-open]:animate-blur-in"
          >
            {label}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
