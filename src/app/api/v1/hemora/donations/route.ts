import { NextRequest, NextResponse } from "next/server";
import {
  enregistrerDonSang,
  HemoraValidationError,
  HemoraNotFoundError,
} from "@/services/hemora.service";

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
      donneurNpi,
      etablissementId,
      typeDon,
      motifAjournement,
      operateur,
    } = body;

    const result = await enregistrerDonSang({
      donneurNpi,
      etablissementId,
      typeDon,
      motifAjournement,
      operateur,
    });

    return NextResponse.json({
      success: true,
      message:
        typeDon === "AJOURNEMENT_MEDICAL"
          ? "Présentation enregistrée. Ajournement médical sans pénalité : défraiement de transport versé conformément à la charte éthique."
          : "Prélèvement validé avec succès. Défraiement forfaitaire versé et stock mis à jour.",
      data: {
        donneur: result.donneur,
        paiementTransport: result.paiement,
        stockMisAJour: result.stockMisAJour,
        preuveBitcoinOTS: { otsProof: result.otsProof },
      },
    });
  } catch (error: any) {
    if (error instanceof HemoraValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    if (error instanceof HemoraNotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message || "Erreur interne" }, { status: 500 });
  }
}
