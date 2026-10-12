import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { LOGO_PATHS } from "./logo";

/*
 * Social image card (1200 × 630), rendered by next/og. Satori cannot read CSS variables,
 * so the dark-theme colours are written out here; they mirror gray-1, gray-12 and gray-11.
 */
const colors = {
  background: "#070707", // check-tokens-ignore: OG images cannot use CSS variables (gray-1 dark)
  foreground: "#f5f5f5", // check-tokens-ignore: OG images cannot use CSS variables (gray-12 dark)
  muted: "#a8a8a8", // check-tokens-ignore: OG images cannot use CSS variables (gray-11 dark)
};

export const ogSize = { width: 1200, height: 630 };

/** Geist from the `geist` package, read once and cached */
async function readFont(file: string) {
  "use cache";
  cacheLife("max");
  const data = await readFile(
    path.join(process.cwd(), "node_modules", "geist", "dist", "fonts", "geist-sans", file),
  );
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

export async function ogFonts() {
  const [regular, semibold] = await Promise.all([
    readFont("Geist-Regular.ttf"),
    readFont("Geist-SemiBold.ttf"),
  ]);
  return [
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

export function OgCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: colors.background,
        color: colors.foreground,
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: drawn into a PNG by next/og, never shown as HTML; the image has alt text */}
        <svg width={50} height={36} viewBox="0 0 42 30" fill={colors.foreground}>
          {LOGO_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
        <div style={{ display: "flex", gap: 10, fontSize: 32, fontWeight: 600, letterSpacing: -1 }}>
          <span>FewTone</span>
          <span style={{ color: colors.muted, fontWeight: 400 }}>UI</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <span style={{ fontSize: 26, color: colors.muted }}>{eyebrow}</span>
        <span style={{ fontSize: 76, fontWeight: 600, letterSpacing: -3, lineHeight: 1.05 }}>{title}</span>
        <span style={{ fontSize: 30, color: colors.muted, lineHeight: 1.4, maxWidth: 940 }}>
          {description}
        </span>
      </div>
      <span style={{ fontSize: 24, color: colors.muted }}>ui.fewtone.com</span>
    </div>
  );
}
