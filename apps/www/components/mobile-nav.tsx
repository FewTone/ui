"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { useState } from "react";
import type { NavSection } from "@/lib/nav";
import { SidebarNav } from "./docs/sidebar-nav";
import { Logo } from "./logo";

/** Below the lg breakpoint the sidebar lives in this drawer */
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
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-overlay) bg-overlay data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-(--z-modal) grid w-72 max-w-full content-start gap-6 overflow-y-auto border-r bg-background p-5 shadow-xl data-[state=open]:animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title asChild>
              <Link href="/" onClick={close} className="focus-ring rounded-sm text-body-sm">
                <Logo />
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
