import { NextRequest, NextResponse } from "next/server";
import { CAMPAGNES_REF } from "@/data/referentiels";
import { CampagneDon } from "@/lib/types";

let localCampagnes: CampagneDon[] = [...CAMPAGNES_REF];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const commune = searchParams.get("commune");
  const statut = searchParams.get("statut");

  let list = [...localCampagnes];
  if (commune) {
    list = list.filter((c) => c.commune.toLowerCase() === commune.toLowerCase());
  }
  if (statut) {
    list = list.filter((c) => c.statut.toUpperCase() === statut.toUpperCase());
  }

  return NextResponse.json({
    success: true,
    total: list.length,
    data: list,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titre, description, etablissementOrganisateur, commune, departement, lieuCollecte, lat, lng, dateDebut, dateFin, objectifPoches } = body;

    if (!titre || !commune || !objectifPoches) {
      return NextResponse.json(
        { success: false, error: "Titre, commune et objectifPoches sont requis" },
        { status: 400 }
      );
    }

    const codeCampagne = `CAMP-2026-${commune.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newCampagne: CampagneDon = {
      id: `camp-${Date.now()}`,
      codeCampagne,
      titre,
      description: description || "Campagne de collecte mobile",
      etablissementOrganisateur: etablissementOrganisateur || "Banque Nationale de Sang",
      commune,
      departement: departement || "Borgou",
      lieuCollecte: lieuCollecte || `Mairie de ${commune}`,
      lat: Number(lat) || 9.33,
      lng: Number(lng) || 2.63,
      dateDebut: dateDebut || new Date().toISOString().split("T")[0],
      dateFin: dateFin || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      objectifPoches: Number(objectifPoches),
      pochesCollectees: 0,
      statut: "PLANIFIEE",
    };

    localCampagnes.unshift(newCampagne);

    return NextResponse.json({
      success: true,
      message: `Campagne ${newCampagne.codeCampagne} créée avec succès`,
      data: newCampagne,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
