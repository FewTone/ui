// Deploys the site to the FewTone UI project on Vercel from this machine (ADR 0005).
//
//   pnpm deploy:preview   preview deployment
//   pnpm deploy:prod      production deployment (ui.fewtone.com once the domain is added)
//
// Everything stays inside this repo, so other projects and Vercel logins on this machine are untouched:
//   .env.deploy.local   VERCEL_TOKEN=... for the FewTone Vercel account
//   .vercel/            which Vercel project this repo deploys to, plus the CLI's own config folder
// Both are gitignored and never uploaded. The global Vercel CLI login is never read or changed.
//
// The first run links the repo to a Vercel project. When asked where the code is, answer `apps/www`.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const TOKEN_FILE = join(ROOT, ".env.deploy.local");
const PROJECT_FILE = join(ROOT, ".vercel", "project.json");
// Relative to ROOT on purpose: the repo path has a space in it and this goes through a shell
const CLI_CONFIG = ".vercel/cli";
// Pinned so every deploy uses the same CLI
const CLI = "vercel@60.1.3";
// Vercel supports pnpm up to 10 out of the box; Corepack makes it use the pnpm in package.json
const BUILD_ENV = ["--build-env", "ENABLE_EXPERIMENTAL_COREPACK=1"];

const token = existsSync(TOKEN_FILE) ? parseEnv(readFileSync(TOKEN_FILE, "utf8")).VERCEL_TOKEN : undefined;
if (!token || !/^[\w-]+$/.test(token)) {
  console.error(
    [
      "No FewTone Vercel token found.",
      "  1. In the FewTone Vercel account: Account Settings > Tokens > Create.",
      "  2. Save it in .env.deploy.local at the repo root (gitignored, never uploaded):",
      "       VERCEL_TOKEN=your-token",
      "Then run this command again.",
    ].join("\n"),
  );
  process.exit(1);
}

// Only this repo's token and link apply, even if the shell has another project's Vercel variables set
const env = { ...process.env, VERCEL_TOKEN: token };
delete env.VERCEL_ORG_ID;
delete env.VERCEL_PROJECT_ID;

mkdirSync(join(ROOT, CLI_CONFIG), { recursive: true });

/** Runs the Vercel CLI. Arguments are fixed strings from this file, never user input. */
function vercel(args) {
  const command = ["npx", "--yes", CLI, ...args, "--global-config", CLI_CONFIG].join(" ");
  const { status } = spawnSync(command, { cwd: ROOT, env, shell: true, stdio: "inherit" });
  return status ?? 1;
}

if (!existsSync(PROJECT_FILE)) {
  console.log("First run: link this repo to the FewTone UI project on Vercel.");
  console.log('When asked "In which directory is your code located?", answer: apps/www\n');
  const status = vercel(["link"]);
  if (status !== 0 || !existsSync(PROJECT_FILE)) process.exit(status || 1);
}

const prod = process.argv.includes("--prod");
process.exit(vercel(["deploy", ...(prod ? ["--prod"] : []), ...BUILD_ENV]));
