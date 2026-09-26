import { NextRequest, NextResponse } from "next/server";
import { TRANSFERTS_REF } from "@/data/referentiels";
import { TransfertSang } from "@/lib/types";

let localTransferts: TransfertSang[] = [...TRANSFERTS_REF];

export async function GET() {
  return NextResponse.json({
    success: true,
    total: localTransferts.length,
    data: localTransferts,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceHopital, destinationHopital, groupeSanguin, quantitePoches, urgenceLevel = "STANDARD" } = body;

    if (!sourceHopital || !destinationHopital || !groupeSanguin || !quantitePoches) {
      return NextResponse.json(
        { success: false, error: "sourceHopital, destinationHopital, groupeSanguin et quantitePoches sont requis" },
        { status: 400 }
      );
    }

    const newTransfert: TransfertSang = {
      id: `trf-${Date.now()}`,
      codeTransfert: `TRF-2026-${Date.now().toString().slice(-4)}`,
      sourceHopital,
      destinationHopital,
      groupeSanguin,
      quantitePoches: Number(quantitePoches),
      urgenceLevel: urgenceLevel === "VITALE" ? "VITALE" : "STANDARD",
      statut: "EN_TRANSIT",
      dateEnvoi: new Date().toISOString(),
    };

    localTransferts.unshift(newTransfert);

    return NextResponse.json({
      success: true,
      message: `Transfert de ${newTransfert.quantitePoches} poches ${newTransfert.groupeSanguin} déclenché`,
      data: newTransfert,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
