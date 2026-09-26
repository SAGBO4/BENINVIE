import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { matchDonneursUrgence } from "@/lib/haversine";
import { GroupeSanguin } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const groupe = searchParams.get("groupe") as GroupeSanguin | null;

  if (!latStr || !lngStr || !groupe) {
    return NextResponse.json(
      { success: false, error: "lat, lng et groupe requis en paramètres de requête" },
      { status: 400 }
    );
  }

  const pointUrgence = { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
  const donneurs = Array.from(dbStore.donneursHemora.values());
  const matches = matchDonneursUrgence(donneurs, pointUrgence, groupe);

  return NextResponse.json({
    success: true,
    totalTrouves: matches.length,
    pointUrgence,
    groupeRequis: groupe,
    data: matches,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lat, lng, groupeRequis } = body;

    if (lat === undefined || lng === undefined || !groupeRequis) {
      return NextResponse.json(
        { success: false, error: "lat, lng et groupeRequis sont requis" },
        { status: 400 }
      );
    }

    const pointUrgence = { lat: Number(lat), lng: Number(lng) };
    const donneurs = Array.from(dbStore.donneursHemora.values());
    const matches = matchDonneursUrgence(donneurs, pointUrgence, groupeRequis as GroupeSanguin);

    return NextResponse.json({
      success: true,
      totalTrouves: matches.length,
      pointUrgence,
      groupeRequis,
      data: matches,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
