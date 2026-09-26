"use client";

import { Eye, FileText, Pencil, RotateCcw, Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import { useSaveSiteContent, useSiteContent } from "@/lib/api/hooks";
import {
  LEGAL_DOCUMENTS,
  LEGAL_KEYS,
  type LegalKey,
} from "@/config/legal-content";
import { parseMarkdown, renderInline } from "@/lib/markdown";
import { cn } from "@/lib/utils";

/**
 * Édition des pages légales depuis l'interface, sans passer par le code.
 *
 * Le texte livré avec l'application sert de point de départ et de repli: tant
 * qu'une page n'a pas été enregistrée ici, c'est cette version qui s'affiche
 * sur le site, et le bouton « Revenir au texte d'origine » y ramène.
 */
export function ContentEditor() {
  const stored = useSiteContent();
  const save = useSaveSiteContent();

  const [activeKey, setActiveKey] = useState<LegalKey>(LEGAL_KEYS[0]);
  const [drafts, setDrafts] = useState<
    Partial<Record<LegalKey, { title: string; body: string }>>
  >({});
  const [preview, setPreview] = useState(false);

  const fallback = LEGAL_DOCUMENTS[activeKey];
  const published = stored.data?.find((c) => c.key === activeKey);
  const draft = drafts[activeKey];

  const title = draft?.title ?? published?.title ?? fallback.title;
  const body = draft?.body ?? published?.body ?? fallback.body;
  const dirty =
    draft !== undefined &&
    (draft.title !== (published?.title ?? fallback.title) ||
      draft.body !== (published?.body ?? fallback.body));

  function update(patch: Partial<{ title: string; body: string }>) {
    setDrafts((current) => ({
      ...current,
      [activeKey]: { title, body, ...current[activeKey], ...patch },
    }));
  }

  function resetToShipped() {
    setDrafts((current) => ({
      ...current,
      [activeKey]: { title: fallback.title, body: fallback.body },
    }));
  }

  async function onSave() {
    await save.mutateAsync({ key: activeKey, title, body }).catch(() => {});
    setDrafts((current) => ({ ...current, [activeKey]: undefined }));
  }

  if (stored.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (stored.isError) {
    return (
      <ErrorState
        error={stored.error}
        title="Contenus indisponibles"
        onRetry={() => void stored.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Choix de la page */}
      <div
        role="tablist"
        aria-label="Page à modifier"
        className="border-border flex flex-wrap gap-1 border-b"
      >
        {LEGAL_KEYS.map((key) => {
          const isActive = key === activeKey;
          const isPublished = stored.data.some((c) => c.key === key);
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveKey(key);
                setPreview(false);
              }}
              className={cn(
                "focus-visible:ring-ring -mb-px flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                isActive
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {LEGAL_DOCUMENTS[key].title}
              {isPublished ? null : (
                <span
                  title="Jamais modifiée: la version livrée est en ligne"
                  className="bg-muted-foreground/50 size-1.5 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {published
            ? `Publiée le ${new Date(published.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.`
            : "Cette page n'a jamais été modifiée: la version livrée avec l'application est en ligne."}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? (
              <Pencil className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
            {preview ? "Modifier" : "Aperçu"}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetToShipped}>
            <RotateCcw className="size-4" />
            Texte d&apos;origine
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={!dirty || save.isPending}
          >
            <Save className="size-4" />
            {save.isPending ? "Enregistrement…" : "Publier"}
          </Button>
        </div>
      </div>

      {preview ? (
        <ContentPreview title={title} body={body} />
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content-title">Titre de la page</Label>
            <Input
              id="content-title"
              value={title}
              onChange={(e) => update({ title: e.target.value })}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Label htmlFor="content-body">Texte</Label>
              <span className="text-muted-foreground text-xs">
                Une ligne commençant par deux dièses devient un titre de
                section, par un tiret une puce.
              </span>
            </div>
            <Textarea
              id="content-body"
              value={body}
              onChange={(e) => update({ body: e.target.value })}
              rows={22}
              className="font-mono text-sm leading-relaxed"
            />
            <p className="text-muted-foreground text-xs">
              {body.length.toLocaleString("fr-FR")} caractères. Utilisez
              l&apos;aperçu pour voir la page telle qu&apos;elle sera publiée.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Aperçu rendu avec exactement le même moteur que la page publique. */
function ContentPreview({ title, body }: { title: string; body: string }) {
  const blocks = parseMarkdown(body);

  return (
    <div className="bg-card rounded-xl border p-6 sm:p-8">
      <div className="text-muted-foreground mb-6 flex items-center gap-2 text-xs">
        <FileText className="size-3.5" />
        Aperçu: exactement ce que verront les visiteurs
      </div>
      <h2 className="font-display mb-8 text-2xl font-extrabold tracking-tight">
        {title}
      </h2>
      <div className="max-w-2xl space-y-5 leading-relaxed">
        {blocks.map((block, index) => {
          if (block.type === "heading") {
            return (
              <h3
                key={index}
                className="font-display mt-8 mb-2 text-lg font-bold tracking-tight first:mt-0"
              >
                {block.text}
              </h3>
            );
          }
          if (block.type === "list") {
            return (
              <ul key={index} className="space-y-2">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="bg-primary/50 mt-2.5 size-1.5 shrink-0 rounded-full"
                    />
                    <span
                      className="text-muted-foreground text-sm [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: renderInline(item) }}
                    />
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p
              key={index}
              className="text-muted-foreground text-sm [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: renderInline(block.text) }}
            />
          );
        })}
      </div>
    </div>
  );
}
