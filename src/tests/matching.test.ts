import { describe, it, expect } from "vitest";
import {
  calculateHaversineDistanceKm,
  calculateProximityScore,
  isHematologiquementCompatible,
  isEligibleDelai60Jours,
  matchDonneursUrgence,
} from "../lib/haversine";
import { DONNEURS_HEMORA_REF } from "../data/referentiels";

describe("Moteur Transfusionnel HEMORA", () => {
  it("Vérifie la compatibilité stricte ABO / Rhésus", () => {
    // O- donneur universel
    expect(isHematologiquementCompatible("O-", "O+")).toBe(true);
    expect(isHematologiquementCompatible("O-", "AB+")).toBe(true);
    expect(isHematologiquementCompatible("O-", "A-")).toBe(true);

    // O+ compatible avec O+, A+, B+, AB+ mais pas les rhésus négatifs
    expect(isHematologiquementCompatible("O+", "O+")).toBe(true);
    expect(isHematologiquementCompatible("O+", "AB+")).toBe(true);
    expect(isHematologiquementCompatible("O+", "O-")).toBe(false);
    expect(isHematologiquementCompatible("O+", "A-")).toBe(false);

    // AB+ receveur universel mais ne donne qu'à AB+
    expect(isHematologiquementCompatible("AB+", "AB+")).toBe(true);
    expect(isHematologiquementCompatible("AB+", "O+")).toBe(false);
  });

  it("Calcule précisément la distance de Haversine", () => {
    // Distance entre Kalalé (10.2889, 3.3764) et Nikki (9.9400, 3.2108)
    const p1 = { lat: 10.2889, lng: 3.3764 };
    const p2 = { lat: 9.9400, lng: 3.2108 };
    const distance = calculateHaversineDistanceKm(p1, p2);
    // Distance attendue environ 42-45 km
    expect(distance).toBeGreaterThan(35);
    expect(distance).toBeLessThan(55);
  });

  it("Applique la formule officielle de score de proximité HEMORA", () => {
    // À 0 km : score = 100
    expect(calculateProximityScore(0)).toBe(100);
    // À 10 km : 100 - (10 * 5) = 50
    expect(calculateProximityScore(10)).toBe(50);
    // À 20 km : 100 - (20 * 5) = 0
    expect(calculateProximityScore(20)).toBe(0);
    // À 30 km : plafonné à 0
    expect(calculateProximityScore(30)).toBe(0);
  });

  it("Vérifie la règle médicale bloquante des 60 jours", () => {
    // Dernier don il y a plus de 60 jours
    const dateAncienne = "2026-01-01";
    const refDate = new Date("2026-04-01");
    expect(isEligibleDelai60Jours(dateAncienne, refDate).eligible).toBe(true);

    // Dernier don il y a 20 jours
    const dateRecente = "2026-03-20";
    const checkRecent = isEligibleDelai60Jours(dateRecente, refDate);
    expect(checkRecent.eligible).toBe(false);
    expect(checkRecent.joursRestants).toBeGreaterThan(0);
  });

  it("Exécute le matching d'urgence transfusionnelle avec classement pondéré", () => {
    // Urgence à l'Hôpital de Zone de Nikki (O+)
    const pointUrgence = { lat: 9.9400, lng: 3.2108 };
    const matches = matchDonneursUrgence(DONNEURS_HEMORA_REF, pointUrgence, "O+");

    expect(matches.length).toBeGreaterThan(0);
    // Tous les donneurs retournés doivent être compatibles O+ (ex: O+ ou O-)
    for (const m of matches) {
      expect(["O+", "O-"]).toContain(m.donneur.groupeSanguin);
    }

    // Le premier doit avoir un score supérieur ou égal aux suivants
    expect(matches[0].scoreTotal).toBeGreaterThanOrEqual(matches[matches.length - 1].scoreTotal);
  });
});
