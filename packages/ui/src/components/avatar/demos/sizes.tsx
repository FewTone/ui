import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@fewtone/ui/components/avatar/avatar";

/*
 * Pictures drawn as small grey SVGs, so the demo works offline. Use your people's photo URLs instead: when one is
 * missing or can't load, the initials stay, named by the alt.
 */
const picture = (shapes: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="white"/>${shapes}</svg>`,
  )}`;

const people = [
  {
    name: "Olivia Martin",
    initials: "OM",
    picture: picture(
      '<rect width="40" height="40" fill-opacity=".7"/><circle cx="26" cy="14" r="6" fill="white" fill-opacity=".75"/><path d="M0 30q11-8 21-3t19-2v15H0z" fill-opacity=".45"/>',
    ),
  },
  { name: "Jackson Lee", initials: "JL" },
  {
    name: "Isabella Nguyen",
    initials: "IN",
    picture: picture(
      '<rect width="40" height="40" fill-opacity=".35"/><path d="M0 34 13 16l8 10 6-7 13 15v6H0z" fill-opacity=".55"/><path d="M0 40v-4l13-9 9 6 6-4 12 7v4z" fill-opacity=".35"/>',
    ),
  },
  { name: "William Kim", initials: "WK" },
];

const sizes = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
] as const;

/* Each size with a picture and with initials, then a group with a count, each named underneath */
export default function AvatarSizes() {
  return (
    <ul className="flex flex-wrap items-end justify-center gap-x-10 gap-y-6">
      {sizes.map(({ size, label }) => (
        <li key={size} className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            {people.slice(0, 2).map((person) => (
              <Avatar key={person.name} size={size}>
                <AvatarImage src={person.picture} alt={person.name} />
                <AvatarFallback>{person.initials}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </li>
      ))}
      <li className="flex flex-col items-center gap-2">
        <AvatarGroup aria-label="Team, 7 people">
          {people.map((person) => (
            <Avatar key={person.name}>
              <AvatarImage src={person.picture} alt={person.name} />
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
        <span className="text-xs text-muted-foreground">Group</span>
      </li>
    </ul>
  );
}
