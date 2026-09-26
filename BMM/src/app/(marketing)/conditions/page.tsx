import type { Metadata } from "next";

import { MarkdownArticle } from "@/components/legal/markdown-article";
import { LEGAL_DOCUMENTS } from "@/config/legal-content";
import { contentService } from "@/modules/content";

const FALLBACK = LEGAL_DOCUMENTS["conditions"];

export const metadata: Metadata = {
  title: FALLBACK.title,
  description: `${FALLBACK.title} de la plateforme HEMORA.`,
};

/**
 * Le texte vient de la console d'administration quand il y a été enregistré,
 * de la version livrée avec l'application sinon. Une page légale ne doit
 * jamais disparaître parce qu'une requête a échoué.
 */
export default async function Page() {
  const managed = await contentService.get(FALLBACK.key);

  return (
    <MarkdownArticle
      title={managed?.title ?? FALLBACK.title}
      body={managed?.body ?? FALLBACK.body}
      updatedAt={managed?.updatedAt ?? "5 juillet 2026"}
      managed={Boolean(managed)}
    />
  );
}
