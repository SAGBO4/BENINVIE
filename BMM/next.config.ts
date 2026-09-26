import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Toutes les images sont servies depuis /public. Aucun hôte distant n'est
  // autorisé: un hébergeur tiers lent bloquait l'affichage de la page
  // d'accueil et exposait l'adresse IP des visiteurs à un service externe.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
