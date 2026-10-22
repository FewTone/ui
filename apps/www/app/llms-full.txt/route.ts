import { llmsFullTxt } from "@/lib/llms";

/** /llms-full.txt: every guide and component page in one Markdown file, for tools that read a whole site. Prerendered. */
export async function GET() {
  return new Response(await llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
