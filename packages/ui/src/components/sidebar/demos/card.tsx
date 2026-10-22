import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@fewtone/ui/components/sidebar/sidebar";
import { FolderIcon, InboxIcon, LayoutDashboardIcon } from "lucide-react";

const items = [
  { title: "Dashboard", icon: LayoutDashboardIcon },
  { title: "Inbox", icon: InboxIcon },
  { title: "Projects", icon: FolderIcon },
];

/** The index card's preview: three rows of a sidebar that stays open, the first one current. No shortcut, since a page of cards renders many. */
export default function SidebarCard() {
  return (
    <SidebarProvider shortcut={false} className="min-h-0 w-auto bg-transparent">
      <Sidebar collapsible="none" aria-label="Preview" className="h-auto w-44 rounded-lg bg-background">
        <SidebarContent>
          <SidebarGroup className="p-1">
            <SidebarMenu>
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={index === 0}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
