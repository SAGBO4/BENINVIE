import { NextRequest, NextResponse } from "next/server";
import {
  executerBrisDeGlace,
  UrgenceValidationError,
  UrgenceNotFoundError,
} from "@/services/urgences.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Corps de requête JSON manquant ou invalide" },
        { status: 400 }
      );
    }

    const { patientNpi, praticienNpi, praticienNom, etablissementNom, motifUrgence } = body;

    const result = await executerBrisDeGlace({
      patientNpi,
      soignantNpi: praticienNpi,
      soignantNom: praticienNom || "Médecin Urgentiste",
      etablissementNom: etablissementNom || "Service des Urgences",
      motif: motifUrgence,
    });

    const patient = result.patient;

    return NextResponse.json({
      success: true,
      message: "Accès d'urgence Bris de Glace accordé. Consultation journalisée de façon immuable auprès de l'APDP.",
      traceAudit: result.traceAudit,
      profilVital: {
        npi: patient.npi,
        nom: patient.nom,
        prenom: patient.prenom,
        dateNaissance: patient.dateNaissance,
        groupeSanguin: patient.groupeSanguin,
        commune: patient.commune,
        couvertureArch: (patient as any).couvertureArch ?? ((patient as any).statutArch === "actif"),
        statutGrossesse: (patient as any).statutGrossesse ?? Boolean((patient as any).estEnceinte),
      },
    });
  } catch (error: any) {
    if (error instanceof UrgenceValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    if (error instanceof UrgenceNotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message || "Erreur interne" }, { status: 500 });
  }
}
