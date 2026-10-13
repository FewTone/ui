import { Switch } from "@fewtone/ui/components/switch/switch";
import { useId } from "react";

const settings = [
  { key: "email", label: "Email updates", hint: "News and product changes, once a month.", on: true },
  { key: "security", label: "Security alerts", hint: "New sign-ins and password changes.", on: true },
  { key: "tips", label: "Tips", hint: "Short guides for features you haven't used.", on: false },
];

export default function SwitchSettings() {
  const id = useId();
  return (
    <fieldset className="grid w-full max-w-sm gap-4">
      <legend className="mb-2 text-sm font-medium">Notifications</legend>
      {settings.map((setting) => (
        <div key={setting.key} className="flex items-start justify-between gap-4">
          <div className="grid gap-0.5">
            <label htmlFor={`${id}-${setting.key}`} className="text-sm font-medium">
              {setting.label}
            </label>
            <p id={`${id}-${setting.key}-hint`} className="text-sm text-muted-foreground">
              {setting.hint}
            </p>
          </div>
          <Switch
            id={`${id}-${setting.key}`}
            defaultChecked={setting.on}
            aria-describedby={`${id}-${setting.key}-hint`}
          />
        </div>
      ))}
    </fieldset>
  );
}
