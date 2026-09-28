import { test, expect } from "@playwright/test";

test.describe("02. Portail Républicain de Connexion (/login)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
  });

  test("Affiche le portail avec le double onglet Connexion et Inscription", async ({ page }) => {
    // Vérifier la présence du titre et de la mention République du Bénin
    await expect(page.locator("h1")).toContainText(/espace d'accès réglementaire/i);
    await expect(page.locator("body")).toContainText("République du Bénin");

    // Boutons des onglets
    const tabConnexion = page.getByRole("button", { name: /connexion/i }).first();
    const tabInscription = page.getByRole("button", { name: /inscription/i }).first();
    await expect(tabConnexion).toBeVisible();
    await expect(tabInscription).toBeVisible();

    // Vérifier les 8 accès rapides de démonstration avec leurs libellés exacts
    const demoButtons = [
      "Patient ARCH",
      "Donneur",
      "Médecin",
      "ASC Terrain",
      "Pharmacie",
      "ARS",
      "APDP",
      "Ministère",
    ];
    for (const label of demoButtons) {
      const btn = page.getByRole("button", { name: label });
      await expect(btn).toBeVisible();
    }
  });

  test("Remplissage automatique via bouton Démo et connexion réussie vers le Ministère", async ({ page }) => {
    // Cliquer sur le bouton démo Ministère
    const btnMin = page.getByRole("button", { name: "Ministère" });
    await btnMin.click();

    // Vérifier que l'identifiant est prérempli avec le NPI du Ministère
    const inputId = page.locator("input#login-identifier");
    await expect(inputId).toHaveValue("NPI-MIN-2026-001");

    // Soumettre le formulaire de connexion
    const submitBtn = page.locator("form").getByRole("button", { name: "Se connecter" });
    await submitBtn.click();

    // Attendre la redirection vers /dashboard/ministere
    await page.waitForURL("**/dashboard/ministere", { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard\/ministere/);
    await expect(page.locator("body")).toContainText("Ministère de la Santé");
  });

  test("Bascule vers l'onglet Inscription et vérifie les champs réglementaires", async ({ page }) => {
    // Cliquer sur l'onglet Inscription
    const tabInscription = page.getByRole("button", { name: /inscription/i }).first();
    await tabInscription.click();

    // Vérifier les champs obligatoires du formulaire
    await expect(page.getByText(/corps de rattachement/i).first()).toBeVisible();
    await expect(page.getByText(/département/i).first()).toBeVisible();
    await expect(page.getByText(/commune/i).first()).toBeVisible();
    await expect(page.locator("button[type='submit']")).toContainText(/créer mon compte/i);

    // Tester la bascule de retour vers Connexion
    const linkBack = page.getByRole("button", { name: "Se connecter" });
    await linkBack.click();
    await expect(page.locator("input#login-identifier")).toBeVisible();
  });
});
