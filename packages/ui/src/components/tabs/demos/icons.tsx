import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fewtone/ui/components/tabs/tabs";
import { ActivityIcon, LayoutDashboardIcon, SettingsIcon } from "lucide-react";

export default function TabsIcons() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-sm">
      <TabsList variant="pill" aria-label="Project">
        <TabsTrigger value="overview">
          <LayoutDashboardIcon aria-hidden />
          Overview
        </TabsTrigger>
        <TabsTrigger value="activity">
          <ActivityIcon aria-hidden />
          Activity
        </TabsTrigger>
        <TabsTrigger value="settings">
          <SettingsIcon aria-hidden />
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-muted-foreground">
        Three deployments this week, all healthy.
      </TabsContent>
      <TabsContent value="activity" className="text-sm text-muted-foreground">
        Ada merged two pull requests and opened an issue about the sign-in page.
      </TabsContent>
      <TabsContent value="settings" className="text-sm text-muted-foreground">
        Name, domain and who can see this project.
      </TabsContent>
    </Tabs>
  );
}
