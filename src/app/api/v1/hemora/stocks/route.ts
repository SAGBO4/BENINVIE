import { NextRequest, NextResponse } from "next/server";
import { eq, ilike } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";
import { dbStore } from "@/db/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departement = searchParams.get("departement")?.trim();

  let rawStocks: any[] = [];
  try {
    if (departement) {
      rawStocks = await db
        .select()
        .from(schema.stocksSang)
        .where(ilike(schema.stocksSang.departement, `%${departement}%`));
    } else {
      rawStocks = await db.select().from(schema.stocksSang);
    }
  } catch {
    rawStocks = [];
  }

  const stocks = rawStocks.length > 0 ? rawStocks : Array.from(dbStore.stocksSang.values()).filter((s) => {
    return !departement || s.departement.toLowerCase() === departement.toLowerCase();
  });

  const analyseRupture = stocks.map((s) => ({
    ...s,
    alerteCritique: s.quantitePoches <= s.seuilAlerte,
    heuresCouvertureEstimees: Math.round(s.quantitePoches * 12),
  }));

  return NextResponse.json({
    success: true,
    source: rawStocks.length > 0 ? "NEON_POSTGRESQL" : "IN_MEMORY_FALLBACK",
    totalDepots: stocks.length,
    data: analyseRupture,
  });
}
