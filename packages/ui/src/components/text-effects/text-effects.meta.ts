import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "text-effects",
  title: "Text Effects",
  description:
    "Accessible React text effects for Next.js and Tailwind CSS: a shimmer, a word-by-word reveal and a typewriter, all real text and off with reduced motion.",
  kind: "component",
  category: "Effects",
  tags: ["text animation", "shimmer", "text reveal", "typewriter", "typing effect", "animated text"],
  keywords: [
    "react text animation",
    "text shimmer react",
    "shimmer text tailwind",
    "text reveal animation",
    "typewriter effect react",
    "typing animation nextjs",
    "animated heading react",
    "shadcn text effects",
    "blur text reveal",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["text-effects.tsx"],
  usage: {
    code: `import { TextReveal, TextShimmer, Typewriter } from "@/components/ui/text-effects"

export function Hero() {
  return (
    <>
      <TextReveal as="h1">Ship it this afternoon</TextReveal>
      <p>
        Build <Typewriter phrases={["forms", "menus", "dialogs"]} />
      </p>
      <TextShimmer>Generating a reply…</TextShimmer>
    </>
  )
}`,
  },
  demos: [
    {
      name: "overview",
      title: "Shimmer, reveal and typewriter",
      description:
        "A light sweeps across the shimmer in one neutral hue. The reveal's words rise through the blur, 0.05s apart. The typewriter's caret stays solid while it types and breathes while it waits. Press Replay to play them again.",
    },
    {
      name: "by-character",
      title: "Reveal by character",
      description: 'by="character" for a short line. Each word stays whole across a line break.',
    },
    {
      name: "type-once",
      title: "Type once",
      description: "One phrase types once and stays; the caret breathes for a moment, then fades away.",
    },
  ],
  // The page opens on all three, named; the index card shows the shimmer
  preview: { card: "card" },
  // Replay remounts the hero, so the reveal and the typing play again
  motion: { animated: true },
  api: [
    {
      name: "TextShimmer",
      description:
        "A span whose text is muted-foreground, with a foreground sheen sweeping across it every 2s, in step with Skeleton's sheen. It stops with reduced motion. Also accepts every native span prop.",
      props: [
        { name: "children", type: "ReactNode", description: "The text. Keep it to text: it's drawn twice." },
      ],
    },
    {
      name: "TextReveal",
      description:
        "Reveals its text once, a word or a character at a time. A visually hidden copy carries the text for screen readers and search engines. With reduced motion it's simply there. Also accepts every native prop of its element.",
      props: [
        { name: "children", type: "string", required: true, description: "The text to reveal." },
        {
          name: "as",
          type: '"p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "blockquote" | "li"',
          default: '"p"',
          description: "The element to render, for example h2 for a heading.",
        },
        {
          name: "by",
          type: '"word" | "character"',
          default: '"word"',
          description: "Reveal word by word, or character by character for a short line.",
        },
        { name: "delay", type: "number", default: "0", description: "Seconds before the first piece rises." },
        {
          name: "startOnView",
          type: "boolean",
          default: "true",
          description: "Reveal once it scrolls into view. With false, it reveals as soon as it mounts.",
        },
      ],
    },
    {
      name: "Typewriter",
      description:
        "Types its phrases in turn. It starts once it's in view and rests off-screen. Screen readers hear every phrase once, as plain text, and never the typing; nothing is announced as it changes. With reduced motion the first phrase is simply there. Also accepts every native span prop.",
      props: [
        {
          name: "phrases",
          type: "string | string[]",
          required: true,
          description: "One phrase, or several to type in turn.",
        },
        {
          name: "loop",
          type: "boolean",
          description: "Start over after the last phrase. On by default for several phrases, off for one.",
        },
        { name: "typeSpeed", type: "number", default: "0.08", description: "Seconds per character typed." },
        {
          name: "deleteSpeed",
          type: "number",
          default: "0.04",
          description: "Seconds per character deleted.",
        },
        {
          name: "hold",
          type: "number",
          default: "2",
          description: "Seconds a typed phrase stays before it's deleted.",
        },
        { name: "delay", type: "number", default: "0", description: "Seconds before the first character." },
        {
          name: "cursor",
          type: "boolean",
          default: "true",
          description: "Show the caret. It fades away once a phrase typed only once is done.",
        },
      ],
    },
  ],
  primitives: ["Web Animations API"],
  related: ["number-ticker", "skeleton", "marquee"],
  ai: {
    whenToUse:
      'Use TextReveal for a heading or line that should rise into place once as it scrolls into view, Typewriter for a short phrase that cycles ("Build forms, menus, dialogs"), and TextShimmer for a label that says something is working, such as an AI reply being generated. Keep them for one or two moments per page.',
  },
} satisfies ItemMeta;
