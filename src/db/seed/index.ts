import { dbStore } from "../client";
import { COMMUNES_BENIN } from "../../data/communes";
import {
  ETABLISSEMENTS_REF,
  SOIGNANTS_REF,
  PATIENTS_REF,
  DONNEURS_HEMORA_REF,
  STOCKS_SANG_REF,
  CAMPAGNES_REF,
  TRANSFERTS_REF,
  DEMANDES_CARTES_REF,
  POINTS_LEDGER_REF,
  URGENCES_HEMORA_REF,
} from "../../data/referentiels";
import { pool, db, schema } from "../drizzle";

async function runSeed() {
  console.log("[BENINVIE Seed 2026] Initialisation des données nationales...");

  // 1. Initialiser le magasin en mémoire (Zero-fail fallback)
  dbStore.seed();
  console.log(`[In-Memory] ${COMMUNES_BENIN.length} Communes du Bénin chargées.`);

  // 2. Initialiser la base de données Neon PostgreSQL
  try {
    console.log("[Neon DB] Synchronisation avec Neon PostgreSQL...");

    // Vider les tables pour un seed propre et déterministe
    await pool.query(`
      TRUNCATE TABLE 
        gbe_audit_logs,
        gbe_campagnes_don,
        gbe_demandes_cartes,
        gbe_donneurs_hemora,
        gbe_dons_historique,
        gbe_dossiers_paiement_differe,
        gbe_encounters,
        gbe_etablissements,
        gbe_ordonnances,
        gbe_patients,
        gbe_points_ledger,
        gbe_soignants,
        gbe_stocks_sang,
        gbe_transferts_sang,
        gbe_urgences_transfusion
      CASCADE;
    `);

    // Ingestion des Établissements
    if (ETABLISSEMENTS_REF.length > 0) {
      await db.insert(schema.etablissements).values(
        ETABLISSEMENTS_REF.map((e) => ({
          codeIaso: e.codeIaso,
          nom: e.nom,
          type: e.type.toUpperCase(),
          departement: e.departement,
          commune: e.commune,
          lat: e.lat,
          lng: e.lng,
          telephoneUrgence: "+229 21 30 01 55",
          capaciteLits: e.capaciteLits || 50,
          banqueDeSangDisponible: true,
        }))
      );
      console.log(`[Neon DB] ${ETABLISSEMENTS_REF.length} formations sanitaires IASO insérées.`);
    }

    // Ingestion des Soignants
    if (SOIGNANTS_REF.length > 0) {
      await db.insert(schema.soignants).values(
        SOIGNANTS_REF.map((s) => {
          const parts = s.nom.trim().split(" ");
          return {
            npi: s.npi,
            nom: parts.slice(1).join(" ") || parts[0],
            prenom: parts[0] || "Dr",
            specialite: s.specialite || "Médecine Générale",
            role: s.type.toUpperCase(),
            etablissementId: s.etablissementId,
            telephone: "+229 97 00 12 34",
            numeroOrdreNational: s.numeroOrdre || "ORDRE-BENIN-2026",
          };
        })
      );
      console.log(`[Neon DB] ${SOIGNANTS_REF.length} professionnels de santé insérés.`);
    }

    // Ingestion des Patients
    if (PATIENTS_REF.length > 0) {
      await db.insert(schema.patients).values(
        PATIENTS_REF.map((p) => {
          const rhesus = p.groupeSanguin.endsWith("+")
            ? "+"
            : p.groupeSanguin.endsWith("-")
            ? "-"
            : "+";
          const groupe = p.groupeSanguin.replace(/[+-]/g, "");
          const dep =
            p.commune === "Kalalé" || p.commune === "Nikki" || p.commune === "Parakou"
              ? "Borgou"
              : p.commune === "Cotonou"
              ? "Littoral"
              : "Atlantique";

          return {
            npi: p.npi,
            nom: p.nom,
            prenom: p.prenom,
            dateNaissance: p.dateNaissance,
            sexe: p.sexe,
            groupeSanguin: groupe || p.groupeSanguin,
            rhesus: rhesus,
            telephone: p.telephone,
            commune: p.commune,
            departement: dep,
            village: `${p.commune} Centre`,
            couvertureArch: p.statutArch === "actif",
            statutGrossesse: !!p.estEnceinte,
            ageGestationnelSemaines: p.semaineAmenorrhee ?? null,
          };
        })
      );
      console.log(`[Neon DB] ${PATIENTS_REF.length} dossiers patients ANIP insérés.`);
    }

    // Ingestion des Donneurs HEMORA
    if (DONNEURS_HEMORA_REF.length > 0) {
      await db.insert(schema.donneursHemora).values(
        DONNEURS_HEMORA_REF.map((d) => ({
          npi: d.npi,
          nomComplet: d.nomComplet,
          groupeSanguin: d.groupeSanguin,
          telephone: d.telephone,
          commune: d.commune,
          lat: d.lat,
          lng: d.lng,
          selSecret: d.selSecret || "salt_2026_demo",
          profileHash: d.profileHash,
          dateDernierDon: d.dateDernierDon,
          nombreDonsValides: d.nombreDonsValides,
          disponiblePourUrgence: d.disponiblePourUrgence,
          soldeDefraiementFcfa: d.soldeDefraiementFcfa,
          bitcoinAddress: (d as any).bitcoinAddress || null,
          otsProof: (d as any).otsProof || null,
        }))
      );
      console.log(`[Neon DB] ${DONNEURS_HEMORA_REF.length} donneurs HEMORA enregistrés.`);
    }

    // Ingestion des Stocks de Sang
    if (STOCKS_SANG_REF.length > 0) {
      await db.insert(schema.stocksSang).values(
        STOCKS_SANG_REF.map((st) => ({
          etablissementId: st.etablissementId,
          hopitalNom: st.hopitalNom,
          departement: st.departement,
          commune: st.commune,
          groupe: st.groupe,
          quantitePoches: st.quantitePoches,
          seuilAlerte: st.seuilAlerte,
        }))
      );
      console.log(`[Neon DB] ${STOCKS_SANG_REF.length} dépôts de sang régionaux synchronisés.`);
    }

    // Ingestion des Campagnes de Don
    if (CAMPAGNES_REF.length > 0) {
      await db.insert(schema.campagnesDon).values(
        CAMPAGNES_REF.map((c: any) => ({
          codeCampagne: c.codeCampagne,
          titre: c.titre,
          description: c.description,
          etablissementOrganisateur: c.etablissementOrganisateur,
          commune: c.commune,
          departement: c.departement,
          lieuCollecte: c.lieuCollecte,
          lat: c.lat,
          lng: c.lng,
          dateDebut: c.dateDebut,
          dateFin: c.dateFin,
          objectifPoches: c.objectifPoches,
          pochesCollectees: c.pochesCollectees,
          statut: c.statut,
        }))
      );
      console.log(`[Neon DB] ${CAMPAGNES_REF.length} campagnes de don BMM insérées.`);
    }

    // Ingestion des Transferts
    if (TRANSFERTS_REF.length > 0) {
      await db.insert(schema.transfertsSang).values(
        TRANSFERTS_REF.map((t: any) => ({
          codeTransfert: t.codeTransfert,
          sourceHopital: t.sourceHopital,
          destinationHopital: t.destinationHopital,
          groupeSanguin: t.groupeSanguin,
          quantitePoches: t.quantitePoches,
          urgenceLevel: t.urgenceLevel,
          statut: t.statut,
        }))
      );
      console.log(`[Neon DB] ${TRANSFERTS_REF.length} transferts de sang inter-centres insérés.`);
    }

    // Ingestion des Demandes de Cartes
    if (DEMANDES_CARTES_REF.length > 0) {
      await db.insert(schema.demandesCartes).values(
        DEMANDES_CARTES_REF.map((dc: any) => ({
          donneurNpi: dc.donneurNpi,
          donneurNom: dc.donneurNom,
          groupeSanguin: dc.groupeSanguin,
          communeLivraison: dc.communeLivraison,
          statut: dc.statut,
          qrCodeData: dc.qrCodeData,
          hashVerification: dc.hashVerification,
          otsProof: dc.otsProof,
        }))
      );
      console.log(`[Neon DB] ${DEMANDES_CARTES_REF.length} demandes de cartes donneur insérées.`);
    }

    // Ingestion Historique des Dons
    const DONS_HISTORIQUE_REF = DONNEURS_HEMORA_REF.filter((d) => d.nombreDonsValides > 0).map((d, i) => ({
      codeDon: `DON-2026-${1000 + i}`,
      donneurNpi: d.npi,
      etablissementNom: "Hôpital de Zone de Nikki-Kalalé-Pèrèrè",
      groupeSanguin: d.groupeSanguin,
      dateDon: d.dateDernierDon || "2026-02-15",
      pointsFidelite: 100,
      statutMedical: "VALIDE",
      defraiementMontantFcfa: 2000,
      defraiementCanal: "MOBILE_MONEY",
      defraiementRef: `MOMO-REF-${88234 + i}`,
      otsTimestampHash: d.profileHash,
    }));

    if (DONS_HISTORIQUE_REF.length > 0) {
      await db.insert(schema.donsHistorique).values(
        DONS_HISTORIQUE_REF.map((dh) => ({
          codeDon: dh.codeDon,
          donneurNpi: dh.donneurNpi,
          etablissementNom: dh.etablissementNom,
          groupeSanguin: dh.groupeSanguin,
          dateDon: dh.dateDon,
          pointsFidelite: dh.pointsFidelite,
          statutMedical: dh.statutMedical,
          defraiementMontantFcfa: dh.defraiementMontantFcfa,
          defraiementCanal: dh.defraiementCanal,
          defraiementRef: dh.defraiementRef,
          otsTimestampHash: dh.otsTimestampHash,
        }))
      );
      console.log(`[Neon DB] ${DONS_HISTORIQUE_REF.length} dons historiques insérés.`);
    }

    // Ingestion Points Ledger
    if (POINTS_LEDGER_REF.length > 0) {
      await db.insert(schema.pointsLedger).values(
        POINTS_LEDGER_REF.map((pl) => ({
          donneurNpi: pl.donneurNpi,
          donneurNom: pl.donneurNom,
          action: pl.action,
          points: pl.points,
          motif: pl.motif,
          transactionHash: pl.transactionHash,
          otsProof: pl.otsProof,
        }))
      );
      console.log(`[Neon DB] ${POINTS_LEDGER_REF.length} transactions points fidélité insérées.`);
    }

    // Urgence de démonstration Nikki
    await db.insert(schema.urgencesTransfusion).values({
      codeUrgence: "URG-2026-NIK-001",
      hopitalNom: "Hôpital de Zone de Nikki",
      commune: "Nikki",
      lat: 9.9400,
      lng: 3.2108,
      groupeRequis: "O+",
      pochesRequises: 2,
      statut: "OUVERTE",
    });
    console.log("[Neon DB] Urgence témoin Nikki URG-2026-NIK-001 initialisée.");

    console.log("[Neon DB - Succès] Toutes les données ont été synchronisées avec succès !");
  } catch (dbError) {
    console.warn("[Neon DB Seed Warning] Impossible d'écrire sur Neon DB (fallback in-memory actif) :", dbError);
  } finally {
    await pool.end();
  }
}

runSeed().catch((err) => {
  console.error("[Erreur] Erreur lors du seed :", err);
  process.exit(1);
});
