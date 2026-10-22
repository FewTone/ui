import { Avatar, AvatarFallback, AvatarImage } from "@fewtone/ui/components/avatar/avatar";

type Member = { name: string; email: string; initials: string; picture?: string };

// No pictures yet, so the initials stand in
const members: Member[] = [
  { name: "Sofia Davis", email: "sofia@example.com", initials: "SD" },
  { name: "Jackson Lee", email: "jackson@example.com", initials: "JL" },
  { name: "William Kim", email: "will@example.com", initials: "WK" },
];

/*
 * With the name written beside it, the avatar is decoration: alt="" hides the picture and the initials from
 * screen readers, so the name is read once.
 */
export default function AvatarWithName() {
  return (
    <ul className="grid w-full max-w-xs gap-4">
      {members.map((member) => (
        <li key={member.email} className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={member.picture} alt="" />
            <AvatarFallback>{member.initials}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0">
            <span className="truncate text-sm font-medium">{member.name}</span>
            <span className="truncate text-sm text-muted-foreground">{member.email}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
