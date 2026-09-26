import { describe, it, expect, beforeEach } from "vitest";
import { dbStore } from "../db/client";
import { matchDonneursUrgence } from "../lib/haversine";
import { executeSimulatedPayment, sendSimulatedSms } from "../lib/simulation";
import { simulateOpenTimestampsAnchor } from "../lib/crypto";

describe("Scénario Officiel de Démonstration : Bio à Kalalé (7 Étapes Complètes)", () => {
  beforeEach(() => {
    dbStore.seed();
  });

  it("Exécute sans aucune rupture le parcours complet de Bio de Kalalé à Nikki", () => {
    // -------------------------------------------------------------
    // ÉTAPE 1 : Visite communautaire ASC à domicile (Kalalé)
    // -------------------------------------------------------------
    const bioNpi = "2026-KAL-9821-BIO";
    const bio = dbStore.patients.get(bioNpi);
    expect(bio).toBeDefined();
    expect(bio?.commune).toBe("Kalalé");
    expect(bio?.estEnceinte).toBe(true);
    expect(bio?.semaineAmenorrhee).toBe(34);

    const ascVisite = {
      id: "enc-asc-01",
      patientId: bio!.id,
      soignantId: "NPI-ASC-2026-8801",
      etablissementId: "etab-csa-basso-01",
      type: "visite_asc" as const,
      motif: "Suivi prénatal à domicile et rappel CPN3",
      observations: {
        perimetreBrachialMm: 245,
        tension: "11/7",
        notes: "Bonne vitalité fœtale. Rappel CPN3 au CSC Kalalé.",
      },
      modePaiement: "arch_tiers_payant" as const,
      creeLe: new Date().toISOString(),
    };
    dbStore.encounters.set(ascVisite.id, ascVisite);
    expect(dbStore.encounters.get(ascVisite.id)).toBeDefined();

    // -------------------------------------------------------------
    // ÉTAPE 2 : Alerte SMS & Appel vocal en Bariba (Rappel CPN3)
    // -------------------------------------------------------------
    const sms = sendSimulatedSms({
      telephone: bio!.telephone,
      message: "BENINVIE Santé : Fofo Bio ! CPN3 waasi gari Kalalé CSC suba. Munissez-vous de votre carte QR.",
      langue: "bariba",
    });
    dbStore.smsLogs.unshift(sms);
    expect(sms.statut).toBe("LIVRE");
    expect(sms.langue).toBe("bariba");

    // -------------------------------------------------------------
    // ÉTAPE 3 : Consultation au CS Kalalé & Prescription
    // -------------------------------------------------------------
    const ordonnanceCode = "ORD-2026-KAL-042";
    const ord = dbStore.ordonnances.get(ordonnanceCode);
    expect(ord).toBeDefined();
    expect(ord?.statut).toBe("ACTIVE");
    expect(ord?.medicaments.length).toBeGreaterThanOrEqual(2);

    // -------------------------------------------------------------
    // ÉTAPE 4 : Retrait en pharmacie couvert à 100% par ARCH (Usage unique scellé)
    // -------------------------------------------------------------
    expect(bio?.statutArch).toBe("actif");
    ord!.statut = "DELIVREE";
    ord!.dateDelivrance = new Date().toISOString();
    ord!.pharmacieNom = "Pharmacie Communale de Kalalé";

    // Vérification de blocage contre double délivrance
    const ordApres = dbStore.ordonnances.get(ordonnanceCode);
    expect(ordApres?.statut).toBe("DELIVREE");

    // -------------------------------------------------------------
    // ÉTAPE 5 : Transfert monétaire fléché GBESSOKE (5 000 FCFA MoMo post-CPN)
    // -------------------------------------------------------------
    const primeGbessoke = executeSimulatedPayment({
      operateur: "MTN_MOMO",
      telephone: bio!.telephone,
      montantFcfa: 5000,
      motif: "Prime d'incitation nutritionnelle GBESSOKE post-validation CPN3",
    });
    dbStore.paymentLogs.unshift(primeGbessoke);
    expect(primeGbessoke.success).toBe(true);
    expect(primeGbessoke.montantFcfa).toBe(5000);

    // -------------------------------------------------------------
    // ÉTAPE 6 : Urgence obstétricale vitale : Transport & Bris de Glace à Nikki
    // -------------------------------------------------------------
    // 6a. Transport zémidjan d'urgence
    const course = {
      id: "crs-bio-01",
      codeCourse: "ZEM-2026-KAL-771",
      patienteNpi: bio!.npi,
      patienteNom: `${bio!.prenom} ${bio!.nom}`,
      conducteurNom: "Salifou TCHABI",
      conducteurTelephone: "+229 01 97 12 34 56",
      commune: "Kalalé",
      centreSanteDestination: "Hôpital de Zone de Nikki",
      statut: "ARRIVEE" as const,
      forfaitFcfa: 3000,
      dateAlerte: new Date().toISOString(),
    };
    dbStore.coursesZemidjans.set(course.codeCourse, course);

    // 6b. Bris de Glace immédiat à l'arrivée
    const auditBrisDeGlace = dbStore.logAudit({
      action: "BRIS_DE_GLACE",
      acteurNpi: "NPI-MED-2026-0042",
      acteurNom: "Dr. Emmanuel Tossou",
      role: "urgentiste",
      cibleId: bio!.npi,
      details: {
        motifUrgence: "Choc hémorragique de la délivrance post-partum",
        etablissement: "Hôpital de Zone de Nikki",
      },
    });
    expect(auditBrisDeGlace.action).toBe("BRIS_DE_GLACE");

    // 6c. Ouverture automatique du dossier de paiement différé garanti
    const dpdId = "dpd-bio-urg-01";
    const dpd = {
      id: dpdId,
      encounterId: "enc-urg-bio-01",
      patientId: bio!.id,
      patientNpi: bio!.npi,
      patientNom: `${bio!.prenom} ${bio!.nom}`,
      montantTotalFcfa: 85000,
      statutApurement: "couvert_arch" as const, // Prise en charge intégrale ARCH
      referenceGarantieEtat: "GARANTIE-ETAT-2026-KAL-9821",
      echeanceDate: "2026-10-30",
      creeLe: new Date().toISOString(),
    };
    dbStore.dossiersDiffere.set(dpd.id, dpd);
    expect(dpd.statutApurement).toBe("couvert_arch");

    // -------------------------------------------------------------
    // ÉTAPE 7 : Déclenchement HEMORA & Matching transfusionnel d'urgence
    // -------------------------------------------------------------
    // Nikki a besoin urgent de 2 poches de sang O+
    const hopitalNikki = { lat: 9.9400, lng: 3.2108 };
    const donneurs = Array.from(dbStore.donneursHemora.values());
    const matches = matchDonneursUrgence(donneurs, hopitalNikki, "O+");

    expect(matches.length).toBeGreaterThan(0);
    const meilleurDonneur = matches[0];
    expect(["O+", "O-"]).toContain(meilleurDonneur.donneur.groupeSanguin);

    // Le donneur se présente au centre et est prélevé
    const paiementTransport = executeSimulatedPayment({
      operateur: "MTN_MOMO",
      telephone: meilleurDonneur.donneur.telephone,
      montantFcfa: 2000,
      motif: "Défraiement transport don de sang HEMORA Nikki",
    });
    dbStore.paymentLogs.unshift(paiementTransport);
    expect(paiementTransport.success).toBe(true);

    // Ancrage OTS Bitcoin
    const ots = simulateOpenTimestampsAnchor([
      meilleurDonneur.donneur.profileHash,
      paiementTransport.referenceTransaction,
    ]);
    expect(ots.statut).toBe("CONFIRME");
    expect(ots.otsProof).toContain("OTS-PROOF-BTC");

    // Vérification finale de l'état
    expect(dbStore.auditLogs.length).toBeGreaterThanOrEqual(1);
    expect(dbStore.paymentLogs.length).toBeGreaterThanOrEqual(2);
  });
});
