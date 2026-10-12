"use client";

import { cn } from "@fewtone/ui/lib/utils";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const noop = () => () => {};
const options = [
  { value: "light", label: "Light theme", Icon: SunIcon },
  { value: "dark", label: "Dark theme", Icon: MoonIcon },
  { value: "system", label: "System theme", Icon: MonitorIcon },
] as const;

/** Light / dark / system. The choice is only known in the browser, so nothing is pressed until mounted. */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  return (
    <fieldset className="inline-flex items-center gap-0.5 rounded-full border p-0.5">
      <legend className="sr-only">Theme</legend>
      {options.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "focus-ring inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground",
              active && "bg-accent text-foreground",
            )}
          >
            <Icon className="size-(--size-icon-sm)" aria-hidden />
          </button>
        );
      })}
    </fieldset>
  );
}
