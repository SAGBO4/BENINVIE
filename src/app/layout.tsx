import { Nav } from "@/components/layout/nav";
import { PageBackdrop } from "@/components/layout/page-backdrop";
import { Providers } from "@/components/layout/providers";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { baseMetadata } from "@/lib/metadata";
import type { Metadata, Viewport } from "next";

import { PWARegister } from "@/components/pwa-register";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#0a3764",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return (
    <html lang="fr" className="light overflow-x-hidden max-w-full" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-[#0a3764]/10 selection:text-[#0a3764] overflow-x-hidden w-full max-w-full relative">
        <Providers>
          <div className="flex min-h-screen flex-col w-full max-w-full overflow-x-hidden">
            <PWARegister />
            <SkipToContent />
            <Nav />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
