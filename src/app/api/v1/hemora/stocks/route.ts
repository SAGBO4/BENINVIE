import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departement = searchParams.get("departement");

  let stocks = Array.from(dbStore.stocksSang.values());
  if (departement) {
    stocks = stocks.filter((s) => s.departement.toLowerCase() === departement.toLowerCase());
  }

  const analyseRupture = stocks.map((s) => ({
    ...s,
    alerteCritique: s.quantitePoches <= s.seuilAlerte,
    heuresCouvertureEstimees: Math.round(s.quantitePoches * 12), // environ 12h par poche en flux d'urgence
  }));

  return NextResponse.json({
    success: true,
    totalDepots: stocks.length,
    data: analyseRupture,
  });
}
