import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientNpi, praticienNpi, praticienNom, etablissementNom, motifUrgence } = body;

    if (!patientNpi || !praticienNpi || !motifUrgence) {
      return NextResponse.json(
        { success: false, error: "patientNpi, praticienNpi et motifUrgence sont obligatoires pour le mode bris de glace" },
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

    // 1. Journalisation inaltérable obligatoire dans les audit logs APDP
    const auditEntry = dbStore.logAudit({
      action: "BRIS_DE_GLACE",
      acteurNpi: praticienNpi,
      acteurNom: praticienNom || "Médecin Urgentiste",
      role: "urgentiste",
      cibleId: patient.npi,
      details: {
        motifUrgence,
        etablissementNom: etablissementNom || "Service des Urgences",
        groupeSanguinConsulte: patient.groupeSanguin,
        allergiesConsultees: patient.allergies,
        grossesseSemaines: patient.estEnceinte ? patient.semaineAmenorrhee : null,
      },
    });

    // 2. Retour immédiat du profil vital déverrouillé
    return NextResponse.json({
      success: true,
      message: "Accès d'urgence Bris de Glace accordé. Consultation journalisée auprès de l'APDP.",
      auditId: auditEntry.id,
      profilVital: {
        npi: patient.npi,
        nom: patient.nom,
        prenom: patient.prenom,
        dateNaissance: patient.dateNaissance,
        groupeSanguin: patient.groupeSanguin,
        allergies: patient.allergies,
        estEnceinte: patient.estEnceinte,
        semaineAmenorrhee: patient.semaineAmenorrhee,
        statutArch: patient.statutArch,
        numeroArch: patient.numeroArch,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
