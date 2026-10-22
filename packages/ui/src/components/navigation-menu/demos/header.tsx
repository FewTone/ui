import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@fewtone/ui/components/navigation-menu/navigation-menu";
import { BookOpenIcon } from "lucide-react";
import type { ReactNode } from "react";

const guides = [
  {
    href: "/docs/installation",
    title: "Installation",
    description: "Add components with the shadcn CLI, or copy the source.",
  },
  {
    href: "/docs/installation#customize-the-theme",
    title: "Theming",
    description: "Colours, radius and fonts, set with CSS variables.",
  },
  {
    href: "/roadmap",
    title: "Roadmap",
    description: "What's available now, what's next and what's planned.",
  },
];

const components = [
  { href: "/components/button", title: "Button", description: "Actions, in calm variants." },
  { href: "/components/dialog", title: "Dialog", description: "A window that holds focus." },
  { href: "/components/select", title: "Select", description: "One option from a list." },
  { href: "/components/tabs", title: "Tabs", description: "Panels under a sliding line." },
  { href: "/components/toast", title: "Toast", description: "Brief messages that stack." },
  { href: "/components/tooltip", title: "Tooltip", description: "A short label on hover." },
];

/** A panel row: a title over a muted description */
function ListItem({
  href,
  title,
  children,
  className,
}: {
  href: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <li className={className}>
      <NavigationMenuLink href={href}>
        <span className="font-medium">{title}</span>
        <span className="leading-snug text-muted-foreground">{children}</span>
      </NavigationMenuLink>
    </li>
  );
}

/*
 * A site header's menu: two triggers with panels of different sizes, and a plain link. Moving between the
 * triggers, the panel glides to the next one's size, its content slides in from the side you moved towards,
 * and the caret follows. The box is as tall as the open panel needs.
 */
export default function NavigationMenuHeader() {
  return (
    <div className="flex h-88 w-full items-start justify-center">
      <NavigationMenu aria-label="Documentation">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-md grid-cols-5 gap-1">
                <li className="col-span-2 row-span-3">
                  <NavigationMenuLink
                    href="/docs"
                    // Its own fill hides the gliding highlight, so it deepens itself on hover
                    className="h-full justify-between gap-4 bg-muted p-4 hover:bg-accent"
                  >
                    <BookOpenIcon className="size-(--size-icon-lg)" />
                    <span className="grid gap-1">
                      <span className="text-base font-medium">Introduction</span>
                      <span className="leading-snug text-muted-foreground">
                        Accessible React components for Next.js and Tailwind CSS, made to copy in.
                      </span>
                    </span>
                  </NavigationMenuLink>
                </li>
                {guides.map((guide) => (
                  <ListItem key={guide.href} href={guide.href} title={guide.title} className="col-span-3">
                    {guide.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-lg grid-cols-2 gap-1">
                {components.map((component) => (
                  <ListItem key={component.href} href={component.href} title={component.title}>
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
