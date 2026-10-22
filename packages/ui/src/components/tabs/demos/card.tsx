import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fewtone/ui/components/tabs/tabs";

/** The index card's preview: one set. The page itself opens on both looks. */
export default function TabsCard() {
  return (
    <Tabs defaultValue="account" className="w-64">
      <TabsList aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="text-sm text-muted-foreground">
        Your name and email, as others see them.
      </TabsContent>
      <TabsContent value="password" className="text-sm text-muted-foreground">
        Change your password. Other devices are signed out.
      </TabsContent>
      <TabsContent value="billing" className="text-sm text-muted-foreground">
        Your plan, payment method and invoices.
      </TabsContent>
    </Tabs>
  );
}
