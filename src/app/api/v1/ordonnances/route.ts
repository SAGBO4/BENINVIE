import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { Ordonnance, Patient } from "@/lib/types";
import { computeOrdonnanceHash } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const patientNpi = searchParams.get("patientNpi");

  if (code) {
    const ord = dbStore.ordonnances.get(code);
    if (!ord) {
      return NextResponse.json({ success: false, error: "Ordonnance introuvable" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: ord });
  }

  const allOrds = Array.from(dbStore.ordonnances.values());
  if (patientNpi) {
    const filtered = allOrds.filter((o) => o.patientNpi === patientNpi);
    return NextResponse.json({ success: true, data: filtered });
  }

  return NextResponse.json({ success: true, data: allOrds });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientNpi,
      prescripteurNpi,
      praticienNpi,
      prescripteurNom,
      etablissement,
      typeOrdonnance = "conventionnelle",
      typePrescription,
      medicaments,
    } = body;

    const prescripteurFinal = prescripteurNpi || praticienNpi || "MS-MED-2026-004";

    if (!patientNpi || !medicaments || !Array.isArray(medicaments)) {
      return NextResponse.json(
        { success: false, error: "patientNpi et medicaments (array) sont obligatoires" },
        { status: 400 }
      );
    }

    let patient = dbStore.patients.get(patientNpi);
    if (!patient) {
      const fallbackPatient: Patient = {
        id: `pat-${patientNpi.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        npi: patientNpi,
        nom: "SAGBOHAN",
        prenom: "Chantal",
        sexe: "F",
        dateNaissance: "1995-04-12",
        commune: "Kalalé",
        telephone: "+229 97 00 12 34",
        groupeSanguin: "O+",
        allergies: ["Pénicilline"],
        estEnceinte: false,
        statutArch: "actif",
        numeroArch: "ARCH-BENIN-2026-9821",
        creeLe: new Date().toISOString(),
      };
      dbStore.patients.set(patientNpi, fallbackPatient);
      patient = fallbackPatient;
    }

    const patientCommune = patient?.commune || "BEN";
    const code = `ORD-2026-${patientCommune.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const dateEmission = new Date().toISOString().split("T")[0];
    const qrPayload = `https://beninvie.bj/verify?token=${code}`;
    const empreinteHash = computeOrdonnanceHash(code, patientNpi, prescripteurFinal, dateEmission);

    const nouvelleOrdonnance: Ordonnance = {
      id: `ord-${Date.now()}`,
      code,
      patientNpi,
      prescripteurNpi: prescripteurFinal,
      prescripteurNom: prescripteurNom || "Praticien Accrédité",
      etablissement: etablissement || "Formation Sanitaire Nationale",
      typeOrdonnance: (typePrescription || typeOrdonnance) as any,
      medicaments,
      statut: "ACTIVE",
      dateEmission,
      qrPayload,
      empreinteHash,
    };

    dbStore.ordonnances.set(code, nouvelleOrdonnance);

    return NextResponse.json({
      success: true,
      message: "Ordonnance sécurisée émise avec succès. Empreinte cryptographique scellée.",
      data: nouvelleOrdonnance,
      ordonnance: {
        ...nouvelleOrdonnance,
        codeUnique: nouvelleOrdonnance.code,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
