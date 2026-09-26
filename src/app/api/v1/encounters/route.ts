import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";
import { dbStore } from "@/db/client";
import { Encounter } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId")?.trim();

  try {
    let encountersDb: any[] = [];
    if (patientId) {
      encountersDb = await db
        .select()
        .from(schema.encounters)
        .where(eq(schema.encounters.patientId, patientId))
        .orderBy(desc(schema.encounters.dateDebut));
    } else {
      encountersDb = await db
        .select()
        .from(schema.encounters)
        .orderBy(desc(schema.encounters.dateDebut))
        .limit(100);
    }

    if (encountersDb.length > 0) {
      return NextResponse.json({
        success: true,
        source: "NEON_POSTGRESQL",
        data: encountersDb,
      });
    }
  } catch {
    // Fallback mémoire
  }

  const encounters = Array.from(dbStore.encounters.values());
  if (patientId) {
    const filtered = encounters.filter((e) => e.patientId === patientId);
    return NextResponse.json({ success: true, source: "IN_MEMORY_FALLBACK", data: filtered });
  }

  return NextResponse.json({ success: true, source: "IN_MEMORY_FALLBACK", data: encounters });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.soignantId || !body.motif) {
      return NextResponse.json(
        { success: false, error: "patientId, soignantId et motif sont obligatoires" },
        { status: 400 }
      );
    }

    try {
      const [inserted] = await db
        .insert(schema.encounters)
        .values({
          patientId: String(body.patientId),
          patientNpi: body.patientNpi || String(body.patientId),
          etablissementId: body.etablissementId || "etab-csc-kalale-01",
          soignantId: String(body.soignantId),
          type: (body.type || "CONSULTATION_GENERALE").toUpperCase(),
          modeAdmission: (body.modeAdmission || "STANDARD").toUpperCase(),
          motif: body.motif,
          diagnostics: body.diagnostic ? { diagnostic: body.diagnostic } : (body.diagnostics || {}),
          observations: body.observations || {},
          statut: "en_cours",
        })
        .returning();

      const encounter: Encounter = {
        id: String(inserted.id),
        patientId: inserted.patientId,
        soignantId: inserted.soignantId,
        etablissementId: inserted.etablissementId,
        type: "consultation" as any,
        motif: inserted.motif,
        diagnostic: body.diagnostic,
        observations: inserted.observations as any,
        modePaiement: "immediat",
        creeLe: new Date().toISOString(),
      };
      dbStore.encounters.set(encounter.id, encounter);

      return NextResponse.json({ success: true, source: "NEON_POSTGRESQL", data: inserted }, { status: 201 });
    } catch {
      // Fallback mémoire
      const encounter: Encounter = {
        id: `enc-${Date.now()}`,
        patientId: body.patientId,
        soignantId: body.soignantId,
        etablissementId: body.etablissementId || "etab-csc-kalale-01",
        type: body.type || "consultation",
        motif: body.motif,
        diagnostic: body.diagnostic,
        observations: body.observations || {},
        modePaiement: body.modePaiement || "immediat",
        creeLe: new Date().toISOString(),
      };
      dbStore.encounters.set(encounter.id, encounter);
      return NextResponse.json({ success: true, source: "IN_MEMORY_FALLBACK", data: encounter }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
