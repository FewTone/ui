import { registryBase } from "@fewtone/ui/registry/shared";

export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const;
export type PackageManager = (typeof packageManagers)[number];

/**
 * Switch to true once `@fewtone` is listed in shadcn's registry directory, so the short
 * `@fewtone/<name>` form works without setup (ADR 0009). Until then the full URL always works.
 */
const useNamespace = false;

/** What `shadcn add` receives for one item: its registry URL, or `@fewtone/<name>` once listed */
export function registryTarget(name: string) {
  return useNamespace ? `@fewtone/${name}` : `${registryBase}/${name}.json`;
}

/** `shadcn add` for one item from the FewTone UI registry */
export function addCommands(name: string): Record<PackageManager, string> {
  const target = `shadcn@latest add ${registryTarget(name)}`;
  return {
    pnpm: `pnpm dlx ${target}`,
    npm: `npx ${target}`,
    yarn: `yarn dlx ${target}`,
    bun: `bunx --bun ${target}`,
  };
}

/** Install npm dependencies */
export function installCommands(packages: string[]): Record<PackageManager, string> {
  const list = packages.join(" ");
  return {
    pnpm: `pnpm add ${list}`,
    npm: `npm install ${list}`,
    yarn: `yarn add ${list}`,
    bun: `bun add ${list}`,
  };
}
