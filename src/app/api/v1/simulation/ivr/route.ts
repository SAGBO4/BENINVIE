import { NextRequest, NextResponse } from "next/server";
import { triggerSimulatedIvrCall } from "@/lib/simulation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telephone, langue = "bariba", audioTitre, transcriptionFr } = body;

    const ivr = triggerSimulatedIvrCall({
      telephone: telephone || "+229 01 97 00 12 34",
      langue,
      audioTitre: audioTitre || "Rappel CPN3 en langue Bariba",
      transcriptionFr:
        transcriptionFr ||
        "Bonjour Bio, ceci est un rappel de santé. Votre 3ème consultation prénatale est prévue demain au Centre de Santé de Kalalé. Munissez-vous de votre carte QR.",
    });

    return NextResponse.json({ success: true, data: ivr });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
