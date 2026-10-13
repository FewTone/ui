import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { codeToHtml } from "shiki";

/*
 * Code on the docs pages is read and highlighted on the server at build time, so it is in the
 * HTML for search engines and AI tools and ships no highlighting JavaScript. Both functions are
 * cached so pages stay fully prerendered with Cache Components.
 */

const UI_SRC = path.join(process.cwd(), "..", "..", "packages", "ui", "src");

/** Read a file from packages/ui/src, for example "components/button/demos/default.tsx" */
export async function readSource(relativePath: string) {
  "use cache";
  cacheLife("max");
  return readFile(path.join(UI_SRC, relativePath), "utf8");
}

/** Highlight code with light and dark colours as CSS variables (see app/globals.css) */
export async function highlight(code: string, lang: string) {
  "use cache";
  cacheLife("max");
  return codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}

/** Show imports the way they look in a user's project after `shadcn add` (shared with the registry generator) */
export { toProjectImports } from "@fewtone/ui/registry/imports";
