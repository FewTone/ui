import { cn } from "@fewtone/ui/lib/utils";
import type { ComponentProps } from "react";

type ExampleProps = ComponentProps<"button"> & {
  /** The visual style */
  variant?: "solid" | "outline";
};

/**
 * Placeholder used to build and check the docs pages before the real components arrive.
 * It is a draft item, so it only shows in development.
 */
export function Example({ variant = "solid", className, ...props }: ExampleProps) {
  return (
    <button
      type="button"
      data-slot="example"
      data-variant={variant}
      className={cn(
        "focus-ring inline-flex h-(--size-control-md) items-center justify-center gap-2 rounded-lg px-4 text-label transition-transform duration-(--duration-fast) ease-out active:scale-(--scale-press) disabled:opacity-(--opacity-disabled)",
        variant === "solid"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border bg-background text-foreground hover:bg-accent",
        className,
      )}
      {...props}
    />
  );
}
