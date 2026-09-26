import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { UrgenceTransfusion } from "@/lib/types";

export async function GET() {
  const urgences = Array.from(dbStore.urgencesTransfusion.values());
  return NextResponse.json({ success: true, data: urgences });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hopitalNom, commune, lat = 9.9400, lng = 3.2108, groupeRequis, pochesRequises = 2 } = body;

    if (!hopitalNom || !commune || !groupeRequis) {
      return NextResponse.json(
        { success: false, error: "hopitalNom, commune et groupeRequis sont requis" },
        { status: 400 }
      );
    }

    const codeUrgence = `URG-2026-${commune.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const urgence: UrgenceTransfusion = {
      id: `urg-${Date.now()}`,
      codeUrgence,
      hopitalNom,
      commune,
      lat,
      lng,
      groupeRequis,
      pochesRequises,
      statut: "OUVERTE",
      dateDeclaration: new Date().toISOString(),
    };

    dbStore.urgencesTransfusion.set(codeUrgence, urgence);

    return NextResponse.json({
      success: true,
      message: "Alerte d'urgence transfusionnelle diffusée au réseau HEMORA.",
      data: urgence,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
