import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, pharmacieNom = "Pharmacie Conventionnée" } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Le code d'ordonnance est requis" }, { status: 400 });
    }

    const ordonnance = dbStore.ordonnances.get(code);
    if (!ordonnance) {
      return NextResponse.json({ success: false, error: "Ordonnance introuvable" }, { status: 404 });
    }

    // Sécurité stricte usage unique : impossible de re-délivrer une ordonnance déjà honorée
    if (ordonnance.statut === "DELIVREE") {
      return NextResponse.json({
        success: false,
        error: `ALERTE FRAUDE : Cette ordonnance a déjà été délivrée le ${ordonnance.dateDelivrance} par ${ordonnance.pharmacieNom}. Usage unique expiré.`,
        dateDelivrancePrecedente: ordonnance.dateDelivrance,
        pharmaciePrecedente: ordonnance.pharmacieNom,
      }, { status: 409 });
    }

    if (ordonnance.statut === "ANNULEE") {
      return NextResponse.json({ success: false, error: "Cette ordonnance a été annulée par le prescripteur" }, { status: 410 });
    }

    // Validation de la délivrance
    const dateDelivrance = new Date().toISOString();
    ordonnance.statut = "DELIVREE";
    ordonnance.dateDelivrance = dateDelivrance;
    ordonnance.pharmacieNom = pharmacieNom;

    // Journalisation immuable dans l'audit log
    dbStore.logAudit({
      action: "DELIVRANCE_ORDONNANCE",
      acteurNpi: pharmacieNom,
      acteurNom: pharmacieNom,
      role: "pharmacien",
      cibleId: ordonnance.code,
      details: {
        patientNpi: ordonnance.patientNpi,
        typeOrdonnance: ordonnance.typeOrdonnance,
        medicamentsDelivres: ordonnance.medicaments.map((m) => m.nom),
        dateDelivrance,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ordonnance validée et délivrée avec succès. Statut verrouillé à usage unique.",
      data: ordonnance,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
