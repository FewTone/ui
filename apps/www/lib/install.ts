export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const;
export type PackageManager = (typeof packageManagers)[number];

/** `shadcn add` for one item from the @fewtone registry */
export function addCommands(name: string): Record<PackageManager, string> {
  const target = `shadcn@latest add @fewtone/${name}`;
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
