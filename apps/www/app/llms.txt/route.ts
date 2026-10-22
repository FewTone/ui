import { llmsTxt } from "@/lib/llms";

/** /llms.txt (llmstxt.org): what FewTone UI is and where every page's Markdown is. Prerendered. */
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
