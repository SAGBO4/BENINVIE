import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import {
  JetBrains_Mono,
  Montserrat,
  Plus_Jakarta_Sans,
} from "next/font/google";

import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { ServiceWorker } from "@/components/pwa/service-worker";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

/** Texte courant: humaniste, très lisible aux petites tailles. */
const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans-loaded",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

/** Titres et signature de marque: géométrique, alignée sur le logo HEMORA. */
const displayFont = Montserrat({
  variable: "--font-display-loaded",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

/** Données techniques: empreintes, adresses Bitcoin, factures Lightning. */
const monoFont = JetBrains_Mono({
  variable: "--font-mono-loaded",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteConfig.name,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F1216" },
    { media: "(prefers-color-scheme: light)", color: "#FCFCFC" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      // Next 16 ne neutralise plus `scroll-behavior: smooth` pendant une
      // navigation sans cet attribut: les changements de page sauteraient
      // en douceur au lieu d'être instantanés.
      data-scroll-behavior="smooth"
      className={`${sansFont.variable} ${displayFont.variable} ${monoFont.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        {/* Repli sans JavaScript: `Reveal` part de `opacity: 0` et compte sur
            un IntersectionObserver. Sans script, les pages publiques
            resteraient blanches. Ce style ne s'applique que dans ce cas. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
          <Toaster />
          <ServiceWorker />
          <OfflineIndicator />
          <InstallPrompt />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
