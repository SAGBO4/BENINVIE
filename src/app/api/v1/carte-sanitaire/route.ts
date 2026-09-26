import { NextRequest, NextResponse } from "next/server";
import { ETABLISSEMENTS_REF } from "@/data/referentiels";
import { COMMUNES_BENIN } from "@/data/communes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departement = searchParams.get("departement");
  const commune = searchParams.get("commune");

  let etablissements = [...ETABLISSEMENTS_REF];

  if (departement) {
    etablissements = etablissements.filter((e) => e.departement.toLowerCase() === departement.toLowerCase());
  }

  if (commune) {
    etablissements = etablissements.filter((e) => e.commune.toLowerCase() === commune.toLowerCase());
  }

  return NextResponse.json({
    success: true,
    totalCommunes: COMMUNES_BENIN.length,
    totalEtablissements: etablissements.length,
    source: "Cartographie Nationale IASO Santé Bénin (77 communes)",
    data: etablissements,
  });
}
