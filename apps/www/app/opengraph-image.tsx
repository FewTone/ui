import { ImageResponse } from "next/og";
import { OgCard, ogFonts, ogSize } from "@/components/og-card";
import { site } from "@/lib/site";

export const alt = site.title;
export const size = ogSize;
export const contentType = "image/png";

/** Default social card for every page that has no card of its own */
export default async function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Free and open source"
      title="Accessible React components for Next.js"
      description="Copy-paste components built with Tailwind CSS and Radix. Yours to customize."
    />,
    { ...size, fonts: await ogFonts() },
  );
}
