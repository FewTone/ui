"use client";

import { CheckIcon, CopyIcon, EllipsisIcon, ExternalLinkIcon } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useState } from "react";
import { CopyPromptButton } from "./copy-prompt-button";

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-body-sm outline-none data-[highlighted]:bg-accent";

/**
 * The page's actions: "Copy prompt" for the user's AI assistant, plus a menu to copy the page as
 * Markdown or open it in ChatGPT or Claude.
 */
export function PageActions({
  markdown,
  prompt,
  url,
  title,
}: {
  markdown: string;
  prompt: string;
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const question = encodeURIComponent(
    `I'm reading the ${title} page of FewTone UI (${url}). Help me add it to my Next.js project and use it.`,
  );

  async function copyPage() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <CopyPromptButton prompt={prompt} />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          aria-label="More page actions"
          className="focus-ring inline-flex size-(--size-control-sm) items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground"
        >
          <EllipsisIcon className="size-(--size-icon-md)" aria-hidden />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-(--z-dropdown) grid min-w-52 gap-0.5 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-scale-in"
          >
            <DropdownMenu.Item className={itemClass} onSelect={copyPage}>
              {copied ? (
                <CheckIcon className="size-(--size-icon-sm)" aria-hidden />
              ) : (
                <CopyIcon className="size-(--size-icon-sm)" aria-hidden />
              )}
              {copied ? "Copied" : "Copy page as Markdown"}
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild className={itemClass}>
              <a href={`https://chatgpt.com/?q=${question}`} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="size-(--size-icon-sm)" aria-hidden />
                Open in ChatGPT
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild className={itemClass}>
              <a href={`https://claude.ai/new?q=${question}`} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="size-(--size-icon-sm)" aria-hidden />
                Open in Claude
              </a>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
