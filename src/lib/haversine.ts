import { GeoPoint, GroupeSanguin, DonneurHemora } from "./types";

// Rayon moyen de la Terre en kilomètres
const EARTH_RADIUS_KM = 6371;

/**
 * Calcule la distance orthodromique entre deux points géodésiques via la formule de Haversine
 */
export function calculateHaversineDistanceKm(p1: GeoPoint, p2: GeoPoint): number {
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1Rad = (p1.lat * Math.PI) / 180;
  const lat2Rad = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

/**
 * Calcule le score de proximité HEMORA : max(0, 100 - km * 5)
 */
export function calculateProximityScore(distanceKm: number): number {
  return Math.max(0, Math.round(100 - distanceKm * 5));
}

/**
 * Matrice stricte de compatibilité transfusionnelle de culots globulaires (donneur -> receveur)
 */
export const COMPATIBILITE_TRANSFUSION: Record<GroupeSanguin, GroupeSanguin[]> = {
  // Donneur universel de globules rouges
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  // Receveur universel mais donneur uniquement pour AB+
  "AB+": ["AB+"],
};

/**
 * Vérifie si un donneur est hématologiquement compatible avec un groupe requis
 */
export function isHematologiquementCompatible(groupeDonneur: GroupeSanguin, groupeRequis: GroupeSanguin): boolean {
  const receveursPossibles = COMPATIBILITE_TRANSFUSION[groupeDonneur] || [];
  return receveursPossibles.includes(groupeRequis);
}

/**
 * Vérifie la règle médicale stricte des 60 jours d'intervalle minimum entre deux dons de sang
 */
export function isEligibleDelai60Jours(dateDernierDon?: string, dateReference = new Date()): { eligible: boolean; joursRestants: number } {
  if (!dateDernierDon) {
    return { eligible: true, joursRestants: 0 };
  }

  const dernierDon = new Date(dateDernierDon);
  const diffTempsMs = dateReference.getTime() - dernierDon.getTime();
  const diffJours = Math.floor(diffTempsMs / (1000 * 60 * 60 * 24));

  if (diffJours >= 60) {
    return { eligible: true, joursRestants: 0 };
  }

  return { eligible: false, joursRestants: 60 - diffJours };
}

export interface MatchingResult {
  donneur: DonneurHemora;
  distanceKm: number;
  scoreProximite: number;
  bonusAssiduite: number;
  scoreTotal: number;
  eligibleDelai: boolean;
  joursAvantEligibilite: number;
}

/**
 * Moteur de matching hématologique et géodésique HEMORA
 */
export function matchDonneursUrgence(
  donneurs: DonneurHemora[],
  pointUrgence: GeoPoint,
  groupeRequis: GroupeSanguin
): MatchingResult[] {
  const resultats: MatchingResult[] = [];

  for (const donneur of donneurs) {
    // 1. Compatibilité stricte ABO / Rhésus
    if (!isHematologiquementCompatible(donneur.groupeSanguin, groupeRequis)) {
      continue;
    }

    // 2. Calcul distance
    const distanceKm = calculateHaversineDistanceKm(pointUrgence, { lat: donneur.lat, lng: donneur.lng });

    // 3. Calcul score proximité
    const scoreProximite = calculateProximityScore(distanceKm);

    // 4. Bonus d'assiduité : +10 pts par don, max 40
    const bonusAssiduite = Math.min(40, (donneur.nombreDonsValides || 0) * 10);

    // 5. Score total (sur 140 max, normalisé sur 100)
    const scoreBrut = scoreProximite + bonusAssiduite;
    const scoreTotal = Math.min(100, Math.round((scoreBrut / 140) * 100));

    // 6. Règle médicale des 60 jours
    const { eligible, joursRestants } = isEligibleDelai60Jours(donneur.dateDernierDon);

    resultats.push({
      donneur,
      distanceKm,
      scoreProximite,
      bonusAssiduite,
      scoreTotal,
      eligibleDelai: eligible,
      joursAvantEligibilite: joursRestants,
    });
  }

  // Tri décroissant par score total, en privilégiant les donneurs immédiatement éligibles
  return resultats.sort((a, b) => {
    if (a.eligibleDelai && !b.eligibleDelai) return -1;
    if (!a.eligibleDelai && b.eligibleDelai) return 1;
    return b.scoreTotal - a.scoreTotal;
  });
}
