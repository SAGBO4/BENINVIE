import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ success: false, error: "Code ordonnance requis" }, { status: 400 });
  }

  const ord = dbStore.ordonnances.get(code);
  if (!ord) {
    return NextResponse.json({
      success: false,
      valide: false,
      error: "Ordonnance inconnue ou contrefaite",
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    valide: ord.statut === "ACTIVE",
    statut: ord.statut,
    data: ord,
  });
}
