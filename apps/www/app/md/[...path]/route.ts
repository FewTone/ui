import { markdownFor, markdownPaths } from "@/lib/llms";

/*
 * The Markdown version of every page, for AI tools: `/components/button.md` and `/docs/installation.md` are
 * rewritten here (next.config.ts). Prerendered from lib/llms.ts at build time.
 */

export function generateStaticParams() {
  return markdownPaths().map((path) => ({ path }));
}

export async function GET(_request: Request, { params }: RouteContext<"/md/[...path]">) {
  const { path } = await params;
  const body = await markdownFor(path);
  if (body === null) {
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
