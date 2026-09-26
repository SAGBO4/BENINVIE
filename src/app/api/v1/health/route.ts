import { NextResponse } from "next/server";
import { dbStore } from "@/db/client";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Gbɛ (BENINVIE) — Plateforme Nationale de Santé",
    version: "1.0.0",
    simulationMode: true,
    data: {
      patientsCount: dbStore.patients.size,
      etablissementsCount: dbStore.etablissements.size,
      soignantsCount: dbStore.soignants.size,
      donneursHemoraCount: dbStore.donneursHemora.size,
      urgencesCount: dbStore.urgencesTransfusion.size,
      auditLogsCount: dbStore.auditLogs.length,
    },
    timestamp: new Date().toISOString(),
  });
}
