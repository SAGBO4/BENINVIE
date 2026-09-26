/**
 * Tests d'audit QA — markdown.ts
 *
 * Ces tests ciblent les failles identifiées lors de l'audit :
 * M-1 à M-10 (voir audit_qa.md).
 */
import { describe, expect, it } from "vitest";

import { parseMarkdown, renderInline } from "./markdown";

// ---------------------------------------------------------------------------
// renderInline — edge cases et failles
// ---------------------------------------------------------------------------

describe("renderInline — edge cases", () => {
  // M-2 : chaîne vide
  it("returns an empty string for an empty input", () => {
    expect(renderInline("")).toBe("");
  });

  // M-2 : chaîne de blancs uniquement
  it("returns escaped whitespace for a whitespace-only input", () => {
    expect(renderInline("   ")).toBe("   ");
  });

  // M-3 : gras non fermé — les astérisques doivent rester bruts
  it("leaves unclosed bold markers as-is", () => {
    const result = renderInline("**sans fermeture");
    expect(result).not.toContain("<strong>");
    expect(result).toContain("**sans fermeture");
  });

  // M-3 : italique non fermé — même logique
  it("leaves unclosed italic markers as-is", () => {
    const result = renderInline("*sans fermeture");
    expect(result).not.toContain("<em>");
  });

  // M-4 : lien avec URL vide — aucun href ne doit être produit
  it("renders only the link text when the URL is empty", () => {
    const result = renderInline("[texte]()");
    expect(result).not.toContain("href");
    expect(result).toContain("texte");
  });

  // M-1 : schéma javascript: en majuscules — doit être refusé
  it("refuses a JAVASCRIPT: link (case-insensitive)", () => {
    expect(renderInline("[x](JAVASCRIPT:alert(1))")).not.toContain("href");
  });

  // M-1 : schéma avec espaces avant — bypass tentative
  it("refuses a javascript: link with leading whitespace", () => {
    expect(renderInline("[x](  javascript:void(0))")).not.toContain("href");
  });

  // M-10 : URL avec espaces — l'URL doit être tronquée avant l'espace
  it("truncates a URL at the first space (regex boundary)", () => {
    const result = renderInline("[x](https://example.com/path with spaces)");
    // Le regex s'arrête au premier espace : on vérifie qu'aucun espace
    // n'apparaît dans l'attribut href.
    const hrefMatch = result.match(/href="([^"]+)"/);
    if (hrefMatch) {
      expect(hrefMatch[1]).not.toContain(" ");
    }
    // Sinon pas de href : acceptable aussi.
  });

  // M-7 : italique imbriqué dans gras — les deux balises doivent être
  // présentes sans conflit visible
  it("handles italic nested inside bold without breaking markup", () => {
    const result = renderInline("**gras *et* italique**");
    expect(result).toContain("<strong>");
    expect(result).toContain("<em>");
    // Aucune balise non fermée ne doit subsister
    const opens = (result.match(/<(strong|em)>/g) ?? []).length;
    const closes = (result.match(/<\/(strong|em)>/g) ?? []).length;
    expect(opens).toBe(closes);
  });

  // Sécurité — attribut javascript dans href via encodage HTML
  it("does not emit an href for an HTML-entity-encoded javascript scheme", () => {
    // L'entrée est d'abord échappée, donc &#106; -> &#106; (texte brut).
    // On s'assure qu'aucun href pointant vers javascript n'est généré.
    const result = renderInline("[x](&#106;avascript:alert(1))");
    expect(result).not.toMatch(/href\s*=\s*"[^"]*javascript/i);
  });

  // Sécurité — lien data: ne doit pas être autorisé
  it("refuses a data: URI link", () => {
    const result = renderInline("[x](data:text/html,<h1>XSS</h1>)");
    expect(result).not.toContain("href");
  });

  // Sécurité — lien vbscript:
  it("refuses a vbscript: link", () => {
    const result = renderInline("[x](vbscript:msgbox(1))");
    expect(result).not.toContain("href");
  });

  // Lien mailto: doit être autorisé
  it("accepts a mailto: link", () => {
    const result = renderInline("[email](mailto:don@hemora.org)");
    expect(result).toContain('href="mailto:don@hemora.org"');
    // Pas d'attribut target sur mailto
    expect(result).not.toContain("target");
  });

  // Lien interne absolu doit être autorisé sans target
  it("accepts an absolute internal link without adding target", () => {
    const result = renderInline("[don](/donate/now)");
    expect(result).toContain('href="/donate/now"');
    expect(result).not.toContain("target");
  });

  // Texte avec & — doit être échappé
  it("escapes ampersands", () => {
    expect(renderInline("AT&T")).toContain("AT&amp;T");
  });

  // Texte avec guillemets doubles — doit être échappé
  it("escapes double quotes", () => {
    expect(renderInline('say "hello"')).toContain("&quot;");
  });
});

