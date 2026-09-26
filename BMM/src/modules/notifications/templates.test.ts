/**
 * Tests exhaustifs pour src/modules/notifications/templates.ts
 *
 * Fonctions pures : aucun mock requis.
 */

import { describe, it, expect } from "vitest";

import {
  renderWelcomeEmail,
  renderRewardEmail,
} from "@/modules/notifications/templates";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Vérifie qu'une chaîne ne contient aucun tag HTML brut issu de l'injection. */
const XSS_PAYLOAD = "<script>alert(1)</script>";
const XSS_ATTR_PAYLOAD = '"onload="alert(1)';
const ESCAPED_LT = "&lt;";
const ESCAPED_GT = "&gt;";
const ESCAPED_AMP = "&amp;";
const ESCAPED_QUOT = "&quot;";

// ─── escapeHtml — testé via les outputs publics ──────────────────────────────

describe("escapeHtml (via renderWelcomeEmail)", () => {
  it("échappe &", () => {
    const { html } = renderWelcomeEmail({
      toName: "A & B",
      bloodType: "O+",
      city: "Dakar",
      verifyUrl: "https://example.com",
    });
    expect(html).toContain(`A ${ESCAPED_AMP} B`);
    expect(html).not.toContain("A & B");
  });

  it("échappe <", () => {
    const { html } = renderWelcomeEmail({
      toName: "<bold>Test",
      bloodType: "O+",
      city: "Dakar",
      verifyUrl: "https://example.com",
    });
    expect(html).toContain("&lt;bold&gt;Test");
  });

  it("échappe >", () => {
    const { html } = renderWelcomeEmail({
      toName: "Test>Value",
      bloodType: "O+",
      city: "Dakar",
      verifyUrl: "https://example.com",
    });
    expect(html).toContain("Test&gt;Value");
  });

  it('échappe "', () => {
    const { html } = renderWelcomeEmail({
      toName: 'Say "hello"',
      bloodType: "O+",
      city: "Dakar",
      verifyUrl: "https://example.com",
    });
    expect(html).toContain("Say &quot;hello&quot;");
  });
});

// ─── renderWelcomeEmail ──────────────────────────────────────────────────────

