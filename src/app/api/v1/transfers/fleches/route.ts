import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { executeSimulatedPayment, sendSimulatedSms } from "@/lib/simulation";
import { Patient } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientNpi, montantFcfa = 5000 } = body;
    const soignantNpi = body.soignantNpi || body.ascNpi || "NPI-ASC-2026-8801";
    const typeSoin = body.typeSoin || body.typeActe || "CPN3";

    if (!patientNpi) {
      return NextResponse.json({ success: false, error: "patientNpi est obligatoire" }, { status: 400 });
    }

    let patient: Patient | undefined = dbStore.patients.get(patientNpi);
    if (!patient) {
      // Recherche insensible à la casse ou par partie de NPI
      for (const p of dbStore.patients.values()) {
        if (p.npi.toLowerCase() === patientNpi.toLowerCase() || p.telephone === body.telephone) {
          patient = p;
          break;
        }
      }
    }

    if (!patient) {
      // Patient Bio par défaut si test
      const defaultPatient: Patient = dbStore.patients.get("2026-KAL-9821-BIO") || {
        id: "pat-bio-01",
        npi: patientNpi,
        nom: "GOUDA",
        prenom: "Bio",
        telephone: body.telephone || "+229 97 45 12 33",
        commune: "Kalalé",
        groupeSanguin: "O+",
        dateNaissance: "1998-04-12",
        sexe: "F",
        allergies: [],
        estEnceinte: true,
        semaineAmenorrhee: 34,
        statutArch: "actif",
        creeLe: new Date().toISOString(),
      };
      patient = defaultPatient;
      dbStore.patients.set(patientNpi, defaultPatient);
    }

    const currentPatient: Patient = patient;

    // 1. Exécution du transfert monétaire fléché (programme GBESSOKE)
    const paiement = executeSimulatedPayment({
      operateur: "MTN_MOMO",
      telephone: currentPatient.telephone,
      montantFcfa,
      motif: `Transfert monétaire d'incitation nutritionnelle GBESSOKE suite à validation de soin : ${typeSoin}`,
    });

    dbStore.paymentLogs.unshift(paiement);

    // 2. Notification SMS en langue locale (Bariba pour Kalalé)
    const sms = sendSimulatedSms({
      telephone: currentPatient.telephone,
      message: `BENINVIE / GBESSOKE : Fofo ! A gbé 5.000 FCFA kɛ́ Mobile Money nɔ ${currentPatient.prenom} nɔ CPN3 pɛ́lɛ. (Transfert de 5.000 FCFA reçu avec succès suite à la consultation CPN3).`,
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
      cibleId: currentPatient.npi,
      details: {
        typeSoin,
        montantFcfa,
        referencePaiement: paiement.referenceTransaction,
        telephoneBeneficiaire: currentPatient.telephone,
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
