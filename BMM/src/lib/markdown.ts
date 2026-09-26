/**
 * Rendu d'un sous-ensemble de Markdown, sans dépendance et sans HTML brut.
 *
 * Les textes viennent de l'interface d'administration. Même écrits par une
 * personne de confiance, ils ne doivent pas pouvoir injecter de balise: tout
 * est échappé d'abord, et seules les constructions reconnues ci-dessous
 * produisent du balisage.
 *
 * Reconnu: titres `##` et `###`, paragraphes, listes `-`, gras `**`,
 * italique `*`, liens `[texte](url)`. Le reste est rendu tel quel.
 */

export type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** N'autorise que des liens http(s) et mailto: pas de `javascript:`. */
function safeHref(href: string): string | null {
  const trimmed = href.trim();
  return /^(https?:\/\/|mailto:|\/)/i.test(trimmed) ? trimmed : null;
}

/**
 * Applique le balisage en ligne sur du texte **déjà échappé**.
 * Renvoie du HTML sûr: aucune donnée non échappée n'y entre.
 */
export function renderInline(raw: string): string {
  let out = escapeHtml(raw);

  // Liens: [texte](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (match, text: string, href: string) => {
      const url = safeHref(href);
      if (!url) return text;
      const external = /^https?:\/\//i.test(url);
      const attrs = external
        ? ' target="_blank" rel="noreferrer noopener"'
        : "";
      return `<a href="${url}"${attrs}>${text}</a>`;
    },
  );

  // Gras avant italique: sinon `**x**` serait mangé par la règle italique.
  // M-7: `(?:[^*]|\*(?!\*))+` autorise les `*` simples à l'intérieur du gras
  // (ex: `**gras *et* italique**`) sans attraper le marqueur fermant `**`.
  out = out.replace(/\*\*((?:[^*]|\*(?!\*))+)\*\*/g, "<strong>$1</strong>");
  // Look-behind et look-ahead négatifs pour n'attraper que les `*` simples,
  // pas ceux adjacents à un autre `*` (partie d'un marqueur gras).
  out = out.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, "<em>$1</em>");

  return out;
}

/** Découpe un texte Markdown en blocs, sans produire de HTML. */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");

  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push({ type: "list", items: list });
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        text: heading[2],
      });
      continue;
    }

    const item = /^[-*]\s+(.*)$/.exec(trimmed);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}
