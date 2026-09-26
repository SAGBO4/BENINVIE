import { httpClient } from "@/lib/api/http-client";

export type SiteContent = {
  key: string;
  title: string;
  /** Markdown restreint: titres, listes, gras, liens. */
  body: string;
  updatedAt: string;
};

export type SaveContentPayload = {
  key: string;
  title: string;
  body: string;
};

export const contentApi = {
  /** Contenus enregistrés (super-admin). */
  list: () => httpClient.get<SiteContent[]>("/admin/content"),

  /** Crée ou remplace le texte d'une page (super-admin). */
  save: (payload: SaveContentPayload) =>
    httpClient.put<SiteContent>("/admin/content", payload),
};
