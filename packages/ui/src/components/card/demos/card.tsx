import { Badge } from "@fewtone/ui/components/badge/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@fewtone/ui/components/card/card";

/** The index card's preview: one small card. The page itself opens on the whole range. */
export default function CardCard() {
  return (
    <Card size="sm" className="w-64">
      <CardHeader>
        <CardTitle>Team plan</CardTitle>
        <CardDescription>8 of 10 seats used</CardDescription>
        <CardAction>
          <Badge variant="secondary">Active</Badge>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
