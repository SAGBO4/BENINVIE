import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { executeSimulatedPayment } from "@/lib/simulation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dossierId, modeApurement, montantVerse, operateur, telephone } = body;

    if (!dossierId || !modeApurement) {
      return NextResponse.json(
        { success: false, error: "dossierId et modeApurement sont requis" },
        { status: 400 }
      );
    }

    const dossier = dbStore.dossiersDiffere.get(dossierId);
    if (!dossier) {
      return NextResponse.json(
        { success: false, error: "Dossier de paiement différé introuvable" },
        { status: 404 }
      );
    }

    if (modeApurement === "ARCH") {
      dossier.statutApurement = "couvert_arch";
      dbStore.logAudit({
        action: "APUREMENT_URGENCE",
        acteurNpi: "AGENCE-ARCH-01",
        acteurNom: "Caisse Nationale ARCH",
        role: "assureur",
        cibleId: dossier.id,
        details: {
          mode: "ARCH_100_POURCENT",
          montantPrisEnCharge: dossier.montantTotalFcfa,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Dossier d'urgence soldé intégralement par la couverture universelle ARCH (0 FCFA reste à charge)",
        data: dossier,
      });
    }

    if (modeApurement === "MOBILE_MONEY") {
      const paiement = executeSimulatedPayment({
        operateur: operateur || "MTN_MOMO",
        telephone: telephone || "+229 01 00 00 00 00",
        montantFcfa: montantVerse || dossier.montantTotalFcfa,
        motif: `Régularisation soins d'urgence ${dossier.referenceGarantieEtat}`,
      });

      dbStore.paymentLogs.unshift(paiement);
      dossier.statutApurement = "solde";

      dbStore.logAudit({
        action: "APUREMENT_URGENCE",
        acteurNpi: telephone || "PATIENT-MOMO",
        acteurNom: "Paiement Mobile Money",
        role: "patient",
        cibleId: dossier.id,
        details: {
          referenceTransaction: paiement.referenceTransaction,
          montantPaye: paiement.montantFcfa,
          operateur: paiement.operateur,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Dossier régularisé avec succès par Mobile Money",
        data: {
          dossier,
          transaction: paiement,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Mode d'apurement non reconnu (ARCH ou MOBILE_MONEY)" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
