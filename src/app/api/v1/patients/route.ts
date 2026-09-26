import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { Patient } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const npi = searchParams.get("npi");
  const q = searchParams.get("q")?.toLowerCase();

  if (npi) {
    const patient = dbStore.patients.get(npi);
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient introuvable pour ce NPI" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: patient });
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
    if (!body.npi || !body.nom || !body.prenom || !body.commune) {
      return NextResponse.json(
        { success: false, error: "NPI, nom, prénom et commune sont obligatoires" },
        { status: 400 }
      );
    }

    if (dbStore.patients.has(body.npi)) {
      return NextResponse.json(
        { success: false, error: "Un patient avec ce NPI existe déjà" },
        { status: 409 }
      );
    }

    const nouveauPatient: Patient = {
      id: `pat-${Date.now()}`,
      npi: body.npi,
      nom: body.nom,
      prenom: body.prenom,
      sexe: body.sexe || "F",
      dateNaissance: body.dateNaissance || "1995-01-01",
      commune: body.commune,
      telephone: body.telephone || "+229 01 00 00 00 00",
      groupeSanguin: body.groupeSanguin || "O+",
      allergies: body.allergies || [],
      estEnceinte: Boolean(body.estEnceinte),
      semaineAmenorrhee: body.semaineAmenorrhee,
      statutArch: body.statutArch || "actif",
      numeroArch: body.numeroArch || `ARCH-BENIN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      creeLe: new Date().toISOString(),
    };

    dbStore.patients.set(nouveauPatient.npi, nouveauPatient);

    return NextResponse.json({ success: true, data: nouveauPatient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
