"use client";

import { Checkbox } from "@fewtone/ui/components/checkbox/checkbox";
import { useId, useState } from "react";

const channels = [
  { key: "email", label: "Email" },
  { key: "push", label: "Push notifications" },
  { key: "sms", label: "Text messages" },
];

/** The parent is checked when every channel is, a dash when only some are, and empty when none are */
export default function CheckboxSelectAll() {
  const id = useId();
  const [picked, setPicked] = useState<string[]>(["email"]);
  const all = picked.length === channels.length ? true : picked.length > 0 ? "indeterminate" : false;

  return (
    <fieldset className="grid gap-3">
      <legend className="sr-only">Notification channels</legend>
      <div className="flex items-center gap-3">
        <Checkbox
          id={`${id}-all`}
          checked={all}
          onCheckedChange={(checked) =>
            setPicked(checked === true ? channels.map((channel) => channel.key) : [])
          }
        />
        <label htmlFor={`${id}-all`} className="text-sm font-medium">
          All channels
        </label>
      </div>
      {/* Indented to line up with the parent's label: the 20px box plus the 12px gap */}
      <div className="grid gap-3 ps-8">
        {channels.map((channel) => (
          <div key={channel.key} className="flex items-center gap-3">
            <Checkbox
              id={`${id}-${channel.key}`}
              checked={picked.includes(channel.key)}
              onCheckedChange={(checked) =>
                setPicked((current) =>
                  checked === true ? [...current, channel.key] : current.filter((key) => key !== channel.key),
                )
              }
            />
            <label htmlFor={`${id}-${channel.key}`} className="text-sm">
              {channel.label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
