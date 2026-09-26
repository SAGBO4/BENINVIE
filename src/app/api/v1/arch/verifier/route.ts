import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { npi } = body;

    if (!npi) {
      return NextResponse.json({ success: false, error: "NPI requis" }, { status: 400 });
    }

    const patient = dbStore.patients.get(npi);
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient introuvable pour ce NPI" }, { status: 404 });
    }

    const isActif = patient.statutArch === "actif";

    return NextResponse.json({
      success: true,
      data: {
        npi: patient.npi,
        nomComplet: `${patient.prenom} ${patient.nom}`,
        commune: patient.commune,
        statutArch: patient.statutArch,
        numeroArch: patient.numeroArch,
        panierSoinsGratuits: [
          "Consultations Prénatales (CPN 1 à 4)",
          "Accouchement et césarienne d'urgence",
          "Traitement préventif et curatif du paludisme",
          "Vaccination PEV des enfants de 0 à 5 ans",
          "Transfusion sanguine d'urgence vitale",
        ],
        tauxCouverturePourcent: isActif ? 100 : 0,
        resteAChargePatientFcfa: 0,
        message: isActif
          ? "Droits ARCH actifs : Prise en charge intégrale à 100% sur le panier national de soins essentiels."
          : "Droits ARCH en cours d'enrôlement auprès du GUPS communal.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
