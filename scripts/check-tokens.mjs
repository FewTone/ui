// Fails when code bypasses the design system. Run with `pnpm check:tokens` (part of `pnpm check`).
//
// Rules:
//   1. No raw colours (hex, rgb, hsl, oklch...) outside the token files.
//   2. No Tailwind arbitrary values like `p-[13px]` or `bg-[#fff]`. Use a token, or `(--token)` syntax.
//   3. No Tailwind default palette classes like `bg-zinc-500` (they no longer exist and render nothing).
//   4. Padding, margin and gap use only the approved 4px-grid steps.
//   5. Motion values in lib/motion.ts match the CSS tokens.
//   6. Library components (packages/ui/src/components, demos included) use the portable vocabulary, so they
//      work in any shadcn project (ADR 0009): shadcn colours, stock text-xs/sm/base, and only the CSS
//      variables the tokens item ships. Site code (apps/) uses the named type tokens instead of stock sizes.
//
// Fenced code blocks in .mdx guides are skipped: they are samples for readers, not UI code.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const shared = await import(pathToFileURL(join(ROOT, "packages/ui/src/registry/shared.ts")).href);

// Library components: what they may not use, and which CSS variables they may read
const LIBRARY_DIR = join("packages", "ui", "src", "components") + sep;
const LIBRARY_BANS = [
  [
    /\btext-(?:display|h1|h2|h3|h4|body-lg|body-sm|body|label|caption|overline|code)\b/g,
    "a site type token. Library components use text-xs, text-sm or text-base.",
  ],
  [
    /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|shadow|caret)-(?:brand|success|warning|danger|info|overlay|sidebar)\b/g,
    "a site-only colour. Library components use shadcn's semantic colours.",
  ],
  [/\bshadow-(?:card|brand|highlight)\b/g, "a site-only shadow."],
  [
    /(?<![\w-])focus-ring(?![\w-])/g,
    "the site's focus-ring utility. Use the outline-(--focus-ring-*) classes.",
  ],
  [/\bfont-normal\b/g, "a class the site's tokens don't define. Use font-regular."],
  [/\banimate-spin\b/g, "an animation the site's tokens don't define. Add it to the tokens item first."],
];
const LIBRARY_VARIABLES = new Set([
  ...shared.shippedVariables,
  ...shared.shippedEasings,
  ...shared.shippedColors,
  ...shared.shadcnVariables,
]);
const SITE_STOCK_TEXT = /\btext-(?:xs|sm|base)\b/g;
const SCAN = ["apps", "packages"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo", "dist", "build", "public"]);
const EXTS = new Set([".ts", ".tsx", ".css", ".mdx"]);
// Files that define tokens are allowed to contain raw values
const TOKEN_FILES = new Set(
  ["palette.css", "theme.css", "tokens.css"].map((f) => join("packages", "ui", "src", "styles", f)),
);

const SPACING_STEPS = new Set([
  "0",
  "px",
  "0.5",
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
  "16",
  "20",
  "24",
  "32",
]);
const SPACING_PREFIX =
  /^-?(p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)$/;
const PALETTE =
  /\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|placeholder|caret|accent)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{2,3})?\b/g;
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab|hwb)\(/g;
const ARBITRARY = /(?<![\w[-])([a-z][\w-]*)-\[([^\]\s]+)\](?!:)/g;
const VARIANT_PREFIX = /^(?:data|aria|group|peer|supports|has|not|in|nth|nth-last|min|max)(?:-|$)/;
const CLASS_TOKEN = /(?<![\w-])(-?[a-z][\w-]*?)-(\d+(?:\.\d+)?|px)(?![\w.%-])/g;

const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    // Generated files are derived from the token files, which are allowed raw values
    else if (EXTS.has(extname(name)) && !name.includes(".generated.")) check(full);
  }
}

function report(file, lineNo, message) {
  problems.push(`${relative(ROOT, file)}:${lineNo}  ${message}`);
}

