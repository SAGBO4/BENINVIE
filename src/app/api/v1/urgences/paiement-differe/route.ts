import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientNpi = searchParams.get("patientNpi");

  const dossiers = Array.from(dbStore.dossiersDiffere.values());
  if (patientNpi) {
    const filtered = dossiers.filter((d) => d.patientNpi === patientNpi);
    return NextResponse.json({ success: true, data: filtered });
  }

  return NextResponse.json({ success: true, data: dossiers });
}
