// Builds the shadcn registry the CLI installs from (ADR 0009). Called by scripts/build-index.mjs.
//
//   apps/www/public/r/<name>.json    one file per item, with its source as `content`
//   apps/www/public/r/registry.json  the catalog: every item, files listed without content
//
// The folder is gitignored and rebuilt before every `next dev` and `next build`.
// Everything is derived: npm dependencies and registry dependencies come from each file's imports,
// and the tokens item is read from the token CSS files. Nothing is copied by hand.
//
// REGISTRY_URL (for example http://localhost:3000) points registry dependencies at a local server,
// for testing installs before a deploy.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";

const SCHEMA_ITEM = "https://ui.shadcn.com/schema/registry-item.json";
const SCHEMA_CATALOG = "https://ui.shadcn.com/schema/registry.json";
const AUTHOR = "FewTone <https://fewtone.com>";
const FOLDERS = {
  "registry:ui": "ui",
  "registry:component": "components",
  "registry:block": "components",
  "registry:hook": "hooks",
  "registry:lib": "lib",
};

// ---------- A small CSS reader: enough for our own token files ----------

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Top-level rules of a stylesheet or block body, as [prelude, body] pairs */
function rules(css) {
  const out = [];
  let depth = 0;
  let start = 0;
  let prelude = "";
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      if (depth === 0) {
        prelude = css.slice(start, i).trim();
        start = i + 1;
      }
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        out.push([prelude.replace(/\s+/g, " "), css.slice(start, i)]);
        start = i + 1;
      }
    } else if (ch === ";" && depth === 0) {
      start = i + 1;
    }
  }
  return out;
}

/** Declarations directly inside a block body (nested rules are ignored) */
function declarations(body) {
  let flat = "";
  let depth = 0;
  for (const ch of body) {
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (depth === 0) flat += ch;
  }
  const out = {};
  for (const part of flat.split(";")) {
    const at = part.indexOf(":");
    if (at === -1) continue;
    const prop = part.slice(0, at).trim();
    if (prop) out[prop] = part.slice(at + 1).trim();
  }
  return out;
}

const varsOf = (body) =>
  Object.fromEntries(
    Object.entries(declarations(body))
      .filter(([prop]) => prop.startsWith("--"))
      .map(([prop, value]) => [prop.slice(2), value]),
  );

/** Replace var(--x) with values from the given scopes, recursively; `keep` names stay as variables */
function resolve(value, scopes, keep = new Set(), seen = new Set()) {
  return value.replace(/var\(--([\w-]+)(?:,\s*([^)]+))?\)/g, (whole, name, fallback) => {
    if (keep.has(name)) return whole;
    if (seen.has(name)) throw new Error(`circular token reference --${name}`);
    const found = scopes.find((scope) => scope[name] !== undefined)?.[name] ?? fallback;
    if (found === undefined) throw new Error(`unknown token --${name}`);
    return resolve(found, scopes, keep, new Set([...seen, name]));
  });
}

// ---------- The registry ----------

/**
 * Derive install data for every item and build all registry JSON in memory.
 * Returns errors instead of throwing, so build-index can report them with the metadata errors.
 */
