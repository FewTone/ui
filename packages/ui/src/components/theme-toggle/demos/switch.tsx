"use client";

import { Switch } from "@fewtone/ui/components/switch/switch";
import { revealTheme } from "@fewtone/ui/components/theme-toggle/theme-toggle";
import { cn } from "@fewtone/ui/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useId, useRef, useSyncExternalStore } from "react";

const noop = () => () => {};

export default function ThemeToggleSwitch() {
  const id = useId();
  const control = useRef<HTMLButtonElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known in the browser; until then the switch shows off
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const dark = mounted && resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="mr-2 text-sm font-medium">
        Dark mode
      </label>
      <SunIcon
        aria-hidden
        className={cn(
          "size-(--size-icon-md) transition-colors duration-(--duration-base)",
          dark ? "text-muted-foreground" : "text-foreground",
        )}
      />
      <Switch
        id={id}
        ref={control}
        checked={dark}
        onCheckedChange={(checked) => {
          // The new theme grows out of the switch
          const box = control.current?.getBoundingClientRect();
          revealTheme({
            theme: checked ? "dark" : "light",
            setTheme,
            origin: box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : undefined,
            reveal: "circle",
          });
        }}
      />
      <MoonIcon
        aria-hidden
        className={cn(
          "size-(--size-icon-md) transition-colors duration-(--duration-base)",
          dark ? "text-foreground" : "text-muted-foreground",
        )}
      />
    </div>
  );
}
