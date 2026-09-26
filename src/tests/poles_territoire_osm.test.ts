import { describe, it, expect } from "vitest";
import {
  POLES_DEVELOPPEMENT_BENIN,
  COMMUNES_BENIN,
  getPoleForCommune,
  getCommunesByPole,
  getPoleById,
  getPoleByName,
} from "../data/communes";

describe("Référentiel Territorial National - 06 Pôles de Développement (229 DEGRÉ)", () => {
  it("Vérifie la présence exacte des 06 Pôles de Développement Territorial", () => {
    expect(POLES_DEVELOPPEMENT_BENIN).toHaveLength(6);
    const ids = POLES_DEVELOPPEMENT_BENIN.map((p) => p.id);
    expect(ids).toContain("grand-nokoue");
    expect(ids).toContain("sud-ouest");
    expect(ids).toContain("sud-est");
    expect(ids).toContain("centre");
    expect(ids).toContain("nord-ouest");
    expect(ids).toContain("nord-est");
  });

  it("Vérifie le compte officiel exact des 77 communes réparties sur les 06 Pôles", () => {
    expect(COMMUNES_BENIN).toHaveLength(77);

    const grandNokoue = COMMUNES_BENIN.filter((c) => c.poleId === "grand-nokoue");
    const sudOuest = COMMUNES_BENIN.filter((c) => c.poleId === "sud-ouest");
    const sudEst = COMMUNES_BENIN.filter((c) => c.poleId === "sud-est");
    const centre = COMMUNES_BENIN.filter((c) => c.poleId === "centre");
    const nordOuest = COMMUNES_BENIN.filter((c) => c.poleId === "nord-ouest");
    const nordEst = COMMUNES_BENIN.filter((c) => c.poleId === "nord-est");

    // Découpage strict selon l'infographie officielle 229 DEGRÉ
    expect(grandNokoue).toHaveLength(5);
    expect(sudOuest).toHaveLength(18);
    expect(sudEst).toHaveLength(12);
    expect(centre).toHaveLength(15);
    expect(nordOuest).toHaveLength(13);
    expect(nordEst).toHaveLength(14);

    expect(
      grandNokoue.length +
        sudOuest.length +
        sudEst.length +
        centre.length +
        nordOuest.length +
        nordEst.length
    ).toBe(77);
  });

  it("Vérifie les communes phares du Pôle Grand-Nokoué", () => {
    const gnCommunes = getCommunesByPole("grand-nokoue").map((c) => c.nom);
    expect(gnCommunes).toContain("Cotonou");
    expect(gnCommunes).toContain("Abomey-Calavi");
    expect(gnCommunes).toContain("Porto-Novo");
    expect(gnCommunes).toContain("Ouidah");
    expect(gnCommunes).toContain("Sèmè-Kpodji");
  });

  it("Assigne correctement chaque commune à son Pôle territorial via getPoleForCommune", () => {
    expect(getPoleForCommune("Cotonou").id).toBe("grand-nokoue");
    expect(getPoleForCommune("Abomey-Calavi").id).toBe("grand-nokoue");
    expect(getPoleForCommune("Porto-Novo").id).toBe("grand-nokoue");

    expect(getPoleForCommune("Lokossa").id).toBe("sud-ouest");
    expect(getPoleForCommune("Allada").id).toBe("sud-ouest");
    expect(getPoleForCommune("Grand-Popo").id).toBe("sud-ouest");

    expect(getPoleForCommune("Pobè").id).toBe("sud-est");
    expect(getPoleForCommune("Sakété").id).toBe("sud-est");
    expect(getPoleForCommune("Kétou").id).toBe("sud-est");

    expect(getPoleForCommune("Abomey").id).toBe("centre");
    expect(getPoleForCommune("Bohicon").id).toBe("centre");
    expect(getPoleForCommune("Dassa-Zoumè").id).toBe("centre");

    expect(getPoleForCommune("Natitingou").id).toBe("nord-ouest");
    expect(getPoleForCommune("Djougou").id).toBe("nord-ouest");
    expect(getPoleForCommune("Tanguieta").id).toBe("nord-ouest");

    expect(getPoleForCommune("Parakou").id).toBe("nord-est");
    expect(getPoleForCommune("Nikki").id).toBe("nord-est");
    expect(getPoleForCommune("Kalalé").id).toBe("nord-est");
    expect(getPoleForCommune("Kandi").id).toBe("nord-est");
    expect(getPoleForCommune("Malanville").id).toBe("nord-est");
  });

  it("Fournit des métadonnées géographiques et de couleur pour OpenStreetMap", () => {
    POLES_DEVELOPPEMENT_BENIN.forEach((pole) => {
      expect(pole.lat).toBeGreaterThan(6.0);
      expect(pole.lat).toBeLessThan(13.0);
      expect(pole.lng).toBeGreaterThan(0.5);
      expect(pole.lng).toBeLessThan(4.5);
      expect(pole.couleur).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(pole.chefLieu.length).toBeGreaterThan(2);
      expect(pole.description.length).toBeGreaterThan(10);
    });
  });

  it("Recherche de pôle par ID ou par nom tolérant", () => {
    expect(getPoleById("nord-est")?.nom).toBe("Pôle Nord-Est");
    expect(getPoleByName("grand-nokoue")?.id).toBe("grand-nokoue");
    expect(getPoleByName("Pôle Centre")?.id).toBe("centre");
    expect(getPoleByName("sud-ouest")?.chefLieu).toBe("Lokossa");
  });
});
