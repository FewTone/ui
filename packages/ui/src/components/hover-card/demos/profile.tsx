import { HoverCard, HoverCardContent, HoverCardTrigger } from "@fewtone/ui/components/hover-card/hover-card";
import { CalendarIcon } from "lucide-react";
import { Fragment } from "react";

type Person = { handle: string; name: string; initials: string; bio: string; joined: string };

const people: Person[] = [
  {
    handle: "maya",
    name: "Maya Chen",
    initials: "MC",
    bio: "Design engineer. Motion, type and interfaces that work for everyone.",
    joined: "Joined March 2024",
  },
  {
    handle: "theo",
    name: "Theo Laurent",
    initials: "TL",
    bio: "Looks after the docs and the release notes.",
    joined: "Joined June 2024",
  },
  {
    handle: "ines",
    name: "Inés Romero",
    initials: "IR",
    bio: "Front-end developer at a small studio. Writes about CSS.",
    joined: "Joined January 2025",
  },
];

function Mention({ person }: { person: Person }) {
  return (
    <HoverCard>
      <HoverCardTrigger
        href={`https://example.com/${person.handle}`}
        className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-(--duration-fast) ease-out hover:decoration-current outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)"
      >
        @{person.handle}
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex gap-3">
          {/* Initials stand in for a photo */}
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium"
          >
            {person.initials}
          </span>
          <div className="grid gap-2">
            <div>
              <p className="text-sm font-medium">{person.name}</p>
              <p className="text-sm text-muted-foreground">@{person.handle}</p>
            </div>
            <p className="text-sm">{person.bio}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon aria-hidden className="size-(--size-icon-sm)" />
              {person.joined}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/** Rest on a name to see who it is, then move along: the next card opens at once */
export default function HoverCardProfile() {
  return (
    <p className="max-w-sm text-center text-sm text-muted-foreground">
      Reviewed by{" "}
      {people.map((person, index) => (
        <Fragment key={person.handle}>
          {index === 0 ? null : index === people.length - 1 ? " and " : ", "}
          <Mention person={person} />
        </Fragment>
      ))}
      .
    </p>
  );
}
