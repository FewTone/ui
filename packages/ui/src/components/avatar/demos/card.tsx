import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@fewtone/ui/components/avatar/avatar";

/** The index card's preview: one group, large. The page itself opens on every size. */
export default function AvatarCard() {
  return (
    <AvatarGroup aria-label="Team, 6 people">
      {["OM", "JL", "IN"].map((initials) => (
        <Avatar key={initials} size="lg">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  );
}
