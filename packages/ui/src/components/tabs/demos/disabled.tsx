import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fewtone/ui/components/tabs/tabs";

export default function TabsDisabled() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-xs">
      <TabsList aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="text-sm text-muted-foreground">
        Your name and email, as others see them.
      </TabsContent>
      <TabsContent value="billing" className="text-sm text-muted-foreground">
        Your plan, payment method and invoices.
      </TabsContent>
      <TabsContent value="team" className="text-sm text-muted-foreground">
        Invite people and choose what they can change.
      </TabsContent>
    </Tabs>
  );
}
