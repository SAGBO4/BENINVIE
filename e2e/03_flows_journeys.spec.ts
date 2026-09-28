import { test, expect } from "@playwright/test";

test.describe("03. Audit des Parcours & Flux Métier Réels", () => {
  test("Flux 1 : Patient - Consultation FHIR et Dénonciation Citoyenne au Ministère", async ({ page }) => {
    // Connexion en tant que Patient
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Patient ARCH" }).click();
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/dashboard/patient", { timeout: 15000 });

    // Vérifier les constantes vitales
    await expect(page.locator("body")).toContainText("Carnet de Santé HL7 FHIR");
    await expect(page.locator("body")).toContainText("Bio");

    // Vérifier l'accès au module de signalement / dénonciation citoyenne
    const denonciationBtn = page.getByRole("button", { name: /dénonciation|signalement/i }).first();
    if (await denonciationBtn.isVisible()) {
      await denonciationBtn.click();
      await expect(page.getByText(/signalement citoyen d'urgence/i)).toBeVisible();
    }
  });

  test("Flux 2 : Citoyen & Donneur HEMORA - Suivi des Points et Stocks", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Donneur" }).click();
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/dashboard/citoyen", { timeout: 15000 });

    // Vérifier la présence du solde de points et du suivi transfusionnel
    await expect(page.locator("body")).toContainText(/Points Santé|HEMORA/i);
  });

  test("Flux 3 : Pharmacie d'Officine - Contrôle et Délivrance d'Ordonnance", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Pharmacie" }).click();
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/dashboard/pharmacie", { timeout: 15000 });

    await expect(page.locator("body")).toContainText(/Délivrance Sécurisée/i);

    // Tester la vérification du code ORD-2026-001
    const inputCode = page.locator("input[value*='ORD-']");
    if (await inputCode.isVisible()) {
      const btnVerif = page.getByRole("button", { name: /vérifier l'ordonnance/i });
      await btnVerif.click();
      // Doit afficher les résultats ou le statut
      await expect(page.getByText(/prise en charge arch|médicaments prescrits|ordonnance/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("Flux 4 : Ministère de la Santé - Tableau de Bord Pleine Largeur Shadcn & Carte OSM", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Ministère" }).click();
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/dashboard/ministere", { timeout: 15000 });

    // Vérifier les macro-indicateurs
    await expect(page.getByText("Plateaux Techniques Homologués")).toBeVisible();
    await expect(page.getByText("Stocks Nationaux de Sang (CGR)")).toBeVisible();

    // Vérifier la bascule Carte OSM / Tableau SIG IASO
    const btnTableau = page.getByRole("button", { name: /tableau sig iaso/i });
    if (await btnTableau.isVisible()) {
      await btnTableau.click();
      // Vérifier le tableau des établissements
      await expect(page.getByText(/infrastructure hospitalière/i).first()).toBeVisible();

      // Revenir à la carte
      const btnCarte = page.getByRole("button", { name: /carte interactive osm/i });
      await btnCarte.click();
    }
  });
});
