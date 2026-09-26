import { NextResponse } from "next/server";
import { MEDICAMENTS_MTA_CERTIFIES } from "@/data/referentiels";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: MEDICAMENTS_MTA_CERTIFIES.length,
    tutelle: "Agence Nationale du Médicament et de la Pharmacopée (Bénin)",
    data: MEDICAMENTS_MTA_CERTIFIES,
  });
}
