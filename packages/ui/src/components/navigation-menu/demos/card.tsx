import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@fewtone/ui/components/navigation-menu/navigation-menu";

/** The index card's preview: the top bar alone, with short labels so it fits the tile. The page opens on the full header. */
export default function NavigationMenuCard() {
  return (
    <NavigationMenu aria-label="Documentation">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-56 gap-1">
              <li>
                <NavigationMenuLink href="/docs">Introduction</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/docs/installation">Installation</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-56 gap-1">
              <li>
                <NavigationMenuLink href="/components">All components</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/roadmap">Roadmap</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
