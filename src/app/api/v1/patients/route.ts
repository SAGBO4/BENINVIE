import { NextRequest, NextResponse } from "next/server";
import { eq, ilike, or } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";
import { dbStore } from "@/db/client";
import { Patient } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const npi = searchParams.get("npi")?.trim().toUpperCase();
  const q = searchParams.get("q")?.toLowerCase();

  try {
    if (npi) {
      const [patient] = await db
        .select()
        .from(schema.patients)
        .where(eq(schema.patients.npi, npi));

      if (patient) {
        return NextResponse.json({ success: true, data: patient });
      }

      const memPatient = dbStore.patients.get(npi);
      if (memPatient) {
        return NextResponse.json({ success: true, data: memPatient });
      }

      return NextResponse.json(
        { success: false, error: "Patient introuvable pour ce NPI" },
        { status: 404 }
      );
    }

    let patientsList: any[] = [];
    if (q) {
      patientsList = await db
        .select()
        .from(schema.patients)
        .where(
          or(
            ilike(schema.patients.nom, `%${q}%`),
            ilike(schema.patients.prenom, `%${q}%`),
            ilike(schema.patients.commune, `%${q}%`),
            ilike(schema.patients.npi, `%${q}%`)
          )
        );
    } else {
      patientsList = await db.select().from(schema.patients);
    }

    if (patientsList.length > 0) {
      return NextResponse.json({ success: true, data: patientsList });
    }
  } catch {
    // Repli mémoire si DB momentanément injoignable
  }

  // Fallback mémoire
  if (npi) {
    const memPatient = dbStore.patients.get(npi);
    if (!memPatient) {
      return NextResponse.json({ success: false, error: "Patient introuvable pour ce NPI" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: memPatient });
  }

  const allPatients = Array.from(dbStore.patients.values());
  if (q) {
    const filtered = allPatients.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        p.prenom.toLowerCase().includes(q) ||
        p.commune.toLowerCase().includes(q) ||
        p.npi.toLowerCase().includes(q)
    );
    return NextResponse.json({ success: true, data: filtered });
  }

  return NextResponse.json({ success: true, data: allPatients });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const npiClean = (body.npi || "").trim().toUpperCase();
    const nomClean = (body.nom || "").trim();
    const prenomClean = (body.prenom || "").trim();
    const communeClean = (body.commune || "").trim();

    if (!npiClean || !nomClean || !prenomClean || !communeClean) {
      return NextResponse.json(
        { success: false, error: "NPI, nom, prénom et commune sont obligatoires" },
        { status: 400 }
      );
    }

    try {
      const [existing] = await db
        .select()
        .from(schema.patients)
        .where(eq(schema.patients.npi, npiClean));

      if (existing) {
        return NextResponse.json(
          { success: false, error: "Un patient avec ce NPI existe déjà" },
          { status: 409 }
        );
      }

      const [inserted] = await db
        .insert(schema.patients)
        .values({
          npi: npiClean,
          nom: nomClean,
          prenom: prenomClean,
          sexe: body.sexe || "F",
          dateNaissance: body.dateNaissance || "1995-01-01",
          groupeSanguin: body.groupeSanguin || "O+",
          rhesus: body.rhesus || "+",
          telephone: body.telephone || "+229 01 00 00 00 00",
          commune: communeClean,
          departement: body.departement || "Borgou",
          village: body.village || `${communeClean} Centre`,
          couvertureArch: body.statutArch === "actif" || Boolean(body.couvertureArch),
          statutGrossesse: Boolean(body.estEnceinte || body.statutGrossesse),
          ageGestationnelSemaines: body.semaineAmenorrhee ?? null,
        })
        .returning();

      // Synchronisation mémoire
      const nouveauPatient: Patient = {
        id: `pat-${inserted.id}`,
        npi: inserted.npi,
        nom: inserted.nom,
        prenom: inserted.prenom,
        sexe: (inserted.sexe === "M" ? "M" : "F"),
        dateNaissance: inserted.dateNaissance,
        commune: inserted.commune,
        telephone: inserted.telephone,
        groupeSanguin: inserted.groupeSanguin as any,
        allergies: body.allergies || [],
        estEnceinte: inserted.statutGrossesse,
        semaineAmenorrhee: inserted.ageGestationnelSemaines ?? undefined,
        statutArch: inserted.couvertureArch ? "actif" : "non_assure",
        numeroArch: body.numeroArch || `ARCH-BENIN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        creeLe: new Date().toISOString(),
      };
      dbStore.patients.set(nouveauPatient.npi, nouveauPatient);

      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    } catch (dbErr: any) {
      if (dbErr.code === "23505") {
        return NextResponse.json(
          { success: false, error: "Un patient avec ce NPI existe déjà" },
          { status: 409 }
        );
      }
      throw dbErr;
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
