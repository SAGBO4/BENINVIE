import { describe, expect, it } from "vitest";

import { parseMarkdown, renderInline } from "./markdown";

describe("renderInline", () => {
  it("escapes markup so authored text cannot inject an element", () => {
    expect(renderInline('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
  });

  it("keeps a script tag inert even when wrapped in emphasis", () => {
    const html = renderInline("**<script>alert(1)</script>**");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders bold and italic", () => {
    expect(renderInline("**gras** et *penché*")).toBe(
      "<strong>gras</strong> et <em>penché</em>",
    );
  });

  it("renders an external link with a safe rel", () => {
    const html = renderInline("[site](https://exemple.bj)");
    expect(html).toContain('href="https://exemple.bj"');
    expect(html).toContain('rel="noreferrer noopener"');
  });

  it("keeps an internal link without a target", () => {
    const html = renderInline("[don](/donate)");
    expect(html).toBe('<a href="/donate">don</a>');
  });

  it("refuses a javascript: link and emits no href", () => {
    // Les parenthèses de `alert(1)` referment l'URL avant la fin: le lien est
    // écarté et il reste la parenthèse orpheline. C'est acceptable, ce qui
    // compte est qu'aucun href ne soit produit.
    const html = renderInline("[clic](javascript:alert(1))");
    expect(html).not.toContain("href");
    expect(html).toContain("clic");
  });

  it("refuses a javascript: link without parentheses", () => {
    expect(renderInline("[clic](javascript:void)")).toBe("clic");
  });
});

describe("parseMarkdown", () => {
  it("splits headings, paragraphs and lists", () => {
    const blocks = parseMarkdown(
      ["## Titre", "", "Un paragraphe.", "", "- un", "- deux"].join("\n"),
    );

    expect(blocks).toEqual([
      { type: "heading", level: 2, text: "Titre" },
      { type: "paragraph", text: "Un paragraphe." },
      { type: "list", items: ["un", "deux"] },
    ]);
  });

  it("joins wrapped lines into a single paragraph", () => {
    const blocks = parseMarkdown("Une phrase\ncoupée en deux.");
    expect(blocks).toEqual([
      { type: "paragraph", text: "Une phrase coupée en deux." },
    ]);
  });

  it("closes a list when a heading follows without a blank line", () => {
    const blocks = parseMarkdown("- un\n## Suite");
    expect(blocks).toEqual([
      { type: "list", items: ["un"] },
      { type: "heading", level: 2, text: "Suite" },
    ]);
  });

  it("returns nothing for an empty document", () => {
    expect(parseMarkdown("   \n\n  ")).toEqual([]);
  });
});
