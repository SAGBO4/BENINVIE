import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";

export const viewport: Viewport = {
  themeColor: "#008751",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Gbɛ (BENINVIE) — Plateforme Nationale de Santé Numérique du Bénin",
  description:
    "Système d'Information Hospitalier National (SANTÉ+) et Réseau d'Urgence Transfusionnelle (HEMORA) - Programme Wadagni-Talata 2026",
  applicationName: "Gbɛ Santé",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gbɛ Santé",
  },
  formatDetection: {
    telephone: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gbɛ Santé" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
