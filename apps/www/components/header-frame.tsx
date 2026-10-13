"use client";

import { type ReactNode, useEffect, useState } from "react";

/** The sticky header shows its bottom border only once the page has scrolled, so the top of the page stays open */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className="sticky top-0 z-(--z-sticky) h-(--size-header) border-b border-transparent bg-background/85 backdrop-blur transition-colors duration-(--duration-base) ease-out data-[scrolled=true]:border-border"
    >
      {children}
    </header>
  );
}
