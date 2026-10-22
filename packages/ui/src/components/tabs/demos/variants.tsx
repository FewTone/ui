import { Input } from "@fewtone/ui/components/input/input";
import { Switch } from "@fewtone/ui/components/switch/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fewtone/ui/components/tabs/tabs";
import { useId } from "react";

const variants = [
  { variant: "underline", label: "Underline" },
  { variant: "pill", label: "Pill" },
] as const;

/** One settings set: each panel is a different height, so switching shows it gliding to its size */
function Settings({ id, variant, label }: { id: string; variant: "underline" | "pill"; label: string }) {
  return (
    <Tabs defaultValue="account">
      <TabsList variant={variant} aria-label={`Settings, ${label.toLowerCase()} style`}>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="grid gap-2">
        <label htmlFor={`${id}-name`} className="text-sm font-medium">
          Name
        </label>
        <Input id={`${id}-name`} defaultValue="Ada Lovelace" aria-describedby={`${id}-name-hint`} />
        <p id={`${id}-name-hint`} className="text-sm text-muted-foreground">
          Shown on your profile and in emails.
        </p>
      </TabsContent>
      <TabsContent value="password" className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor={`${id}-current`} className="text-sm font-medium">
            Current password
          </label>
          <Input id={`${id}-current`} type="password" autoComplete="current-password" />
        </div>
        <div className="grid gap-2">
          <label htmlFor={`${id}-new`} className="text-sm font-medium">
            New password
          </label>
          <Input id={`${id}-new`} type="password" autoComplete="new-password" />
        </div>
      </TabsContent>
      <TabsContent value="notifications" className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${id}-email`} className="text-sm font-medium">
            Email updates
          </label>
          <Switch id={`${id}-email`} defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${id}-push`} className="text-sm font-medium">
            Push notifications
          </label>
          <Switch id={`${id}-push`} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

/*
 * Both looks side by side, named underneath. Top-aligned, so switching one set never moves the other.
 */
export default function TabsVariants() {
  const id = useId();
  return (
    <ul className="flex w-full flex-wrap items-start justify-center gap-x-10 gap-y-8">
      {variants.map(({ variant, label }) => (
        <li key={variant} className="flex w-72 flex-col gap-4">
          <Settings id={`${id}-${variant}`} variant={variant} label={label} />
          <span className="text-center text-xs text-muted-foreground">{label}</span>
        </li>
      ))}
    </ul>
  );
}
