import { ImageResponse } from "next/og";
import { OgCard, ogFonts, ogSize } from "@/components/og-card";
import { getKindBySegment, getKinds } from "@/lib/content";
import { site } from "@/lib/site";

export const alt = "FewTone UI";
export const size = ogSize;
export const contentType = "image/png";

/** Built at build time like the pages, so no font files are read at request time */
export async function generateStaticParams() {
  return getKinds().map((kind) => ({ kind: kind.segment }));
}

/** Social card for a kind's index page, for example /components */
export default async function Image({ params }: { params: Promise<{ kind: string }> }) {
  const { kind: segment } = await params;
  const kind = getKindBySegment(segment);

  return new ImageResponse(
    <OgCard
      eyebrow="Free and open source"
      title={kind?.heading ?? site.name}
      description={kind?.intro ?? site.description}
    />,
    { ...size, fonts: await ogFonts() },
  );
}
