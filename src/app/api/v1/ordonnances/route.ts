import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { Ordonnance } from "@/lib/types";
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
      prescripteurNom,
      etablissement,
      typeOrdonnance = "conventionnelle",
      medicaments,
    } = body;

    if (!patientNpi || !prescripteurNpi || !medicaments || !Array.isArray(medicaments)) {
      return NextResponse.json(
        { success: false, error: "patientNpi, prescripteurNpi et medicaments (array) sont obligatoires" },
        { status: 400 }
      );
    }

    const patient = dbStore.patients.get(patientNpi);
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient NPI introuvable" }, { status: 404 });
    }

    const code = `ORD-2026-${patient.commune.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const dateEmission = new Date().toISOString().split("T")[0];
    const qrPayload = `https://gbe.sante.gouv.bj/v/${code}`;
    const empreinteHash = computeOrdonnanceHash(code, patientNpi, prescripteurNpi, dateEmission);

    const nouvelleOrdonnance: Ordonnance = {
      id: `ord-${Date.now()}`,
      code,
      patientNpi,
      prescripteurNpi,
      prescripteurNom: prescripteurNom || "Praticien Accrédité",
      etablissement: etablissement || "Formation Sanitaire Nationale",
      typeOrdonnance,
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
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
