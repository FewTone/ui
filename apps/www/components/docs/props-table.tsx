import type { Item } from "@fewtone/ui/registry/schema";

type Prop = Item["api"][number]["props"][number];

const chip = "rounded-md bg-muted px-1.5 py-0.5 font-mono text-caption";

/** Prop / Type / Default / Description. Outline and row dividers only (beUI); cell spacing from --space-cell-*. */
export function PropsTable({ props }: { props: Prop[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-body-sm">
        <thead className="bg-muted text-caption text-muted-foreground">
          <tr>
            <th scope="col" className="px-(--space-cell-x) py-(--space-bar-y) font-medium">
              Prop
            </th>
            <th scope="col" className="px-(--space-cell-x) py-(--space-bar-y) font-medium">
              Type
            </th>
            <th scope="col" className="px-(--space-cell-x) py-(--space-bar-y) font-medium">
              Default
            </th>
            <th scope="col" className="px-(--space-cell-x) py-(--space-bar-y) font-medium">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-t align-top">
              <td className="px-(--space-cell-x) py-(--space-cell-y) whitespace-nowrap">
                <code className={chip}>
                  {prop.name}
                  {prop.required ? "" : "?"}
                </code>
              </td>
              <td className="px-(--space-cell-x) py-(--space-cell-y)">
                <code className="font-mono text-caption break-words text-muted-foreground">{prop.type}</code>
              </td>
              <td className="px-(--space-cell-x) py-(--space-cell-y) whitespace-nowrap">
                {prop.default ? (
                  <code className={chip}>{prop.default}</code>
                ) : (
                  <span className="text-muted-foreground">–</span>
                )}
              </td>
              <td className="px-(--space-cell-x) py-(--space-cell-y) text-muted-foreground">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
