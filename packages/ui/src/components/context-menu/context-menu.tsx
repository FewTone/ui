"use client";

import {
  MenuCheck,
  MenuSubContext,
  MenuSurface,
  menuClasses,
  menuItemVariants,
  useMenuRow,
  useMenuSub,
} from "@fewtone/ui/components/dropdown-menu/dropdown-menu";
import { cn } from "@fewtone/ui/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { ContextMenu as ContextMenuPrimitive, Slot } from "radix-ui";
import { type ComponentProps, useContext } from "react";

/*
 * Context Menu, built on Radix Context Menu: a right-click (or a long-press on touch) opens it at the pointer.
 * On a focused trigger, the keyboard's context-menu key and Shift+F10 open it too. Inside, the keys are
 * Dropdown Menu's: arrow keys, Home/End, typeahead, sub-menus on the arrow keys, Escape.
 * - Dropdown Menu's twin: the surface, rows, gliding highlight and marks come from dropdown-menu.tsx, so the
 *   two menus never drift apart. Installing Context Menu brings Dropdown Menu with it.
 * - It grows from the pointer: Radix puts the transform origin at the corner by the pointer, and the popover
 *   keyframes scale from there through the blur.
 */

function ContextMenu(props: ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

/** The area that opens the menu. Make it focusable (tabIndex={0}) so keyboard users can open it too. */
function ContextMenuTrigger({ className, ...props }: ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn(
        "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuPortal(props: ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />;
}

function ContextMenuContent({
  className,
  children,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content data-slot="context-menu-content" {...props} asChild>
        <MenuSurface
          className={cn(
            "max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin)",
            className,
          )}
        >
          {children}
        </MenuSurface>
      </ContextMenuPrimitive.Content>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuGroup(props: ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset || undefined}
      className={cn(menuClasses.label, className)}
      {...props}
    />
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  children,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Item> & {
  /** Lines the label up with items that start with an icon */
  inset?: boolean;
  /** Destructive is red, and tints the highlight red as it lands */
  variant?: "default" | "destructive";
}) {
  const row = useMenuRow({ tone: variant, onFocus, onBlur });
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(menuItemVariants({ variant }), className)}
      onFocus={row.onFocus}
      onBlur={row.onBlur}
      {...props}
    >
      {row.highlight}
      {/* With asChild the child (a link) becomes the item and the highlight goes inside it */}
      <Slot.Slottable>{children}</Slot.Slottable>
    </ContextMenuPrimitive.Item>
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  const row = useMenuRow({ onFocus, onBlur });
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      checked={checked}
      className={cn(menuItemVariants(), menuClasses.choice, className)}
      onFocus={row.onFocus}
      onBlur={row.onBlur}
      {...props}
    >
      {row.highlight}
      <span className={menuClasses.indicator}>
        <MenuCheck checked={checked} />
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioGroup(props: ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

function ContextMenuRadioItem({
  className,
  children,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  const row = useMenuRow({ onFocus, onBlur });
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(menuItemVariants(), menuClasses.choice, className)}
      onFocus={row.onFocus}
      onBlur={row.onBlur}
      {...props}
    >
      {row.highlight}
      <span className={menuClasses.indicator}>
        {/* Always mounted, so the dot can grow in and shrink away rather than appear */}
        <ContextMenuPrimitive.ItemIndicator forceMount className={menuClasses.dot} />
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(menuClasses.separator, className)}
      {...props}
    />
  );
}

/** A shortcut hint at the end of an item. It only shows the keys; binding them is up to you. */
function ContextMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span data-slot="context-menu-shortcut" className={cn(menuClasses.shortcut, className)} {...props} />
  );
}

function ContextMenuSub({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  const sub = useMenuSub({ open, defaultOpen, onOpenChange });
  return (
    <MenuSubContext.Provider value={sub.open}>
      <ContextMenuPrimitive.Sub
        data-slot="context-menu-sub"
        open={sub.open}
        onOpenChange={sub.onOpenChange}
        {...props}
      />
    </MenuSubContext.Provider>
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  const open = useContext(MenuSubContext);
  const row = useMenuRow({ keep: open, onFocus, onBlur });
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(menuItemVariants(), menuClasses.subTrigger, className)}
      onFocus={row.onFocus}
      onBlur={row.onBlur}
      {...props}
    >
      {row.highlight}
      {children}
      <ChevronRightIcon aria-hidden className={menuClasses.chevron} />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  sideOffset = 4,
  // The surface's padding and border, so the sub-menu's first item lines up with its trigger
  alignOffset = -5,
  children,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    // In a portal, so the menu's own scrolling and its keyframes' transform can't clip or carry it
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        data-slot="context-menu-sub-content"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        {...props}
        asChild
      >
        <MenuSurface
          className={cn(
            "max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) shadow-lg",
            className,
          )}
        >
          {children}
        </MenuSurface>
      </ContextMenuPrimitive.SubContent>
    </ContextMenuPrimitive.Portal>
  );
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
