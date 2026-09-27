import { NextRequest, NextResponse } from "next/server";
import {
  delivrerOrdonnanceSecurisee,
  DeliveryConcurrencyError,
  ValidationError,
  NotFoundError,
} from "@/services/ordonnance.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Corps de requête JSON manquant ou invalide" },
        { status: 400 }
      );
    }

    const code = body.code || body.codeUnique;
    const pharmacieNom = body.pharmacieNom;
    const pharmacieNpi = body.pharmacieNpi || "NPI-PHARM-2026-001";

    const ordonnance = await delivrerOrdonnanceSecurisee({
      code,
      pharmacieNom,
      pharmacieNpi,
    });

    return NextResponse.json({
      success: true,
      message: "Ordonnance validée et délivrée avec succès. Statut verrouillé à usage unique.",
      data: ordonnance,
    });
  } catch (error: any) {
    if (error instanceof DeliveryConcurrencyError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          dateDelivrancePrecedente: error.dateDelivrancePrecedente,
          pharmaciePrecedente: error.pharmaciePrecedente,
        },
        { status: 409 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, error: error.message || "Erreur interne lors de la délivrance" },
      { status: 500 }
    );
  }
}
