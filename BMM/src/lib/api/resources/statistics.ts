import { httpClient } from "@/lib/api/http-client";

import type { PublicStatistics } from "./types";

export const statisticsApi = {
  /** Agrégats publics affichés sur la page d'accueil. */
  publicStats: () => httpClient.get<PublicStatistics>("/public/stats"),
};
