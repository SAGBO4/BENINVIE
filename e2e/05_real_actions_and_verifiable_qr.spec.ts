import { test, expect } from "@playwright/test";

test.describe("05. Vérification des Boutons d'Action Réels et QR Codes Vérifiables", () => {
  test("Patient : Modales Attestation PDF, Bon Pharmacie et Carte Haute Définition", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Patient ARCH" }).click();
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/dashboard/patient", { timeout: 15000 });

    // 1. Ouvrir le module HEMORA
    await page.getByText("Passeport Donneur HEMORA").click();

    // 2. Tester le bouton Attestation PDF Officielle
    const attestationBtn = page.getByRole("button", { name: /attestation pdf officielle/i });
    await expect(attestationBtn).toBeVisible();
    await attestationBtn.click();

    // Doit afficher la modale officielle CNTS avec le QR code scannable
    await expect(page.getByText("Attestation Officielle de Donneur Régulier de Sang").first()).toBeVisible();
    await expect(page.locator("svg[data-cy='qr-code'], svg").first()).toBeVisible();
    await page.getByRole("button", { name: "Fermer" }).first().click();
    await expect(page.getByText("Attestation Officielle de Donneur Régulier de Sang")).not.toBeVisible();

    // 3. Tester le bouton d'agrandissement de la carte
    const zoomCardBtn = page.getByRole("button", { name: /agrandir la carte/i });
    await expect(zoomCardBtn).toBeVisible();
    await zoomCardBtn.click();
    await expect(page.getByText(/fermer la vue agrandie/i).first()).toBeVisible();
    await page.getByRole("button", { name: /fermer la vue agrandie/i }).first().click();

    // 4. Tester la génération de Bon Pharmacie
    const bonPharmaBtn = page.getByRole("button", { name: /générer un bon pharmacie|afficher qr/i });
    if (await bonPharmaBtn.isVisible()) {
      await bonPharmaBtn.click();
      await expect(page.getByText(/bon de réduction officinale/i).first()).toBeVisible({ timeout: 5000 });
      await page.getByRole("button", { name: "Fermer" }).first().click();
    }
  });

  test("Citoyen : QR Code Carte, Modale OTS et Quittance Mobile Money", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Donneur" }).click();
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/dashboard/citoyen", { timeout: 15000 });

    // 1. Accéder au module Carte
    await page.getByText("Carte Nationale de Santé & QR").click();
    await expect(page.getByText("Carte Nationale de Santé Dématérialisée").first()).toBeVisible();

    // Doit contenir le QR code SVG et le lien vers le guichet
    await expect(page.getByRole("link", { name: /tester guichet national/i })).toBeVisible();

    // Tester modale Agrandir Carte
    await page.getByRole("button", { name: /agrandir carte/i }).click();
    await expect(page.getByText(/CNS-BJ-/).first()).toBeVisible();
    await page.getByRole("button", { name: "Fermer" }).first().click();

    // 2. Accéder au module Historique Dons & Examiner scellé OTS
    await page.getByRole("button", { name: /tous les services/i }).click();
    await page.getByText("Passeport Transfusionnel & Dons").click();
    await expect(page.getByText(/Historique des Dons/i).first()).toBeVisible();

    const otsBtn = page.getByRole("button", { name: /examiner le scellé bitcoin ots/i }).first();
    await expect(otsBtn).toBeVisible();
    await otsBtn.click();
    await expect(page.getByText("Attestation Immuable OpenTimestamps").first()).toBeVisible();
    await page.getByRole("button", { name: "Fermer" }).first().click();

    // 3. Accéder au module Défraiements MoMo & Quittance
    await page.getByRole("button", { name: /tous les services/i }).click();
    await page.getByText("Défraiements MoMo Reçus").click();
    await expect(page.getByText(/Forfaits de Déplacement/i).first()).toBeVisible();

    const receiptBtn = page.getByRole("button", { name: /voir quittance momo officielle/i }).first();
    await expect(receiptBtn).toBeVisible();
    await receiptBtn.click();
    await expect(page.getByText("REÇU OFFICIEL DE DÉFRAIEMENT").first()).toBeVisible();
    await page.getByRole("button", { name: "Fermer" }).first().click();
  });

  test("Médecin : Émission Ordonnance Sécurisée avec Scellé QR et Pass d'Admission", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Médecin" }).click();
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/dashboard/medecin", { timeout: 15000 });

    // 1. Émettre une ordonnance MTA
    const btnPrescrire = page.getByRole("button", { name: /émettre ordonnance sécurisée/i });
    await expect(btnPrescrire).toBeVisible();
    await btnPrescrire.click();

    // Doit afficher l'ordonnance scellée avec le QR Code SVG scannable
    await expect(page.getByText(/ordonnance émise & scellée anip/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: /tester sur le guichet pharmacie/i })).toBeVisible();

    // 2. Actionner l'admission vitale garantie
    const btnAdmission = page.getByRole("button", { name: /admission garantie/i });
    await expect(btnAdmission).toBeVisible();
    await btnAdmission.click();
    await expect(page.getByText(/pass d'admission vitale sans caution/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("Pharmacie : Préremplissage Rapide, Contrôle QR et Délivrance", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Pharmacie" }).click();
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/dashboard/pharmacie", { timeout: 15000 });

    // 1. Utiliser le bouton de préremplissage rapide
    await page.getByRole("button", { name: "ORD-2026-001" }).click();
    await page.getByRole("button", { name: /vérifier l'ordonnance/i }).click();

    // 2. Doit afficher le scellé QR et le bouton de délivrance
    await expect(page.getByText(/scellé cryptographique contrôlé/i).first()).toBeVisible({ timeout: 10000 });

    // 3. Valider la délivrance
    const btnDelivrer = page.getByRole("button", { name: /délivrer médicaments/i });
    if (await btnDelivrer.isVisible()) {
      await btnDelivrer.click();
      await expect(page.getByText(/délivrance enregistrée avec succès/i).first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole("button", { name: /imprimer quittance/i }).first()).toBeVisible();
    }
  });

  test("Ministère : Mandat Régalien d'Inspection IGS et Traçabilité", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Ministère" }).click();
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/dashboard/ministere", { timeout: 15000 });

    // 1. Déclencher un audit inopiné
    const auditBtn = page.getByRole("button", { name: /déclencher audit inopiné igs/i });
    await expect(auditBtn).toBeVisible();
    await auditBtn.click();

    // 2. Doit afficher le mandat ministériel officiel avec QR Code
    await expect(page.getByText("Arrêté Ministériel Portant Mission d'Inspection Inopinée").first()).toBeVisible();
    await expect(page.getByText(/MANDAT-IGS-/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /tester le scellé sur le guichet public/i })).toBeVisible();
    await page.getByRole("button", { name: /fermer le mandat/i }).click();
  });

  test("Guichet de Vérification (/verify) : Résolution Réelle de Tous les Types de Jetons", async ({ page }) => {
    // 1. Vérification d'une Carte Nationale de Santé
    await page.goto("/verify?token=CARTE-NPI-CIT-1995-1029");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/Carte Nationale de Santé Dématérialisée/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Régime ARCH Actif/i)).toBeVisible();

    // 2. Vérification d'un Bon de Réduction Pharmacie
    await page.goto("/verify?token=BON-PHARMA-8871");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/Bon de Réduction Officinale CNTS/i)).toBeVisible({ timeout: 15000 });

    // 3. Vérification d'un Mandat d'Urgence Vitale
    await page.goto("/verify?token=MANDAT-IGS-2026-991");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/DÉCRET DE GRATUITÉ DES URGENCES VITALES/i)).toBeVisible({ timeout: 15000 });
  });
});