export async function createRegistry({ root, items, kinds }) {
  const src = join(root, "packages", "ui", "src");
  const shared = await import(pathToFileURL(join(src, "registry", "shared.ts")).href);
  const { toProjectImports, importSpecifiers, packageOf, builtInPackages } = await import(
    pathToFileURL(join(src, "registry", "imports.ts")).href
  );
  const base = process.env.REGISTRY_URL
    ? `${process.env.REGISTRY_URL.replace(/\/$/, "")}/r`
    : shared.registryBase;
  const siteOrigin = new URL(shared.registryBase).origin;
  const uiPackage = JSON.parse(readFileSync(join(root, "packages", "ui", "package.json"), "utf8"));
  const versions = { ...uiPackage.peerDependencies, ...uiPackage.dependencies };
  const errors = [];
  const urlOf = (name) => `${base}/${name}.json`;

  /** npm dependencies (with version ranges) and FewTone items a set of files needs */
  function analyse(owner, dir, files, extraDependencies = []) {
    const packages = new Set(extraDependencies);
    const needs = new Set();
    const sources = [];
    for (const file of files) {
      const source = readFileSync(join(src, dir, file), "utf8");
      sources.push({ file, source });
      for (const specifier of importSpecifiers(source)) {
        if (specifier.startsWith(".")) {
          errors.push(
            `${owner}: ${file} uses a relative import ("${specifier}"); import from @fewtone/ui instead`,
          );
          continue;
        }
        if (specifier === "@fewtone/ui/lib/motion") needs.add("motion");
        const component = specifier.match(/^@fewtone\/ui\/components\/([a-z0-9-]+)\//);
        if (component && component[1] !== basename(dir)) needs.add(component[1]);
        const pkg = packageOf(specifier);
        if (pkg && !builtInPackages.has(pkg)) packages.add(pkg);
      }
    }
    const dependencies = [...packages].sort().map((pkg) => {
      if (!versions[pkg]) {
        errors.push(`${owner}: imports "${pkg}", which is not a dependency of packages/ui/package.json`);
        return pkg;
      }
      return `${pkg}@${versions[pkg]}`;
    });
    return { dependencies, needs, sources };
  }

  // Tokens: read the allow-list from the token files
  const tokensCss = stripComments(readFileSync(join(src, "styles", "tokens.css"), "utf8"));
  const themeCss = stripComments(readFileSync(join(src, "styles", "theme.css"), "utf8"));
  const paletteCss = stripComments(readFileSync(join(src, "styles", "palette.css"), "utf8"));
  const tokenRules = rules(tokensCss);
  const themeBlock = tokenRules.find(([p]) => p.startsWith("@theme"))?.[1] ?? "";
  const themeVars = varsOf(themeBlock);
  const rootVars = varsOf(tokenRules.find(([p]) => p === ":root")?.[1] ?? "");
  const reducedBlock = tokenRules.find(([p]) => p.includes("prefers-reduced-motion"))?.[1] ?? "";
  const reducedVars = varsOf(rules(reducedBlock).find(([p]) => p === ":root")?.[1] ?? "");
  const block = (css, test) => varsOf(rules(css).find(([p]) => test(p))?.[1] ?? "");
  const themeBase = block(themeCss, (p) => p.includes(".light"));
  const themeDark = block(themeCss, (p) => p === ".dark");
  const paletteRoot = block(paletteCss, (p) => p === ":root");
  const paletteLight = block(paletteCss, (p) => p.includes(".light"));
  const paletteDark = block(paletteCss, (p) => p === ".dark");
  const shippedNames = new Set(shared.shippedVariables);

  const light = {};
  const dark = {};
  const theme = {};
  const css = {};
  try {
    for (const name of shared.shippedVariables) {
      if (rootVars[name] === undefined) throw new Error(`--${name} is not in tokens.css :root`);
      light[name] = resolve(rootVars[name], [rootVars, themeVars]);
    }
    for (const name of shared.shippedEasings) light[name] = resolve(themeVars[name], [themeVars]);
    for (const name of shared.shippedColors) {
      light[name] = resolve(`var(--${name})`, [themeBase, paletteLight, paletteRoot]);
      dark[name] = resolve(`var(--${name})`, [themeDark, themeBase, paletteDark, paletteRoot]);
    }
    for (const name of shared.shippedAnimations) {
      const animation = themeVars[`animate-${name}`];
      if (!animation) throw new Error(`--animate-${name} is not in tokens.css @theme`);
      theme[`animate-${name}`] = resolve(animation, [themeVars, rootVars], shippedNames);
      const frames = rules(themeBlock).find(([p]) => p === `@keyframes ${name}`)?.[1];
      if (!frames) throw new Error(`@keyframes ${name} is not in tokens.css @theme`);
      css[`@keyframes ${name}`] = Object.fromEntries(
        rules(frames).map(([step, body]) => [step, declarations(body)]),
      );
    }
    css["@media (prefers-reduced-motion: reduce)"] = {
      ":root": Object.fromEntries(
        Object.entries(reducedVars)
          .filter(([name]) => shippedNames.has(name))
          .map(([name, value]) => [`--${name}`, value]),
      ),
    };
  } catch (error) {
    errors.push(`tokens: ${error.message}`);
  }

  const tokensItem = {
    $schema: SCHEMA_ITEM,
    name: "tokens",
    type: shared.sharedItems.tokens.type,
    title: shared.sharedItems.tokens.title,
    description: shared.sharedItems.tokens.description,
    author: AUTHOR,
    cssVars: { theme, light, dark },
    css,
  };

  /** The same tokens as CSS a user can paste, for the Manual install tab */
  const lines = (decls, indent) =>
    Object.entries(decls)
      .map(([prop, value]) => `${indent}${prop}: ${value};`)
      .join("\n");
  const asVars = (vars) =>
    Object.fromEntries(Object.entries(vars).map(([name, value]) => [`--${name}`, value]));
  const colorMappings = Object.fromEntries(
    shared.shippedColors.map((name) => [`--color-${name}`, `var(--${name})`]),
  );
  const keyframes = Object.entries(css)
    .filter(([key]) => key.startsWith("@keyframes"))
    .map(
      ([key, steps]) =>
        `  ${key} {\n${Object.entries(steps)
          .map(([step, decls]) => `    ${step} {\n${lines(decls, "      ")}\n    }`)
          .join("\n")}\n  }`,
    )
    .join("\n");
  const reduced = lines(css["@media (prefers-reduced-motion: reduce)"]?.[":root"] ?? {}, "    ");
  const manualCss = [
    `:root {\n${lines(asVars(light), "  ")}\n}`,
    `.dark {\n${lines(asVars(dark), "  ")}\n}`,
    `@theme inline {\n${lines({ ...asVars(theme), ...colorMappings }, "  ")}\n${keyframes}\n}`,
    `@media (prefers-reduced-motion: reduce) {\n  :root {\n${reduced}\n  }\n}`,
  ].join("\n\n");

  // Motion presets
  const motionFiles = shared.sharedItems.motion.files;
  const motion = analyse("motion", "", motionFiles);
  const motionItem = {
    $schema: SCHEMA_ITEM,
    name: "motion",
    type: shared.sharedItems.motion.type,
    title: shared.sharedItems.motion.title,
    description: shared.sharedItems.motion.description,
    author: AUTHOR,
    dependencies: motion.dependencies,
    files: motion.sources.map(({ file, source }) => ({
      path: `registry/fewtone/lib/${basename(file)}`,
      type: "registry:lib",
      content: toProjectImports(source),
    })),
  };

  // Items with pages
  const install = new Map();
  const itemJson = [];
  for (const item of items) {
    const type = kinds[item.kind].registryType;
    const owner = item.dir;
    const { dependencies, needs, sources } = analyse(owner, item.dir, item.files, item.dependencies);
    const registry = ["tokens", ...(needs.has("motion") ? ["motion"] : [])];
    for (const name of [...needs, ...item.registryDependencies]) {
      if (name === "motion" || registry.includes(name)) continue;
      if (!items.some((other) => other.name === name))
        errors.push(`${owner}: imports unknown item "${name}"`);
      else registry.push(name);
    }
    install.set(item.name, { dependencies, registry });
    itemJson.push({
      $schema: SCHEMA_ITEM,
      name: item.name,
      type,
      title: item.title,
      description: item.description,
      author: AUTHOR,
      ...(dependencies.length > 0 ? { dependencies } : {}),
      registryDependencies: registry.map(urlOf),
      files: sources.map(({ file, source }) => ({
        path: `registry/fewtone/${FOLDERS[type] ?? "components"}/${basename(file)}`,
        type,
        content: toProjectImports(source),
      })),
      categories: [item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")],
      docs: `Usage and examples: ${siteOrigin}${item.href}`,
    });
  }

  const all = [tokensItem, motionItem, ...itemJson];
  const catalog = {
    $schema: SCHEMA_CATALOG,
    name: "fewtone",
    homepage: siteOrigin,
    items: all.map(({ $schema: _schema, ...rest }) => ({
      ...rest,
      ...(rest.files ? { files: rest.files.map(({ content: _content, ...file }) => file) } : {}),
    })),
  };

  const outDir = join(root, "apps", "www", "public", "r");
  const files = [
    ...all.map((item) => [join(outDir, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`]),
    [join(outDir, "registry.json"), `${JSON.stringify(catalog, null, 2)}\n`],
  ];

  return {
    errors,
    install,
    manualCss,
    write() {
      if (existsSync(outDir)) rmSync(outDir, { recursive: true });
      mkdirSync(outDir, { recursive: true });
      for (const [path, source] of files) writeFileSync(path, source);
      return files.length;
    },
  };
}
