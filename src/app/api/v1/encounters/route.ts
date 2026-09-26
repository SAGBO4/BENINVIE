import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { Encounter } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  const encounters = Array.from(dbStore.encounters.values());
  if (patientId) {
    const filtered = encounters.filter((e) => e.patientId === patientId);
    return NextResponse.json({ success: true, data: filtered });
  }

  return NextResponse.json({ success: true, data: encounters });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.soignantId || !body.motif) {
      return NextResponse.json(
        { success: false, error: "patientId, soignantId et motif sont obligatoires" },
        { status: 400 }
      );
    }

    const encounter: Encounter = {
      id: `enc-${Date.now()}`,
      patientId: body.patientId,
      soignantId: body.soignantId,
      etablissementId: body.etablissementId || "etab-csc-kalale-01",
      type: body.type || "ambulatoire",
      motif: body.motif,
      diagnostic: body.diagnostic,
      observations: body.observations || {},
      modePaiement: body.modePaiement || "immediat",
      creeLe: new Date().toISOString(),
    };

    dbStore.encounters.set(encounter.id, encounter);

    return NextResponse.json({ success: true, data: encounter }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
