import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { DossierPaiementDiffere, Encounter } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientNpi,
      motifUrgence,
      montantTotalFcfa = 75000,
      soignantNpi = "NPI-MED-2026-0042",
      etablissementId = "etab-hz-nikki-01",
    } = body;

    if (!patientNpi || !motifUrgence) {
      return NextResponse.json(
        { success: false, error: "patientNpi et motifUrgence sont obligatoires" },
        { status: 400 }
      );
    }

    const patient = dbStore.patients.get(patientNpi);
    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient introuvable dans le répertoire national" },
        { status: 404 }
      );
    }

    // 1. Créer l'encounter d'urgence vitale sans avance financière
    const encounterId = `enc-urg-${Date.now()}`;
    const encounter: Encounter = {
      id: encounterId,
      patientId: patient.id,
      soignantId: soignantNpi,
      etablissementId,
      type: "urgence_vitale",
      motif: motifUrgence,
      diagnostic: "Prise en charge vitale immédiate sous garantie publique",
      observations: {
        notes: "Admission sans caution financière - Règle d'or Zéro Refus",
      },
      modePaiement: "paiement_differe_urgence",
      creeLe: new Date().toISOString(),
    };
    dbStore.encounters.set(encounterId, encounter);

    // 2. Créer automatiquement le dossier de paiement différé garanti par l'État
    const refGarantie = `GARANTIE-ETAT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const echeance = new Date();
    echeance.setDate(echeance.getDate() + 30); // 30 jours pour régularisation après stabilisation

    const dossier: DossierPaiementDiffere = {
      id: `dpd-${Date.now()}`,
      encounterId,
      patientId: patient.id,
      patientNpi: patient.npi,
      patientNom: `${patient.prenom} ${patient.nom}`,
      montantTotalFcfa,
      statutApurement: patient.statutArch === "actif" ? "couvert_arch" : "en_attente",
      referenceGarantieEtat: refGarantie,
      echeanceDate: echeance.toISOString().split("T")[0],
      creeLe: new Date().toISOString(),
    };
    dbStore.dossiersDiffere.set(dossier.id, dossier);

    // 3. Journaliser dans les audit logs
    dbStore.logAudit({
      action: "CREATION_DOSSIER_DIFFERE",
      acteurNpi: soignantNpi,
      acteurNom: "Service des Urgences",
      role: "urgentiste",
      cibleId: dossier.id,
      details: {
        patientNpi: patient.npi,
        montantTotalFcfa,
        referenceGarantieEtat: refGarantie,
        couvertArch: patient.statutArch === "actif",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Patient admis en urgence vitale sans avance financière. Dossier de paiement différé ouvert.",
      data: {
        encounter,
        dossier,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
