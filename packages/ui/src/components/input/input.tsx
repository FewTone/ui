import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const inputVariants = cva(
  [
    "flex w-full min-w-0 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground shadow-xs",
    "transition duration-(--duration-fast) ease-out",
    "placeholder:text-muted-foreground",
    "outline-ring focus-visible:border-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    "aria-invalid:border-destructive aria-invalid:outline-destructive",
    "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
    "file:me-3 file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  ],
  {
    variants: {
      size: {
        sm: "h-(--size-control-sm) rounded-md px-2.5",
        md: "h-(--size-control-md)",
        lg: "h-(--size-control-lg)",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** `size` is the height variant here, so the native numeric `size` attribute is left out */
export type InputProps = Omit<ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>;

/**
 * A text field. Pair it with a visible label (`<label htmlFor>`), and set `aria-invalid` with an
 * error message linked through `aria-describedby` when the value is wrong.
 */
function Input({ className, size, type = "text", ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      data-size={size ?? "md"}
      type={type}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
