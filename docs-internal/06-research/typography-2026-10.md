# Typography research (2026-10-08)

Feeds the type decision in `01-brand/foundations.html`.

## Licence rule
The library is MIT and ships fonts in a public repo, so fonts must be SIL OFL (or equivalent).
- **Excluded:** Fontshare families (Satoshi, General Sans, Switzer). Their ITF Free Font License forbids modification (including subsetting) and distribution from public repositories.
- **Excluded:** Berkeley Mono. It is commercial; Linear uses it.

## Google Fonts strips alternates
Google Fonts, `next/font/google` and Fontsource serve Inter and Geist without stylistic sets or character variants. Tabular numbers (`tnum`) survive.
- To use alternates, self-host the upstream files with `next/font/local`:
  - Inter: `InterVariable.woff2` from rsms.me, which has cv01–cv14 and ss01–ss08.
  - Geist: the `geist` npm package, which has ss01–ss11.

## Shortlist (all OFL)
| Role | Family | Notes |
|---|---|---|
| Sans | Inter 4 | opsz axis (14–32) switches to Inter Display at large sizes; Linear uses this approach. Has tnum. Very common. |
| Sans | Geist | Vercel's family and the Next.js default, so it reads as Vercel. Italics were added in 2026. |
| Sans | Instrument Sans | wdth 75–100 (animatable), wght 400–700, Latin only, has tnum. |
| Sans | Mona Sans | wdth 75–125, wght 200–900. Reads as GitHub. |
| Mono | JetBrains Mono | Best code legibility. |
| Mono | Commit Mono | Soft; Resend uses it. Fontsource only, not on Google Fonts. |
| Mono | Geist Mono | Raycast uses it. |
| Mono | Fragment Mono | One weight; "Helvetica as a mono". |
| Display | Instrument Serif | Condensed, high contrast; increasingly common on startup sites. |
| Display | Newsreader | Calm, editorial; opsz 6–72. |

**No tnum in the Google Fonts builds** (avoid for animated counters): Hanken Grotesk, Albert Sans, Host Grotesk, Rethink Sans.

## Type-scale references
- **Vercel Geist:** headings at 72/64/56/48/40 use −0.06em; 32/24 use −0.04em; 20/16/14 use −0.02em. Body text has no tracking.
- **Radix Themes:** 9 steps from 12/16 to 60/60, tracking from +0.0025em to −0.025em.
- **Linear:**
  - Inter at weights 400/510/590.
  - Body is 15px / 1.6 at −0.011em.
  - Titles from 32px up use −0.022em.
- **Fluid sizing:** use clamp only for display and h1; keep UI text fixed. Utopia's 360→1240px viewport range is a good default.

## Sources
- Fontsource API
- Google Fonts metadata
- woff2 feature inspection with fontTools
- Live CSS of vercel.com, linear.app, resend.com and raycast.com
- linear.app/now/how-we-redesigned-the-linear-ui
- radix-ui.com/themes/docs/theme/typography
- vercel.com/geist/typography
- fontshare.com/licenses/itf-ffl
