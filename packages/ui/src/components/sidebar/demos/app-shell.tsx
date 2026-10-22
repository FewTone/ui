"use client";

import { Avatar, AvatarFallback } from "@fewtone/ui/components/avatar/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@fewtone/ui/components/dropdown-menu/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuCollapsible,
  SidebarMenuCollapsibleContent,
  SidebarMenuCollapsibleTrigger,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@fewtone/ui/components/sidebar/sidebar";
import {
  AudioWaveformIcon,
  BadgeCheckIcon,
  BellIcon,
  ChartPieIcon,
  ChevronsUpDownIcon,
  CommandIcon,
  CreditCardIcon,
  FolderIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  type LucideIcon,
  MapIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";
import { type MouseEvent, useId, useState } from "react";

type Team = { name: string; plan: string; logo: LucideIcon };

const teams: [Team, ...Team[]] = [
  { name: "Acme Inc", plan: "Enterprise", logo: GalleryVerticalEndIcon },
  { name: "Acme Corp.", plan: "Startup", logo: AudioWaveformIcon },
  { name: "Evil Corp.", plan: "Free", logo: CommandIcon },
];

const user = { name: "Olivia Martin", email: "olivia@acme.com", initials: "OM" };

/**
 * Where a sidebar menu opens: open, along the sidebar (below the team, above the user) at the trigger's width,
 * so it reads as part of the panel; down to icons, beside the rail, since there's no room under a 32px picture
 */
function useMenuPlacement(along: "bottom" | "top") {
  const { state, isMobile } = useSidebar();
  const beside = state === "collapsed" && !isMobile;
  return {
    side: beside ? ("right" as const) : along,
    align: beside && along === "top" ? ("end" as const) : ("start" as const),
    sideOffset: beside ? 8 : 4,
    className: "w-(--radix-dropdown-menu-trigger-width) min-w-60",
  };
}

/** The team switcher: the current team's logo, name and plan; a short menu to switch teams or add one */
function TeamSwitcher({ team, onTeamChange }: { team: Team; onTeamChange: (team: Team) => void }) {
  const placement = useMenuPlacement("bottom");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <team.logo className="size-(--size-icon-md)" />
          </span>
          <span className="grid flex-1 text-start leading-tight">
            <span className="truncate font-medium text-foreground">{team.name}</span>
            <span className="truncate text-xs">{team.plan}</span>
          </span>
          <ChevronsUpDownIcon className="ms-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...placement}>
        <DropdownMenuLabel>Teams</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={team.name}
          onValueChange={(name) => onTeamChange(teams.find((option) => option.name === name) ?? team)}
        >
          {teams.map((option) => (
            <DropdownMenuRadioItem key={option.name} value={option.name}>
              {/* Each team's own logo on a soft tile, and its name: one quiet line (the plan is on the trigger) */}
              <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted">
                <option.logo className="size-3" />
              </span>
              <span className="truncate">{option.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground">
          <PlusIcon />
          Add team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The signed-in user: who it is at the top of the menu, their account pages, and signing out */
function NavUser() {
  const placement = useMenuPlacement("top");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg">
          <Avatar>
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <span className="grid flex-1 text-start leading-tight">
            <span className="truncate font-medium text-foreground">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </span>
          <ChevronsUpDownIcon className="ms-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...placement}>
        <DropdownMenuLabel className="flex items-center gap-2 px-1.5 py-1.5 text-sm text-foreground">
          <Avatar>
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <span className="grid min-w-0 leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheckIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCardIcon />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const platform = [
  { title: "Dashboard", icon: LayoutDashboardIcon },
  { title: "Inbox", icon: InboxIcon, badge: "12" },
  { title: "Projects", icon: FolderIcon },
];

const settings = ["General", "Team", "Billing"];

const projects = [
  { title: "Design Engineering", icon: FrameIcon },
  { title: "Sales & Marketing", icon: ChartPieIcon },
  { title: "Travel", icon: MapIcon },
];

type Collapse = "icon" | "offcanvas";

/*
 * An app shell in a fixed-height frame: a team switcher, two groups (Settings opens a sub-menu), the user in
 * the footer, and the page beside it with the trigger. The team and user menus open along the sidebar at its
 * width, or beside the rail once it's down to icons. Pick a page and the highlight glides to it; collapse
 * with the trigger, the rail on the edge or ⌘B / Ctrl+B. What collapsing does is set at the top right.
 */
export default function SidebarAppShell() {
  const id = useId();
  const [team, setTeam] = useState(teams[0]);
  const [page, setPage] = useState("Dashboard");
  const [collapsible, setCollapsible] = useState<Collapse>("icon");

  // The links switch this preview's page instead of leaving the docs
  const go = (title: string) => (event: MouseEvent) => {
    event.preventDefault();
    setPage(title);
  };

  return (
    <SidebarProvider className="h-128 min-h-0">
      <Sidebar collapsible={collapsible}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <TeamSwitcher team={team} onTeamChange={setTeam} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {platform.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={page === item.title} tooltip={item.title}>
                    <a href={`#${item.title.toLowerCase()}`} onClick={go(item.title)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
              ))}
              <SidebarMenuCollapsible defaultOpen>
                <SidebarMenuCollapsibleTrigger tooltip="Settings">
                  <Settings2Icon />
                  <span>Settings</span>
                </SidebarMenuCollapsibleTrigger>
                <SidebarMenuCollapsibleContent>
                  <SidebarMenuSub>
                    {settings.map((title) => (
                      <SidebarMenuSubItem key={title}>
                        <SidebarMenuSubButton
                          href={`#${title.toLowerCase()}`}
                          isActive={page === title}
                          onClick={go(title)}
                        >
                          <span>{title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuCollapsibleContent>
              </SidebarMenuCollapsible>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              {projects.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={page === item.title} tooltip={item.title}>
                    <a href={`#${item.title.toLowerCase()}`} onClick={go(item.title)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <NavUser />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* In your app the inset is the page's <main>; this preview sits inside the docs page's own */}
      <SidebarInset asChild>
        <div>
          <header className="flex h-14 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ms-1" />
            <div aria-hidden className="me-2 h-4 w-px shrink-0 self-center bg-border" />
            <p className="truncate text-sm font-medium">{page}</p>
            <div className="ms-auto hidden items-center gap-2 md:flex">
              <label htmlFor={`${id}-collapse`} className="text-sm text-muted-foreground">
                Collapse
              </label>
              <Select value={collapsible} onValueChange={(value) => setCollapsible(value as Collapse)}>
                <SelectTrigger id={`${id}-collapse`} size="sm" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="icon">To icons</SelectItem>
                  <SelectItem value="offcanvas">Off canvas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </header>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 pb-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="aspect-video rounded-lg bg-muted/50" />
              <div className="aspect-video rounded-lg bg-muted/50" />
              <div className="aspect-video rounded-lg bg-muted/50" />
            </div>
            <div className="flex flex-1 items-start rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Toggle the sidebar with <kbd className="font-sans font-medium text-foreground">⌘B</kbd> or{" "}
                <kbd className="font-sans font-medium text-foreground">Ctrl B</kbd>.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
