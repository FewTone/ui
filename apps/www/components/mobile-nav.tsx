"use client";

import { duration, ease, spring } from "@fewtone/ui/lib/motion";
import { MenuIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { useState } from "react";
import type { NavSection } from "@/lib/nav";
import { SidebarNav } from "./docs/sidebar-nav";
import { Logo } from "./logo";

/** The drawer leaves quickly on a timed curve, so the page is usable again at once */
const leave = { duration: duration.base, ease: ease.in };

/**
 * Below the lg breakpoint the sidebar lives in this drawer. It slides in from the left on a spring.
 * Radix keeps focus and scroll handling; AnimatePresence lets it slide out before unmounting.
 */
export function MobileNav({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="focus-ring -ml-2 inline-flex size-(--size-control-sm) items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground lg:hidden"
        >
          <MenuIcon className="size-(--size-icon-md)" aria-hidden />
        </button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-(--z-overlay) bg-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
                exit={{ opacity: 0, transition: leave }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed inset-y-0 left-0 z-(--z-modal) grid w-72 max-w-full content-start gap-(--space-nav-group) overflow-y-auto bg-background p-(--space-gutter) shadow-xl"
                initial={{ x: "-100%" }}
                animate={{ x: 0, transition: spring.snappy }}
                exit={{ x: "-100%", transition: leave }}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title asChild>
                    <Link href="/" onClick={close} className="focus-ring flex rounded-sm">
                      <Logo className="text-body-lg" />
                    </Link>
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label="Close menu"
                    className="focus-ring inline-flex size-(--size-control-sm) items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <XIcon className="size-(--size-icon-md)" aria-hidden />
                  </Dialog.Close>
                </div>
                <SidebarNav sections={sections} onNavigate={close} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
