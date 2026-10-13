import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ReactElement } from "react";
import { CodeBlock } from "@/components/docs/code-block";

/** How guide pages (app/(browse)/docs/**\/page.mdx) render: tokens only, code highlighted on the server */
const components: MDXComponents = {
  // The page area is full width; guides keep a readable line length
  wrapper: ({ children }) => <article className="grid max-w-docs gap-5">{children}</article>,
  h1: (props) => <h1 className="text-h2" {...props} />,
  h2: (props) => <h2 className="mt-6 scroll-mt-24 text-h3" {...props} />,
  h3: (props) => <h3 className="mt-2 scroll-mt-24 text-h4" {...props} />,
  p: (props) => <p className="text-body text-muted-foreground" {...props} />,
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  a: ({ href = "", children, ...props }) =>
    href.startsWith("/") || href.startsWith("#") ? (
      <Link
        href={href}
        className="focus-ring rounded-sm font-medium text-foreground underline underline-offset-4"
        {...props}
      >
        {children}
      </Link>
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="focus-ring rounded-sm font-medium text-foreground underline underline-offset-4"
        {...props}
      >
        {children}
      </a>
    ),
  ul: (props) => <ul className="grid list-disc gap-2 pl-6 text-muted-foreground" {...props} />,
  ol: (props) => <ol className="grid list-decimal gap-2 pl-6 text-muted-foreground" {...props} />,
  code: (props) => (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-caption text-foreground" {...props} />
  ),
  pre: ({ children }) => {
    const code = children as ReactElement<{ className?: string; children?: string }>;
    const lang = code.props.className?.replace("language-", "") ?? "text";
    return <CodeBlock code={String(code.props.children ?? "")} lang={lang} />;
  },
  table: (props) => (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-body-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border-b bg-muted px-4 py-2 text-caption font-medium text-muted-foreground" {...props} />
  ),
  td: (props) => <td className="border-b px-4 py-2 align-top" {...props} />,
  hr: () => <hr className="border-t" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
