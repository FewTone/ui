import type { ReactNode } from "react";

/** "New" and "Beta" signals: one of the few places the brand colour appears */
export function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-brand-subtle px-2 py-0.5 text-caption text-brand-text">
      {children}
    </span>
  );
}
