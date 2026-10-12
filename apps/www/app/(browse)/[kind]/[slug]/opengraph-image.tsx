import { ImageResponse } from "next/og";
import { OgCard, ogFonts, ogSize } from "@/components/og-card";
import { getItem, getKindBySegment, getKinds } from "@/lib/content";
import { site } from "@/lib/site";

export const alt = "FewTone UI component";
export const size = ogSize;
export const contentType = "image/png";

/** Built at build time like the pages, so no font files are read at request time */
export async function generateStaticParams() {
  const params = getKinds().flatMap((kind) =>
    kind.items.map((item) => ({ kind: kind.segment, slug: item.name })),
  );
  return params.length > 0 ? params : [{ kind: "components", slug: "coming-soon" }];
}

/** One social card per item, generated from its metadata */
export default async function Image({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind: segment, slug } = await params;
  const kind = getKindBySegment(segment);
  const item = getItem(segment, slug);

  return new ImageResponse(
    <OgCard
      eyebrow={`${kind?.label ?? "Component"} · React, Next.js, Tailwind CSS`}
      title={item?.title ?? site.name}
      description={item?.description ?? site.description}
    />,
    { ...size, fonts: await ogFonts() },
  );
}
