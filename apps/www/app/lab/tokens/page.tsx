import { duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const colorGroups = [
  {
    title: "Surfaces and text",
    tokens: ["background", "foreground", "card", "muted", "muted-foreground", "accent", "overlay"],
  },
  { title: "Lines", tokens: ["border", "input", "ring"] },
  { title: "Actions", tokens: ["primary", "primary-foreground", "secondary", "destructive"] },
  { title: "Brand", tokens: ["brand", "brand-foreground", "brand-subtle", "brand-border", "brand-text"] },
];

const status = [
  {
    name: "Success",
    box: "bg-success-subtle border-success-border",
    dot: "bg-success",
    text: "text-success-text",
    title: "Component installed",
    body: "Toggle was added to components/ui.",
  },
  {
    name: "Warning",
    box: "bg-warning-subtle border-warning-border",
    dot: "bg-warning",
    text: "text-warning-text",
    title: "Peer dependency",
    body: "motion 12 or newer is recommended.",
  },
  {
    name: "Danger",
    box: "bg-danger-subtle border-danger-border",
    dot: "bg-danger",
    text: "text-danger-text",
    title: "Install failed",
    body: "components.json was not found.",
  },
  {
    name: "Info",
    box: "bg-info-subtle border-info-border",
    dot: "bg-info",
    text: "text-info-text",
    title: "New version",
    body: "Sidebar v2 is available.",
  },
];

const typeScale = [
  { token: "display", cls: "text-display", sample: "Motion-ready" },
  { token: "h1", cls: "text-h1", sample: "Getting started" },
  { token: "h2", cls: "text-h2", sample: "Install in one command" },
  { token: "h3", cls: "text-h3", sample: "Props and variants" },
  { token: "h4", cls: "text-h4", sample: "Keyboard interactions" },
  { token: "body-lg", cls: "text-body-lg", sample: "Accessible React components with considered motion." },
  {
    token: "body",
    cls: "text-body",
    sample: "Copy the source, keep the polish, and change anything you need.",
  },
  { token: "body-sm", cls: "text-body-sm", sample: "Toggle supports controlled and uncontrolled use." },
  { token: "label", cls: "text-label", sample: "Browse components" },
  { token: "caption", cls: "text-caption", sample: "Updated 2 days ago" },
  { token: "overline", cls: "text-overline font-mono uppercase", sample: "Components / Toggle" },
  { token: "code", cls: "text-code font-mono", sample: "npx shadcn add @fewtone/toggle" },
];

const spacingSteps = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];

const radii = [
  { token: "xs", cls: "rounded-xs" },
  { token: "sm", cls: "rounded-sm" },
  { token: "md", cls: "rounded-md" },
  { token: "lg", cls: "rounded-lg" },
  { token: "xl", cls: "rounded-xl" },
  { token: "2xl", cls: "rounded-2xl" },
  { token: "3xl", cls: "rounded-3xl" },
  { token: "full", cls: "rounded-full" },
];

