import { NextRequest, NextResponse } from "next/server";
import {
  admettreUrgenceVitale,
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

    const {
      patientNpi,
      motifUrgence,
      montantTotalFcfa,
      soignantNpi,
      etablissementId,
    } = body;

    const result = await admettreUrgenceVitale({
      patientNpi,
      motifUrgence,
      montantTotalFcfa,
      soignantNpi,
      etablissementId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Patient admis en urgence vitale sans avance financière. Dossier de paiement différé garanti par l'État ouvert.",
        data: {
          encounter: result.encounter,
          dossier: result.dossierDiffere,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof UrgenceValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    if (error instanceof UrgenceNotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, error: error.message || "Erreur interne lors de l'admission" },
      { status: 500 }
    );
  }
}
