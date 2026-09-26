import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "HEMORA",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F1216",
    theme_color: "#0F1216",
    lang: "fr",
    categories: ["health", "medical", "social"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Raccourcis proposés par le système à l'appui long sur l'icône.
    shortcuts: [
      {
        name: "Mon espace donneur",
        short_name: "Mon espace",
        url: "/donneur",
      },
      { name: "Vérifier une carte", short_name: "Vérifier", url: "/verify" },
      { name: "Déclencher une alerte", short_name: "Alerte", url: "/alerts" },
    ],
  };
}
