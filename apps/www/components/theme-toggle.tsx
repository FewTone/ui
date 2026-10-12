"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known in the browser, so the server and the first client render use a neutral label
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={mounted ? `Switch to ${next} theme` : "Toggle theme"}
      className="focus-ring inline-flex size-(--size-control-md) items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground"
    >
      <SunIcon className="hidden size-(--size-icon-md) dark:block" aria-hidden />
      <MoonIcon className="size-(--size-icon-md) dark:hidden" aria-hidden />
    </button>
  );
}
