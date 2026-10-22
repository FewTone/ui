// Zips every public skill (skills/<name>/) into apps/www/public/skills/<name>.zip, for the site's download
// button (ADR 0013). Run by scripts/build-index.mjs, so `pnpm dev` and the deploy build always ship a fresh zip.
//
// The zip holds the skill's folder (`smooth-ui/SKILL.md`, `smooth-ui/references/...`), the layout the Claude
// apps' skill upload and a hand copy into `.claude/skills/` both expect. Written with Node's own zlib (deflate
// and CRC-32), so there's no dependency, and byte-for-byte the same on every build: sorted paths, a fixed date
// and LF line endings.

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { crc32, deflateRawSync } from "node:zlib";

/** Every file under a folder, sorted, as paths relative to it with forward slashes */
function filesIn(folder) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else out.push(relative(folder, path).split(sep).join("/"));
    }
  };
  walk(folder);
  return out;
}

/** A zip archive (deflate) of [path, contents] entries */
function zip(entries) {
  // 1980-01-01 00:00, the earliest DOS date: a fixed stamp keeps the archive identical between builds
  const time = 0;
  const date = (1 << 5) | 1;
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [path, data] of entries) {
    const name = Buffer.from(path, "utf8");
    const packed = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, packed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42); // where its local header starts
    centrals.push(central, name);

    offset += local.length + name.length + packed.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

/** Writes one zip per skill and returns their names */
export function buildSkillZips(root) {
  const skills = join(root, "skills");
  const out = join(root, "apps", "www", "public", "skills");
  mkdirSync(out, { recursive: true });
  const names = readdirSync(skills)
    .filter((name) => statSync(join(skills, name)).isDirectory())
    .sort();
  for (const name of names) {
    const folder = join(skills, name);
    const entries = filesIn(folder).map((path) => {
      let data = readFileSync(join(folder, path));
      // Text in LF, whatever the checkout uses
      if (/\.(md|txt|ts|tsx|js|json)$/.test(path))
        data = Buffer.from(data.toString("utf8").replace(/\r\n/g, "\n"));
      return [`${name}/${path}`, data];
    });
    writeFileSync(join(out, `${name}.zip`), zip(entries));
  }
  return names;
}
