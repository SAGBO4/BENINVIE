import { Container } from "@/components/layout/container";
import { parseMarkdown, renderInline } from "@/lib/markdown";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Rend un document légal écrit en Markdown restreint.
 *
 * Le HTML produit ne vient jamais du texte brut: `renderInline` échappe tout,
 * puis ne réintroduit que le balisage qu'il a lui-même reconnu.
 */
export function MarkdownArticle({
  title,
  body,
  updatedAt,
  managed,
}: {
  title: string;
  body: string;
  updatedAt: string;
  /** Vrai lorsque le texte vient de la console d'administration. */
  managed?: boolean;
}) {
  const blocks = parseMarkdown(body);
  const updated = new Date(updatedAt);
  const updatedLabel = Number.isNaN(updated.getTime())
    ? updatedAt
    : dateFmt.format(updated);

  return (
    <Container className="py-16 sm:py-24">
      <article className="mx-auto max-w-2xl">
        <header className="border-border mb-12 border-b pb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Dernière mise à jour: {updatedLabel}
            {managed ? null : " (version livrée avec l'application)"}
          </p>
        </header>

        <div className="space-y-6 leading-relaxed">
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              const Tag = block.level === 2 ? "h2" : "h3";
              return (
                <Tag
                  key={index}
                  className={
                    block.level === 2
                      ? "font-display mt-12 mb-4 text-xl font-bold tracking-tight first:mt-0"
                      : "font-display mt-8 mb-3 text-lg font-bold tracking-tight"
                  }
                >
                  {block.text}
                </Tag>
              );
            }

            if (block.type === "list") {
              return (
                <ul key={index} className="space-y-2.5">
                  {block.items.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-primary/50 mt-2.5 size-1.5 shrink-0 rounded-full"
                      />
                      <span
                        className="text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                        dangerouslySetInnerHTML={{
                          __html: renderInline(item),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p
                key={index}
                className="text-muted-foreground [&_a]:text-primary [&_strong]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: renderInline(block.text) }}
              />
            );
          })}
        </div>
      </article>
    </Container>
  );
}
