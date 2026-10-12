"use client";

import { CheckIcon, ChevronDownIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useState } from "react";

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-body-sm outline-none data-[highlighted]:bg-accent";

/** "Copy page" as Markdown, plus links that open the page in an AI assistant */
export function PageActions({ markdown, url, title }: { markdown: string; url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const prompt = encodeURIComponent(
    `I'm reading the ${title} page of FewTone UI (${url}). Help me add it to my Next.js project and use it.`,
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked
    }
  }

  return (
    <div className="inline-flex shrink-0 items-stretch overflow-hidden rounded-lg border text-label">
      <button
        type="button"
        onClick={copy}
        className="focus-ring inline-flex items-center gap-1.5 px-2.5 py-1 transition-colors duration-(--duration-fast) ease-out hover:bg-accent"
      >
        {copied ? (
          <CheckIcon className="size-(--size-icon-sm)" aria-hidden />
        ) : (
          <CopyIcon className="size-(--size-icon-sm)" aria-hidden />
        )}
        {copied ? "Copied" : "Copy page"}
      </button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          aria-label="More page actions"
          className="focus-ring inline-flex items-center border-l px-1.5 transition-colors duration-(--duration-fast) ease-out hover:bg-accent"
        >
          <ChevronDownIcon className="size-(--size-icon-sm)" aria-hidden />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-(--z-dropdown) grid min-w-52 gap-0.5 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-scale-in"
          >
            <DropdownMenu.Item className={itemClass} onSelect={copy}>
              <CopyIcon className="size-(--size-icon-sm)" aria-hidden />
              Copy page as Markdown
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild className={itemClass}>
              <a href={`https://chatgpt.com/?q=${prompt}`} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="size-(--size-icon-sm)" aria-hidden />
                Open in ChatGPT
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild className={itemClass}>
              <a href={`https://claude.ai/new?q=${prompt}`} target="_blank" rel="noreferrer">
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
