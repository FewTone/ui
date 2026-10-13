/*
 * Import handling shared by the docs site (code shown on pages) and the registry generator (code users install).
 * Plain, erasable TypeScript so Node can run it directly from scripts/ (ADR 0008, ADR 0009).
 */

/** Rewrite source imports to the paths they have in a user's project after `shadcn add` */
export function toProjectImports(source: string): string {
  return source
    .replace(/@fewtone\/ui\/components\/[a-z0-9-]+\/([a-z0-9-]+)/g, "@/components/ui/$1")
    .replace(/@fewtone\/ui\/lib\//g, "@/lib/")
    .replace(/@fewtone\/ui\/hooks\//g, "@/hooks/");
}

/** Every module a file imports or re-exports from, type-only imports included */
export function importSpecifiers(source: string): string[] {
  const found = new Set<string>();
  const patterns = [
    /\b(?:import|export)\b[^"';]*?\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) found.add(match[1] as string);
  }
  return [...found];
}

/** The npm package behind an import, or null for local and FewTone imports ("motion/react" → "motion") */
export function packageOf(specifier: string): string | null {
  if (specifier.startsWith(".") || specifier.startsWith("@fewtone/") || specifier.startsWith("node:"))
    return null;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? `${parts[0]}/${parts[1]}` : (parts[0] as string);
}

/** Packages every React project already has, so they never become install dependencies */
export const builtInPackages = new Set(["react", "react-dom", "next"]);
