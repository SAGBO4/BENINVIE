import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptomes, langue = "fr", patientNpi, enceinte = false } = body;

    if (!symptomes) {
      return NextResponse.json(
        { success: false, error: "Le champ symptomes est requis pour l'analyse" },
        { status: 400 }
      );
    }

    const texteLower = String(symptomes).toLowerCase();

    // Détection de signes de gravité vitale (urgence rouge)
    const isHemmoragie =
      texteLower.includes("saignement") ||
      texteLower.includes("sang") ||
      texteLower.includes("hémorrag") ||
      texteLower.includes("métrorrag") ||
      texteLower.includes("kɔ") ||
      texteLower.includes("délivrance");

    const isDetresseResp =
      texteLower.includes("respirer") ||
      texteLower.includes("étouffe") ||
      texteLower.includes("essoufflement") ||
      texteLower.includes("asphyxie");

    const isConvulsionComa =
      texteLower.includes("convulsion") ||
      texteLower.includes("inconscient") ||
      texteLower.includes("coma") ||
      texteLower.includes("évanoui");

    const isGraviteGrossesse =
      enceinte &&
      (isHemmoragie || texteLower.includes("maux de tête violents") || texteLower.includes("gonflement"));

    let niveauUrgence: "ROUGE_VITALE" | "ORANGE_URGENT" | "VERT_STANDARD" = "VERT_STANDARD";
    let scoreGravite = 25;
    let orientation = "Centre de Santé Communal le plus proche pour consultation générale";
    let protocole = "Surveillance ambulatoire et bilan de routine";
    const alertes: string[] = [];

    if (isHemmoragie || isDetresseResp || isConvulsionComa || isGraviteGrossesse) {
      niveauUrgence = "ROUGE_VITALE";
      scoreGravite = 95;
      orientation = "Évacuation d'urgence immédiate vers l'Hôpital de Zone / CHIC avec admission Bris de Glace";
      protocole = "Protocole Urgence Vitale Nationale : Prise en charge immédiate sans avance financière";
      if (isHemmoragie) {
        alertes.push("Risque de choc hémorragique : Pré-alerter la banque de sang HEMORA pour culots O+ / O-");
      }
      if (isGraviteGrossesse) {
        alertes.push("Urgence obstétricale majeure : Préparer la maternité de référence pour césarienne ou hémostase");
      }
    } else if (
      texteLower.includes("fièvre") ||
      texteLower.includes("vomissement") ||
      texteLower.includes("palu") ||
      texteLower.includes("diarrhée")
    ) {
      niveauUrgence = "ORANGE_URGENT";
      scoreGravite = 65;
      orientation = "Consultation prioritaire au Centre de Santé Communal dans les 30 minutes";
      protocole = "Protocole PCIME : Test de Diagnostic Rapide (TDR Palu) + Hydratation Orale";
      alertes.push("Contrôler la température, la tension artérielle et la glycémie");
    }

    return NextResponse.json({
      success: true,
      data: {
        analyseTimestamp: new Date().toISOString(),
        langueDetectee: langue,
        symptomesAnalyses: symptomes,
        niveauUrgence,
        scoreGravite,
        orientationRecommandee: orientation,
        protocoleNational: protocole,
        alertesCliniques: alertes,
        rappelReglementaire:
          "Cette analyse IA est une aide à la décision clinique d'orientation. La décision médicale appartient au professionnel de santé diplômé.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
