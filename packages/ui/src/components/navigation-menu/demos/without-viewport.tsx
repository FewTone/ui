import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@fewtone/ui/components/navigation-menu/navigation-menu";

const menus = [
  {
    label: "Guides",
    links: [
      { href: "/docs", title: "Introduction" },
      { href: "/docs/installation", title: "Installation" },
      { href: "/roadmap", title: "Roadmap" },
    ],
  },
  {
    label: "Components",
    links: [
      { href: "/components/button", title: "Button" },
      { href: "/components/dialog", title: "Dialog" },
      { href: "/components/select", title: "Select" },
      { href: "/components", title: "All components" },
    ],
  },
];

/*
 * viewport={false}: each trigger opens its own small surface right under it, like a row of dropdowns. Plain
 * rows of links, spaced like Select's options.
 */
export default function NavigationMenuWithoutViewport() {
  return (
    <div className="flex h-64 w-full items-start justify-center">
      <NavigationMenu viewport={false} aria-label="Documentation">
        <NavigationMenuList>
          {menus.map((menu) => (
            <NavigationMenuItem key={menu.label}>
              <NavigationMenuTrigger>{menu.label}</NavigationMenuTrigger>
              <NavigationMenuContent className="p-1">
                <ul className="grid w-48">
                  {menu.links.map((link) => (
                    <li key={link.href}>
                      <NavigationMenuLink href={link.href} className="px-2 py-1.5">
                        {link.title}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
