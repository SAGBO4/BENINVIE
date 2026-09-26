import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { SignalementCitoyen, TypeInfraction } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const npi = searchParams.get("npi");

    let items = Array.from(dbStore.signalements.values());
    if (npi) {
      items = items.filter((s) => s.declarantNpi === npi);
    }

    // Tri du plus récent au plus ancien
    items.sort((a, b) => new Date(b.dateSignalement).getTime() - new Date(a.dateSignalement).getTime());

    return NextResponse.json({
      success: true,
      total: items.length,
      tutelle: "Ministère de la Santé du Bénin — Inspection Générale des Services de Santé",
      signalements: items,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      typeInfraction,
      etablissementNom,
      commune,
      departement,
      dateFaits,
      description,
      anonyme,
      declarantNpi,
      declarantNom,
      declarantTelephone,
      gravite,
    } = body;

    if (!typeInfraction || !etablissementNom || !description) {
      return NextResponse.json(
        { success: false, error: "typeInfraction, etablissementNom et description sont obligatoires" },
        { status: 400 }
      );
    }

    const typeLabels: Record<TypeInfraction, string> = {
      REFUS_ADMISSION_URGENCE: "Refus d'admission en urgence vitale sans paiement",
      EXIGENCE_CAUTION_ILLEGALE: "Exigence de caution préalable illégale",
      RANCONNEMENT_CORRUPTION: "Rançonnement, corruption ou surfacturation non officielle",
      ABSENCE_INJUSTIFIEE_PERSONNEL: "Absence injustifiée de personnel de garde",
      REFUS_DELIVRANCE_ARCH: "Refus de délivrance de soins ou médicaments gratuits ARCH",
      DEFAUT_PRISE_EN_CHARGE: "Négligence médicale ou défaut d'assistance",
      AUTRE_MANQUEMENT: "Autre manquement aux obligations de service public",
    };

    const codeDossier = `PLN-2026-MIN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSignalement: SignalementCitoyen = {
      id: `sig-${Date.now()}`,
      codeDossier,
      typeInfraction: typeInfraction as TypeInfraction,
      typeInfractionLabel: typeLabels[typeInfraction as TypeInfraction] || "Manquement signalé",
      etablissementNom,
      commune: commune || "Bénin",
      departement: departement || "National",
      dateFaits: dateFaits || new Date().toISOString().split("T")[0],
      description,
      anonyme: !!anonyme,
      declarantNpi: anonyme ? undefined : declarantNpi,
      declarantNom: anonyme ? "Citoyen Anonyme (Protégé)" : declarantNom,
      declarantTelephone: anonyme ? undefined : declarantTelephone,
      gravite: gravite || "CRITIQUE",
      statut: "TRANSMIS_MINISTERE",
      reponseMinistere: "Signalement transmis à l'Inspection Générale de la Santé pour enquête administrative d'urgence.",
      dateSignalement: new Date().toISOString(),
    };

    dbStore.signalements.set(codeDossier, newSignalement);

    // Journalisation inaltérable dans les audit logs
    dbStore.logAudit({
      action: "DENONCIATION_CITOYENNE",
      acteurNpi: anonyme ? "ANONYME" : declarantNpi || "CITOYEN",
      acteurNom: anonyme ? "Lanceur d'Alerte Anonyme" : declarantNom || "Citoyen",
      role: "citoyen",
      cibleId: etablissementNom,
      details: {
        codeDossier,
        typeInfraction,
        commune,
        gravite: newSignalement.gravite,
        transmisAuMinistere: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Signalement enregistré avec succès et transmis directement à l'Inspection Générale du Ministère de la Santé.",
      codeDossier,
      signalement: newSignalement,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
