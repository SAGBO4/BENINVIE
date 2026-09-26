import { NextRequest, NextResponse } from "next/server";
import { URGENCES_HEMORA_REF, DONNEURS_HEMORA_REF } from "@/data/referentiels";
import { UrgenceTransfusion, GroupeSanguin } from "@/lib/types";

let runtimeEmergencies: UrgenceTransfusion[] = [...URGENCES_HEMORA_REF];

// Tables de compatibilité stricte érythrocytaire
const COMPATIBILITE_TRANSFUSION: Record<GroupeSanguin, GroupeSanguin[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "AB-": ["O-", "B-", "A-", "AB-"],
  "AB+": ["O-", "O+", "B-", "B+", "A-", "A+", "AB-", "AB+"],
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    total: runtimeEmergencies.length,
    data: runtimeEmergencies,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hopitalNom, commune, lat, lng, groupeRequis, pochesRequises } = body;

    if (!hopitalNom || !commune || !lat || !lng || !groupeRequis || !pochesRequises) {
      return NextResponse.json(
        {
          success: false,
          error: "Champs requis : hopitalNom, commune, lat, lng, groupeRequis, pochesRequises",
        },
        { status: 400 }
      );
    }

    const codeUrgence = `URG-HEM-${Date.now().toString().slice(-6)}`;
    const newEmergency: UrgenceTransfusion = {
      id: `urg-${Date.now()}`,
      codeUrgence,
      hopitalNom,
      commune,
      lat: Number(lat),
      lng: Number(lng),
      groupeRequis: groupeRequis as GroupeSanguin,
      pochesRequises: Number(pochesRequises),
      statut: "OUVERTE",
      dateDeclaration: new Date().toISOString(),
    };

    runtimeEmergencies = [newEmergency, ...runtimeEmergencies];

    // Recherche instantanée des donneurs compatibles dans un rayon de 45 km
    const groupesCompatibles = COMPATIBILITE_TRANSFUSION[newEmergency.groupeRequis] || [newEmergency.groupeRequis];
    const donneursEligibles = DONNEURS_HEMORA_REF.filter(
      (d) => d.disponiblePourUrgence && groupesCompatibles.includes(d.groupeSanguin)
    ).map((d) => {
      const dist = haversineDistance(newEmergency.lat, newEmergency.lng, d.lat, d.lng);
      return {
        donneur: d,
        distanceKm: dist,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json(
      {
        success: true,
        message: "Urgence vitale transfusionnelle déclarée. Alerte multicanale activée.",
        emergency: newEmergency,
        donneursCibles: donneursEligibles.slice(0, 5),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de déclaration d'urgence" },
      { status: 500 }
    );
  }
}
