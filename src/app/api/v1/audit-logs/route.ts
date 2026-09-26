import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";
import { dbStore } from "@/db/client";

export async function GET() {
  try {
    const logsDb = await db
      .select()
      .from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.timestamp))
      .limit(100);

    if (logsDb && logsDb.length > 0) {
      return NextResponse.json({
        success: true,
        source: "NEON_POSTGRESQL_IMMUTABLE",
        total: logsDb.length,
        tutelle: "Journal d'Audit Conforme Code du Numérique (Loi 2017-20) & APDP Bénin",
        data: logsDb,
      });
    }
  } catch {
    // Fallback gracieux en mémoire
  }

  return NextResponse.json({
    success: true,
    source: "IN_MEMORY_FALLBACK",
    total: dbStore.auditLogs.length,
    tutelle: "Journal d'Audit Conforme Code du Numérique (Loi 2017-20) & APDP Bénin",
    data: dbStore.auditLogs,
  });
}
