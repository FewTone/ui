"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className="focus-ring inline-flex size-(--size-control-md) items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground"
    >
      <SunIcon className="hidden size-(--size-icon-md) dark:block" aria-hidden />
      <MoonIcon className="size-(--size-icon-md) dark:hidden" aria-hidden />
    </button>
  );
}