describe("renderWelcomeEmail", () => {
  const baseParams = {
    toName: "Moussa Diallo",
    bloodType: "AB+",
    city: "Abidjan",
    verifyUrl: "https://hemora.app/verify/abc123",
  };

  it("retourne un objet { subject, html }", () => {
    const result = renderWelcomeEmail(baseParams);
    expect(result).toHaveProperty("subject");
    expect(result).toHaveProperty("html");
    expect(typeof result.subject).toBe("string");
    expect(typeof result.html).toBe("string");
  });

  it("le HTML commence par <!doctype html>", () => {
    const { html } = renderWelcomeEmail(baseParams);
    expect(html.trim().toLowerCase()).toMatch(/^<!doctype html>/);
  });

  it("le sujet contient le nom du réseau (HEMORA)", () => {
    const { subject } = renderWelcomeEmail(baseParams);
    expect(subject).toContain("HEMORA");
  });

  it('le CTA "Voir ma preuve d\'intégrité" est présent', () => {
    const { html } = renderWelcomeEmail(baseParams);
    // escapeHtml n'échappe pas l'apostrophe — le label apparaît littéralement
    expect(html).toContain("Voir ma preuve d'intégrit");
    // Le bouton est dans une balise <a>
    expect(html).toMatch(/<a\s[^>]*href/i);
  });

  it("le verifyUrl est bien dans le href", () => {
    const { html } = renderWelcomeEmail(baseParams);
    expect(html).toContain('href="https://hemora.app/verify/abc123"');
  });

  it("le bloodType apparaît dans le HTML", () => {
    const { html } = renderWelcomeEmail(baseParams);
    expect(html).toContain("AB+");
  });

  it("la ville apparaît dans le HTML", () => {
    const { html } = renderWelcomeEmail(baseParams);
    expect(html).toContain("Abidjan");
  });

  // ── XSS dans toName ────────────────────────────────────────────────────────
  it("XSS dans toName : balise <script> est échappée", () => {
    const { html } = renderWelcomeEmail({
      ...baseParams,
      toName: XSS_PAYLOAD,
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain(ESCAPED_LT + "script" + ESCAPED_GT);
  });

  // ── XSS dans bloodType ─────────────────────────────────────────────────────
  it("XSS dans bloodType : balise <script> est échappée", () => {
    const { html } = renderWelcomeEmail({
      ...baseParams,
      bloodType: XSS_PAYLOAD,
    });
    expect(html).not.toContain("<script>");
  });

  // ── XSS dans city ──────────────────────────────────────────────────────────
  it("XSS dans city : balise <script> est échappée", () => {
    const { html } = renderWelcomeEmail({
      ...baseParams,
      city: XSS_PAYLOAD,
    });
    expect(html).not.toContain("<script>");
  });

  // ── XSS dans verifyUrl ─────────────────────────────────────────────────────
  it("XSS dans verifyUrl (attribut href) : guillemets échappés", () => {
    const { html } = renderWelcomeEmail({
      ...baseParams,
      verifyUrl: `https://example.com/?x=${XSS_ATTR_PAYLOAD}`,
    });
    // Le guillemet doit être échappé, empêchant la sortie de l'attribut href
    expect(html).not.toContain(`href="https://example.com/?x="onload`);
    expect(html).toContain(ESCAPED_QUOT);
  });

  // ── verifyUrl javascript: ─────────────────────────────────────────────────
  it("verifyUrl javascript: ne provoque pas de crash et est inclus tel quel dans le href (comportement documenté)", () => {
    // FAILLE : la fonction n'intercepte pas les URLs javascript:.
    // Ce test documente ce comportement : le href contiendra "javascript:alert(1)".
    // Les clients mail filtrent généralement cela, mais c'est un risque.
    const { html } = renderWelcomeEmail({
      ...baseParams,
      verifyUrl: "javascript:alert(1)",
    });
    // Au moins le rendu ne plante pas
    expect(typeof html).toBe("string");
    // Comportement actuel (à surveiller) : l'URL apparaît dans le href
    expect(html).toContain("javascript:alert(1)");
  });

  // ── toName vide ────────────────────────────────────────────────────────────
  it('toName vide → "Bonjour ," dans le body (comportement documenté)', () => {
    // FAILLE MINEURE : le message "Bonjour ," est grammaticalement incorrect.
    const { html } = renderWelcomeEmail({
      ...baseParams,
      toName: "",
    });
    expect(html).toContain("Bonjour ,");
  });

  // ── wrap sans cta ──────────────────────────────────────────────────────────
  it("wrap sans cta ne génère pas de bouton vide (via le body seul)", () => {
    // renderWelcomeEmail passe toujours un cta, ce test vérifie l'absence
    // d'un bouton vide : le cta est présent donc un <a> avec href doit exister.
    const { html } = renderWelcomeEmail(baseParams);
    // Pas de <a href=""> vide
    expect(html).not.toContain('href=""');
  });
});

// ─── renderRewardEmail ───────────────────────────────────────────────────────

describe("renderRewardEmail", () => {
  const baseParams = {
    toName: "Awa Koné",
    sats: 21_000,
    hospitalName: "CHU de Dakar",
    verifyUrl: "https://hemora.app/verify/xyz789",
  };

  it("retourne un objet { subject, html }", () => {
    const result = renderRewardEmail(baseParams);
    expect(result).toHaveProperty("subject");
    expect(result).toHaveProperty("html");
  });

  it("le HTML commence par <!doctype html>", () => {
    const { html } = renderRewardEmail(baseParams);
    expect(html.trim().toLowerCase()).toMatch(/^<!doctype html>/);
  });

  it("le sujet contient le nombre de sats", () => {
    const { subject } = renderRewardEmail(baseParams);
    // 21 000 formaté en fr-FR : "21 000" (espace insécable ou espace normal)
    expect(subject).toMatch(/21[\s\u202f\u00a0]?000 sats/);
  });

  it("le HTML contient le nombre de sats formaté", () => {
    const { html } = renderRewardEmail(baseParams);
    expect(html).toMatch(/21[\s\u202f\u00a0]?000 sats/);
  });

  it('le CTA "Voir ma preuve d\'intégrité" est présent', () => {
    const { html } = renderRewardEmail(baseParams);
    expect(html).toMatch(/<a\s[^>]*href/i);
  });

  it("le hospitalName apparaît dans le HTML", () => {
    const { html } = renderRewardEmail(baseParams);
    expect(html).toContain("CHU de Dakar");
  });

  // ── XSS dans toName ────────────────────────────────────────────────────────
  it("XSS dans toName : balise <script> est échappée", () => {
    const { html } = renderRewardEmail({
      ...baseParams,
      toName: XSS_PAYLOAD,
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain(ESCAPED_LT + "script" + ESCAPED_GT);
  });

  // ── XSS dans hospitalName ──────────────────────────────────────────────────
  it("XSS dans hospitalName : balise <script> est échappée", () => {
    const { html } = renderRewardEmail({
      ...baseParams,
      hospitalName: XSS_PAYLOAD,
    });
    expect(html).not.toContain("<script>");
  });

  // ── XSS dans verifyUrl ─────────────────────────────────────────────────────
  it("XSS dans verifyUrl : guillemets échappés dans href", () => {
    const { html } = renderRewardEmail({
      ...baseParams,
      verifyUrl: `https://evil.com/?x=${XSS_ATTR_PAYLOAD}`,
    });
    expect(html).not.toContain(`href="https://evil.com/?x="onload`);
    expect(html).toContain(ESCAPED_QUOT);
  });

  // ── sats = 0 ───────────────────────────────────────────────────────────────
  it('sats = 0 → "0 sats" dans le sujet et le HTML', () => {
    const { subject, html } = renderRewardEmail({ ...baseParams, sats: 0 });
    expect(subject).toContain("0 sats");
    expect(html).toContain("0 sats");
  });

  // ── sats très grand ────────────────────────────────────────────────────────
  it("sats très grand (21e14) → toLocaleString sans crash", () => {
    const hugeSats = 21_000_000 * 100_000_000; // 2.1e15
    expect(() =>
      renderRewardEmail({ ...baseParams, sats: hugeSats }),
    ).not.toThrow();
    const { subject } = renderRewardEmail({ ...baseParams, sats: hugeSats });
    expect(subject).toContain("sats");
  });

  // ── sats négatif ───────────────────────────────────────────────────────────
  it("sats négatif → valeur négative dans le HTML (FAILLE : pas de guard)", () => {
    // FAILLE : aucune validation côté template. Une valeur négative s'affiche.
    const { html, subject } = renderRewardEmail({ ...baseParams, sats: -500 });
    // Le rendu ne plante pas
    expect(typeof html).toBe("string");
    // La valeur négative est présente (comportement bugué documenté)
    expect(subject).toMatch(/-/);
  });

  // ── verifyUrl javascript: ─────────────────────────────────────────────────
  it("verifyUrl javascript: ne provoque pas de crash (FAILLE : pas de sanitisation URL)", () => {
    expect(() =>
      renderRewardEmail({ ...baseParams, verifyUrl: "javascript:alert(1)" }),
    ).not.toThrow();
  });
});
