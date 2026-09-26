import { NextResponse } from "next/server";
import { SOIGNANTS_REF } from "@/data/referentiels";

export async function GET() {
  const tradipraticiens = SOIGNANTS_REF.filter((s) => s.type === "tradipraticien_accredite");

  return NextResponse.json({
    success: true,
    total: tradipraticiens.length,
    tutelle: "Autorité de Régulation du secteur de la Santé (ARS) & Ministère de la Santé du Bénin",
    data: tradipraticiens,
  });
}
