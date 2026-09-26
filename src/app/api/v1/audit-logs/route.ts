import { NextResponse } from "next/server";
import { dbStore } from "@/db/client";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: dbStore.auditLogs.length,
    tutelle: "Journal d'Audit Conforme Code du Numérique (Loi 2017-20) & APDP Bénin",
    data: dbStore.auditLogs,
  });
}