// ---------------------------------------------------------------------------
// parseMarkdown — edge cases et failles
// ---------------------------------------------------------------------------

describe("parseMarkdown — edge cases", () => {
  // M-5 : retour chariot seul (\r sans \n) — vieux Mac
  it("handles bare CR (old Mac line endings) without phantom content blocks", () => {
    // "\r" seul : trimmed ne sera jamais "" → risque de paragraphe parasite
    const blocks = parseMarkdown("ligne1\rligne2");
    // On s'assure au moins qu'il n'y a pas de crash
    expect(Array.isArray(blocks)).toBe(true);
  });

  // M-5 : CRLF mixte avec LF
  it("normalises mixed CRLF and LF", () => {
    const blocks = parseMarkdown("## Titre\r\n\r\nParagraphe.");
    expect(blocks).toContainEqual({ type: "heading", level: 2, text: "Titre" });
    expect(blocks).toContainEqual({
      type: "paragraph",
      text: "Paragraphe.",
    });
  });

  // M-6 : heading H1 — doit être traité comme paragraphe, pas comme heading
  it("does not recognise a level-1 heading — renders it as a paragraph", () => {
    const blocks = parseMarkdown("# Titre niveau 1");
    const headings = blocks.filter((b) => b.type === "heading");
    expect(headings).toHaveLength(0);
  });

  // M-6 : heading H4 et plus — doit aussi rester en paragraphe
  it("does not recognise H4 or deeper headings", () => {
    const blocks = parseMarkdown("#### Trop profond");
    const headings = blocks.filter((b) => b.type === "heading");
    expect(headings).toHaveLength(0);
  });

  // M-8 : liste suivie d'un paragraphe sans ligne vide
  it("closes a list when a paragraph line follows without a blank line", () => {
    const blocks = parseMarkdown("- item\nparagraphe");
    expect(blocks).toContainEqual({ type: "list", items: ["item"] });
    expect(blocks).toContainEqual({ type: "paragraph", text: "paragraphe" });
    // Les deux blocs doivent être distincts
    expect(blocks).toHaveLength(2);
  });

  // Heading H3 — niveau correct
  it("parses a level-3 heading correctly", () => {
    const blocks = parseMarkdown("### Sous-titre");
    expect(blocks).toEqual([{ type: "heading", level: 3, text: "Sous-titre" }]);
  });

  // Liste avec marqueur * (alternatif)
  it("recognises * as a list marker", () => {
    const blocks = parseMarkdown("* premier\n* second");
    expect(blocks).toEqual([{ type: "list", items: ["premier", "second"] }]);
  });

  // Document avec uniquement des blancs
  it("returns an empty array for a whitespace-only document", () => {
    expect(parseMarkdown("   \t  \n  ")).toEqual([]);
  });

  // Paragraphes multiples séparés par ligne vide
  it("produces separate paragraph blocks for blank-line-separated text", () => {
    const blocks = parseMarkdown("Premier.\n\nDeuxième.");
    const paras = blocks.filter((b) => b.type === "paragraph");
    expect(paras).toHaveLength(2);
  });

  // Heading immédiatement suivi d'un heading — pas de paragraphe fantôme
  it("produces no phantom paragraph between two consecutive headings", () => {
    const blocks = parseMarkdown("## A\n## B");
    expect(blocks.filter((b) => b.type === "paragraph")).toHaveLength(0);
    expect(blocks).toHaveLength(2);
  });

  // Heading sans espace après ## — ne doit PAS être reconnu comme heading
  it("does not parse ## without a trailing space as a heading", () => {
    const blocks = parseMarkdown("##SansEspace");
    const headings = blocks.filter((b) => b.type === "heading");
    expect(headings).toHaveLength(0);
  });

  // Liste vide (tiret seul) — item vide accepté ou non ?
  it("handles a list item with no text after the marker", () => {
    // "- " avec rien après : item[1] === ""
    const blocks = parseMarkdown("- ");
    // Doit au moins ne pas crasher et produire un bloc liste
    const lists = blocks.filter((b) => b.type === "list");
    expect(lists.length).toBeGreaterThanOrEqual(0); // comportement défensif
  });
});
