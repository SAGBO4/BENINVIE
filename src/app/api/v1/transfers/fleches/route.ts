import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { executeSimulatedPayment, sendSimulatedSms } from "@/lib/simulation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientNpi, typeSoin, montantFcfa = 5000, soignantNpi = "NPI-ASC-2026-8801" } = body;

    if (!patientNpi || !typeSoin) {
      return NextResponse.json({ success: false, error: "patientNpi et typeSoin sont obligatoires" }, { status: 400 });
    }

    const patient = dbStore.patients.get(patientNpi);
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient introuvable" }, { status: 404 });
    }

    // 1. Exécution du transfert monétaire fléché (programme GBESSOKE)
    const paiement = executeSimulatedPayment({
      operateur: "MTN_MOMO",
      telephone: patient.telephone,
      montantFcfa,
      motif: `Transfert monétaire d'incitation nutritionnelle GBESSOKE suite à validation de soin : ${typeSoin}`,
    });

    dbStore.paymentLogs.unshift(paiement);

    // 2. Notification SMS en langue locale (Bariba pour Kalalé)
    const sms = sendSimulatedSms({
      telephone: patient.telephone,
      message: `Gbɛ / GBESSOKE : Fofo ! A gbé 5.000 FCFA kɛ́ Mobile Money nɔ ${patient.prenom} nɔ CPN3 pɛ́lɛ. (Transfert de 5.000 FCFA reçu avec succès suite à la consultation CPN3).`,
      langue: "bariba",
      expediteur: "GBESSOKE-BJ",
    });

    dbStore.smsLogs.unshift(sms);

    // 3. Journalisation d'audit
    dbStore.logAudit({
      action: "TRANSFERT_FLECHE",
      acteurNpi: soignantNpi,
      acteurNom: "Agent de Santé Communautaire (ASC)",
      role: "asc",
      cibleId: patient.npi,
      details: {
        typeSoin,
        montantFcfa,
        referencePaiement: paiement.referenceTransaction,
        telephoneBeneficiaire: patient.telephone,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transfert monétaire fléché GBESSOKE validé et versé avec succès par Mobile Money.",
      data: {
        paiement,
        notificationSms: sms,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
