import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { CourseZemidjan } from "@/lib/types";

export async function GET() {
  const courses = Array.from(dbStore.coursesZemidjans.values());
  return NextResponse.json({ success: true, data: courses });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patienteNpi, patienteNom, commune, centreDestination } = body;

    if (!patienteNpi || !patienteNom || !commune) {
      return NextResponse.json(
        { success: false, error: "patienteNpi, patienteNom et commune sont requis" },
        { status: 400 }
      );
    }

    const codeCourse = `ZEM-2026-${commune.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const course: CourseZemidjan = {
      id: `crs-${Date.now()}`,
      codeCourse,
      patienteNpi,
      patienteNom,
      conducteurNom: "Salifou TCHABI (Conducteur Agréé Réseau Urgence)",
      conducteurTelephone: "+229 01 97 12 34 56",
      commune,
      centreSanteDestination: centreDestination || "Maternité de Kalalé",
      statut: "ALERTE_RECUE",
      forfaitFcfa: 3000,
      dateAlerte: new Date().toISOString(),
    };

    dbStore.coursesZemidjans.set(codeCourse, course);

    return NextResponse.json({
      success: true,
      message: "Conducteur d'urgence alerté avec succès. Prise en charge en cours.",
      data: course,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
