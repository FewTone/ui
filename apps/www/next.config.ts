import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Guides are `page.mdx` files inside app/
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@fewtone/ui"],
  // Theming was folded into Installation (owner, 2026-10-13); keep the old address working for links and search
  redirects() {
    return [
      { source: "/docs/theming", destination: "/docs/installation#customize-the-theme", permanent: true },
    ];
  },
  // The shadcn registry (public/r, generated): readable from anywhere, kept out of search results (ADR 0009)
  headers() {
    return [
      {
        source: "/r/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Plugins are referenced by name so they work with Turbopack
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
