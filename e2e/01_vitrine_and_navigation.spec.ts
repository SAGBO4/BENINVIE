import { test, expect } from "@playwright/test";

test.describe("01. Vitrine Républicaine & Navigation", () => {
  test("La page d'accueil se charge correctement avec les éléments régaliens", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Vérifier l'en-tête républicain et les mentions officielles
    await expect(page.locator("body")).toContainText(/BENINVIE|BMM/i);
    await expect(page.locator("body")).toContainText(/République du Bénin/i);

    // Bouton officiel d'accès à l'espace / connexion
    const loginLink = page.getByRole("link", { name: /accéder à mon espace|connexion/i }).first();
    await expect(loginLink).toBeVisible();

    // Aucun débordement horizontal (responsive respecté)
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);
  });
});