const elevations = [
  { token: "xs", cls: "shadow-xs" },
  { token: "sm", cls: "shadow-sm" },
  { token: "md", cls: "shadow-md" },
  { token: "lg", cls: "shadow-lg" },
  { token: "xl", cls: "shadow-xl" },
  { token: "card", cls: "shadow-card" },
];

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t pt-8">
      <div className="grid gap-1">
        <h2 className="text-h3">{title}</h2>
        {note ? <p className="max-w-prose text-body-sm text-muted-foreground">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Name({ children }: { children: ReactNode }) {
  return <span className="font-mono text-caption text-muted-foreground">{children}</span>;
}

export default function TokensPage() {
  return (
    <main className="mx-auto grid w-full max-w-content gap-12 px-(--space-gutter) py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <p className="text-overline font-mono text-muted-foreground uppercase">Lab · dev only</p>
          <h1 className="text-h1 text-gradient-heading">Design tokens</h1>
          <p className="max-w-prose text-body text-muted-foreground">
            Every value the library uses, rendered from the live CSS variables. Spec:{" "}
            <code className="text-code">docs-internal/01-brand/design-system.md</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="focus-ring rounded-md px-3 py-2 text-label text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <Section
        title="Colour"
        note="Semantic tokens only. Primitive scales exist in CSS but are not exposed as utilities."
      >
        <div className="grid gap-6">
          {colorGroups.map((group) => (
            <div key={group.title} className="grid gap-3">
              <p className="text-label">{group.title}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {group.tokens.map((token) => (
                  <div key={token} className="grid gap-2">
                    <div className="h-12 rounded-lg shadow-card" style={{ background: `var(--${token})` }} />
                    <Name>{token}</Name>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Status" note="Deep and muted, in the same tone as Navy. Info uses the brand scale.">
        <div className="grid gap-3 sm:grid-cols-2">
          {status.map((s) => (
            <div key={s.name} className={cn("flex gap-3 rounded-lg border p-4", s.box)}>
              <span className={cn("mt-2 size-2 shrink-0 rounded-full", s.dot)} aria-hidden />
              <div className="grid gap-0.5">
                <p className={cn("text-label", s.text)}>{s.title}</p>
                <p className={cn("text-body-sm opacity-90", s.text)}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Typography"
        note="Geist and Geist Mono. Each size token carries its own line height, tracking and weight."
      >
        <div className="grid gap-4">
          {typeScale.map((t) => (
            <div key={t.token} className="grid items-baseline gap-1 sm:grid-cols-6">
              <Name>{t.token}</Name>
              <p className={cn("truncate sm:col-span-5", t.cls)}>{t.sample}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Spacing" note="A 4px grid. These are the only steps used for padding, margin and gaps.">
        <div className="grid gap-2">
          {spacingSteps.map((step) => (
            <div key={step} className="grid grid-cols-6 items-center gap-3">
              <Name>
                {step} · {step * 4}px
              </Name>
              <div
                className="col-span-5 h-3 rounded-xs bg-foreground/80"
                style={{ width: `calc(var(--spacing) * ${step})` }}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius">
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
          {radii.map((r) => (
            <div key={r.token} className="grid gap-2">
              <div className={cn("aspect-square bg-muted shadow-card", r.cls)} />
              <Name>{r.token}</Name>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Elevation"
        note="Neutral shadows. Dark mode uses deeper shadows and a lit top edge on cards."
      >
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {elevations.map((e) => (
            <div key={e.token} className="grid gap-2">
              <div className={cn("h-20 rounded-xl bg-card", e.cls)} />
              <Name>{e.token}</Name>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Brand moments"
        note="The only places the brand colour appears. One-tone gradient, no glow, no grain."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface-brand grid gap-2 rounded-2xl p-6">
            <p className="text-label">Pro</p>
            <p className="text-h3">Blocks and templates</p>
            <p className="text-body-sm opacity-80">surface-brand</p>
          </div>
          <div className="surface-brand-footer grid content-end gap-1 rounded-xl p-6">
            <p className="text-h2 text-gradient-on-brand">FewTone UI</p>
            <p className="text-body-sm opacity-80">surface-brand-footer + text-gradient-on-brand</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="edge-brand inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-2 text-label text-muted-foreground">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              <span className="text-foreground">New</span> Sidebar v2
            </span>
            <span className="rounded-full bg-brand-subtle px-2 py-0.5 text-caption text-brand-text">New</span>
            <span className="text-body-sm">
              Selected <span className="bg-(--selection)">text looks like this</span>.
            </span>
          </div>
        </div>
      </Section>

      <Section
        title="Logo"
        note="The FewTone mark, unchanged and static (ADR 0006). One colour, always currentColor: it takes the text colour of wherever it sits. Three variations: horizontal, stacked, and the mark alone."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="light grid place-items-center gap-4 rounded-xl border bg-background p-8 text-foreground">
            <LogoMark className="h-(--size-logo-lg) w-auto" />
            <Name>light · foreground</Name>
          </div>
          <div className="dark grid place-items-center gap-4 rounded-xl border bg-background p-8 text-foreground">
            <LogoMark className="h-(--size-logo-lg) w-auto" />
            <Name>dark · foreground</Name>
          </div>
          <div className="surface-brand-footer grid place-items-center gap-4 rounded-xl p-8">
            <LogoMark className="h-(--size-logo-lg) w-auto" />
            <span className="font-mono text-caption opacity-80">footer · brand-foreground</span>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-12">
          <div className="grid gap-3">
            <Logo className="text-body-sm" />
            <Name>Horizontal · header · size-logo-sm</Name>
          </div>
          <div className="grid gap-3">
            <div className="grid justify-items-start gap-3">
              <LogoMark className="h-(--size-logo-lg) w-auto" />
              <p className="text-h2">FewTone UI</p>
            </div>
            <Name>Stacked · footer · size-logo-lg</Name>
          </div>
          <div className="grid gap-3">
            <LogoMark className="h-(--size-logo-lg) w-auto" />
            <Name>Mark only · favicon, app icon</Name>
          </div>
        </div>
      </Section>

      <Section
        title="Motion"
        note="CSS durations and easings, mirrored in @fewtone/ui/lib/motion for motion/react."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="grid content-start gap-2">
            <p className="text-label">Durations</p>
            {Object.entries(duration).map(([name, value]) => (
              <Name key={name}>
                {name} · {value * 1000}ms
              </Name>
            ))}
          </div>
          <div className="grid content-start gap-2">
            <p className="text-label">Easings</p>
            {Object.entries(ease).map(([name, value]) => (
              <Name key={name}>
                {name} · [{value.join(", ")}]
              </Name>
            ))}
          </div>
          <div className="grid content-start gap-2">
            <p className="text-label">Springs</p>
            {Object.entries(spring).map(([name, value]) => (
              <Name key={name}>
                {name} · stiffness {value.stiffness}, damping {value.damping}
              </Name>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
