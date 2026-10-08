# Colour and surface research (2026-10-08)

This research fed brand rounds 2–3 and `01-brand/foundations.html`.

## Scale systems
- **Radix, 12 steps:**
  - 1–2: backgrounds
  - 3–5: element fills (normal, hover, active)
  - 6–8: borders (subtle, normal, strong/focus)
  - 9–10: solid and its hover
  - 11–12: text (APCA Lc 60 and Lc 90)
  - Dark scales are tuned separately, not inverted.
- **Vercel Geist:** 10 steps. 100–300 for backgrounds, 400–600 for borders, 700–800 for solids, 900–1000 for text.
- **Linear:** themes are generated in LCH from three inputs: base colour, accent colour and contrast.
- **Material 3:** dark-mode surfaces get *lighter* as elevation rises (tone 4 up to 22).
- **Tailwind v4:** the palette is OKLCH, and chroma peaks at the 600 step.

## Gradients
- Interpolate in oklab or oklch. sRGB passes through grey in the middle.
- For one hue, keep hue and chroma fixed and vary only lightness. The owner asked for exactly this.
- Write explicit, tinted endpoints instead of the `white` or `black` keywords.

## Glow and grain
These were tried in rounds 2–3. The owner removed both, but the findings stay here for reference.
- **Glow:** reads only in dark mode. Light mode should use tinted washes or shadows instead.
- **Grain:**
  - Generate it as noise from an SVG feTurbulence filter (fractalNoise, baseFrequency 0.65–0.9, 3 octaves).
  - Apply it as a mask over a colour that follows the theme, as Neon does.
  - Keep it to about 3–6% visible, use a static tile, and never animate it.

## Reference sites (live CSS checked)
| Site | What to note |
|---|---|
| Vercel | Rim light on black |
| Linear | 4% white glow, grain on each card |
| Resend | Satin streaks, a separate image per theme |
| Clerk | White → light violet → brand glow |
| Raycast | Red keycap glow, conic border on the pill |
| Supabase | Spotlight from the top |
| Neon | Noise used as a mask |
| Mercury | Fractal noise at 0.2 |
| Arc | Matte colour blocks |
| Zed | Dithering to stop banding |
| Mintlify | One hue at two lightness values, one per theme |
| Cursor, Granola | Warm, matte feel |
