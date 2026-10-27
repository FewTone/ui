import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import { Providers } from "./providers";
import "./globals.css";

/* Site-wide defaults. Each page sets its own title, description and canonical address. */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s – ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.studio.name, url: site.studio.url }],
  openGraph: { type: "website", siteName: site.name, locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

// Pages reach the screen's edges, so Drawer's sheet can sit right above a phone's home indicator (safe areas)
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <Providers>
          {/* What steps back, scaled with rounded corners, while a Drawer's sheet is open (Vaul) */}
          <div data-vaul-drawer-wrapper="" className="flex flex-1 flex-col bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
