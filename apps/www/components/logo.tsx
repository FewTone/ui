import { cn } from "@fewtone/ui/lib/utils";
import type { ComponentProps } from "react";

/** The four pieces of the FewTone mark, on a 42 × 30 grid (source: public/Logo/Logo_mark.svg) */
export const LOGO_PATHS = [
  "M0.00976562 29.9938L0.00976562 10.4164C0.00976562 10.4164 10.0966 10.148 11.1921 11.49C12.2876 12.8319 8.02865 13.8444 8.02865 16.0935C8.02865 18.3426 11.1921 20.4841 11.1921 20.4841L11.1921 29.9946L0.00976562 29.9938Z",
  "M0 12.9628L0 0L29.2707 0C29.2707 0 29.8243 7.08566 25.2083 8.72513C20.5923 10.3646 14.4883 7.2068 10.9682 8.72513C7.44809 10.2435 12.8246 11.0307 10.9682 12.6322C9.11172 14.2337 0 12.9628 0 12.9628Z",
  "M41.6992 0.000341415V19.5772C41.6992 19.5772 31.6122 19.8462 30.5169 18.5049C29.4215 17.1635 33.6801 16.1494 33.6801 13.901C33.6801 11.6527 30.5169 9.51112 30.5169 9.51112L30.5169 0.000152588L41.6992 0.000341415Z",
  "M41.7012 17.0337V29.9999L12.4304 29.9999C12.4304 29.9999 11.877 22.9146 16.493 21.2748C21.109 19.6349 27.2133 22.7931 30.733 21.2748C34.2527 19.7564 28.8763 18.9696 30.733 17.3679C32.5896 15.7662 41.7012 17.0337 41.7012 17.0337Z",
] as const;

/**
 * The FewTone mark. FewTone UI uses the studio mark unchanged and static (ADR 0006).
 * Drawn in currentColor, so it takes the text colour of wherever it sits:
 * near-black on light, near-white on dark, white on the brand footer.
 * Size it by height (`h-(--size-logo-sm)`); the width follows the mark's 42:30 shape.
 * On its own it is for small, square places (favicon, app icon); elsewhere use `Logo`.
 */
export function LogoMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 42 30"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {LOGO_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/**
 * The horizontal logo: the mark and the name, "FewTone" in full ink and "UI" softer.
 * For headers and navigation. The stacked logo (mark above the name) lives in the footer.
 */
export function Logo({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 font-semibold tracking-tight", className)}
      {...props}
    >
      <LogoMark className="h-(--size-logo-sm) w-auto" />
      <span>
        FewTone <span className="font-medium text-muted-foreground">UI</span>
      </span>
    </span>
  );
}
