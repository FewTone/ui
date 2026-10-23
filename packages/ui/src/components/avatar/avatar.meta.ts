import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "avatar",
  title: "Avatar",
  description:
    "An accessible React avatar for Next.js and Tailwind CSS: a picture or initials in three sizes, alone or in an overlapping group, built on Radix Avatar.",
  kind: "component",
  category: "Display",
  tags: ["avatar", "profile picture", "initials", "user", "avatar group"],
  keywords: [
    "react avatar",
    "shadcn avatar",
    "nextjs avatar",
    "tailwind avatar",
    "avatar group",
    "avatar stack",
    "user avatar initials",
    "radix avatar",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-23",
  files: ["avatar.tsx"],
  usage: {
    code: `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserAvatar({ user }) {
  return (
    <Avatar>
      <AvatarImage src={user.image} alt={user.name} />
      <AvatarFallback>{user.initials}</AvatarFallback>
    </Avatar>
  )
}`,
  },
  demos: [
    {
      name: "sizes",
      title: "Sizes",
      description:
        "Each size with a picture and with initials, and a group with a count. A picture comes in through the blur once it has loaded, over the initials, so nothing jumps.",
    },
    {
      name: "with-name",
      title: "With a name",
      description:
        'With the name written beside it, give the picture alt="": the avatar is hidden from screen readers and the name is read once.',
    },
  ],
  // The page opens on every size and a group; the index card shows the group alone
  preview: { card: "card" },
  api: [
    {
      name: "Avatar",
      description: "The circle. Also accepts every Radix Avatar Root prop.",
      props: [
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "24, 32 or 40px. A group's count follows the avatars beside it.",
        },
      ],
    },
    {
      name: "AvatarImage",
      description:
        "The picture. It appears once it has loaded, coming in through the blur when the initials were on screen first; a missing or broken src leaves the initials. Also accepts every native img prop.",
      props: [
        { name: "src", type: "string", description: "The picture's URL." },
        {
          name: "alt",
          type: "string",
          description:
            'The person\'s name. The initials carry it while they stand in. Use alt="" when the name is written beside the avatar.',
        },
        {
          name: "onLoadingStatusChange",
          type: '(status: "idle" | "loading" | "loaded" | "error") => void',
          description: "Called as the picture loads, or fails to.",
        },
      ],
    },
    {
      name: "AvatarFallback",
      description:
        "Initials or an icon, shown until the picture is fully in, and instead of it when it can't load. Also accepts every native span prop.",
      props: [
        {
          name: "delayMs",
          type: "number",
          description: "Wait this long before showing the initials, so a quick picture never flashes them.",
        },
      ],
    },
    {
      name: "AvatarGroup",
      description:
        'Overlapping avatars, each ringed in the page\'s background colour. The overlap follows their size, and initials centre in the part left visible. A group (role="group"): name it with aria-label.',
      props: [],
    },
    {
      name: "AvatarGroupCount",
      description:
        'The last circle in a group, for the people not shown ("+3"), at the size of its neighbours.',
      props: [],
    },
  ],
  primitives: ["Radix Avatar"],
  related: ["badge", "card"],
  ai: {
    whenToUse:
      'Use Avatar for a person or account: a picture with initials as the fallback. Give the picture the person\'s name as alt, or alt="" when the name is written beside it. Use AvatarGroup with AvatarGroupCount to show a team or the people on a document.',
  },
} satisfies ItemMeta;
