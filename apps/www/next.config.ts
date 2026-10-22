import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Guides are `page.mdx` files inside app/
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@fewtone/ui"],
  // The MCP server (app/mcp) reads component and demo source at request time, so ship those files with it
  outputFileTracingIncludes: {
    "/mcp": ["../../packages/ui/src/components/**/*.tsx"],
  },
  // Theming was folded into Installation (owner, 2026-10-13); keep the old address working for links and search
  redirects() {
    return [
      { source: "/docs/theming", destination: "/docs/installation#customize-the-theme", permanent: true },
    ];
  },
  // Every page's Markdown version (lib/llms.ts): its address plus `.md`
  rewrites() {
    return [{ source: "/:path*.md", destination: "/md/:path*" }];
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
      // Markdown copies are for AI tools; search engines keep the HTML page (the canonical)
      { source: "/:path*.md", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/md/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
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