function check(file) {
  const rel = relative(ROOT, file);
  const isTokenFile = TOKEN_FILES.has(rel);
  const isCode = file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".mdx");
  const isMdx = file.endsWith(".mdx");
  const isLibrary = rel.startsWith(LIBRARY_DIR);
  const lines = readFileSync(file, "utf8").split("\n");
  // Fenced code blocks in MDX are documentation samples shown to readers, not UI code
  let inFence = false;

  lines.forEach((line, i) => {
    const n = i + 1;
    if (isMdx && line.trimStart().startsWith("```")) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    if (line.includes("check-tokens-ignore")) return;

    if (!isTokenFile) {
      for (const m of line.matchAll(RAW_COLOR))
        report(file, n, `raw colour "${m[0]}". Use a semantic colour token.`);
    }
    if (!isCode) return;

    for (const m of line.matchAll(PALETTE))
      report(file, n, `default palette class "${m[0]}". Use a semantic colour.`);

    for (const m of line.matchAll(ARBITRARY)) {
      const [whole, prefix, value] = m;
      if (VARIANT_PREFIX.test(prefix)) continue;
      if (value.startsWith("var(--")) continue;
      report(file, n, `arbitrary value "${whole}". Add a token, or use (--token) syntax.`);
    }

    for (const m of line.matchAll(CLASS_TOKEN)) {
      const [whole, prefix, step] = m;
      const base = prefix.split(":").pop() ?? prefix;
      if (SPACING_PREFIX.test(base) && !SPACING_STEPS.has(step)) {
        report(file, n, `off-grid spacing "${whole}". Allowed steps: ${[...SPACING_STEPS].join(", ")}.`);
      }
    }

    if (isLibrary) {
      for (const [pattern, why] of LIBRARY_BANS) {
        for (const m of line.matchAll(pattern)) report(file, n, `"${m[0]}" is ${why} (ADR 0009)`);
      }
      for (const m of line.matchAll(/[(:]--([\w-]+)/g)) {
        const name = m[1];
        if (!LIBRARY_VARIABLES.has(name) && !name.startsWith("radix-")) {
          report(
            file,
            n,
            `"--${name}" is not shipped to users. Use a token from registry/shared.ts (ADR 0009).`,
          );
        }
      }
    } else if (rel.startsWith(`apps${sep}`)) {
      for (const m of line.matchAll(SITE_STOCK_TEXT)) {
        report(file, n, `"${m[0]}" is a stock size kept for library components. Use a named type token.`);
      }
    }
  });
}

function checkMotionSync() {
  const css = readFileSync(join(ROOT, "packages/ui/src/styles/tokens.css"), "utf8");
  const ts = readFileSync(join(ROOT, "packages/ui/src/lib/motion.ts"), "utf8");
  const file = join(ROOT, "packages/ui/src/lib/motion.ts");

  const start = css.indexOf(":root {");
  const rootBlock = css.slice(start, css.indexOf("}", start));
  for (const [, name, ms] of rootBlock.matchAll(/--duration-([a-z]+):\s*(\d+)ms;/g)) {
    const match = ts.match(new RegExp(`\\b${name}:\\s*([\\d.]+)`));
    if (!match) report(file, 1, `duration "${name}" exists in tokens.css but not in motion.ts`);
    else if (Math.round(Number(match[1]) * 1000) !== Number(ms)) {
      report(file, 1, `duration "${name}" is ${match[1]}s here but ${ms}ms in tokens.css`);
    }
  }

  const easeNames = { out: "out", in: "in", "in-out": "inOut" };
  for (const [, name, values] of css.matchAll(/--ease-([a-z-]+):\s*cubic-bezier\(([^)]+)\);/g)) {
    const key = easeNames[name];
    if (!key) continue;
    const match = ts.match(new RegExp(`\\b${key}:\\s*\\[([^\\]]+)\\]`));
    const norm = (s) =>
      s
        .split(",")
        .map((v) => Number(v.trim()))
        .join(",");
    if (!match) report(file, 1, `ease "${name}" exists in tokens.css but not in motion.ts`);
    else if (norm(match[1]) !== norm(values)) report(file, 1, `ease "${name}" differs from tokens.css`);
  }
}

for (const dir of SCAN) walk(join(ROOT, dir));
checkMotionSync();

if (problems.length) {
  console.error(`Design token check failed (${problems.length}):\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error("\nAdd `check-tokens-ignore` in a comment on the line only for a documented exception.");
  process.exit(1);
}
console.log("Design token check passed.");
