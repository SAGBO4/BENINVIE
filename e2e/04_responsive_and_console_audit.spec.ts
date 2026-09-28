import { test, expect } from "@playwright/test";

test.describe("04. Audit Ergonomique Mobile & Console Propre", () => {
  const pagesToTest = [
    { name: "Vitrine", path: "/" },
    { name: "Connexion", path: "/login" },
    { name: "Ministère", path: "/dashboard/ministere" },
    { name: "Pharmacie", path: "/dashboard/pharmacie" },
  ];

  for (const p of pagesToTest) {
    test(`Vérification responsive sans débordement horizontal sur ${p.name} (${p.path})`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(p.path);
      await page.waitForLoadState("domcontentloaded");

      // Vérifier l'absence d'overflow horizontal
      const isOverflowing = await page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;
        return root.scrollWidth > root.clientWidth + 2 || body.scrollWidth > body.clientWidth + 2;
      });
      expect(isOverflowing).toBe(false);

      // Audit de console : aucune erreur d'exécution JavaScript fatale
      const fatalErrors = consoleErrors.filter(
        (err) =>
          !err.includes("favicon") &&
          !err.includes("manifest") &&
          !err.includes("leaflet") &&
          !err.includes("ERR_CONNECTION_REFUSED") &&
          !err.includes("hydration")
      );
      expect(fatalErrors).toEqual([]);
    });
  }
});
