import { NextRequest, NextResponse } from "next/server";
import { ETABLISSEMENTS_REF } from "@/data/referentiels";
import { COMMUNES_BENIN, POLES_DEVELOPPEMENT_BENIN, getPoleForCommune, getCommunesByPole } from "@/data/communes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departement = searchParams.get("departement");
  const commune = searchParams.get("commune");
  const pole = searchParams.get("pole");

  // Enrichir chaque établissement avec son pôle territorial
  let etablissements = ETABLISSEMENTS_REF.map((e) => {
    const poleInfo = getPoleForCommune(e.commune);
    return {
      ...e,
      poleNom: poleInfo.nom,
      poleId: poleInfo.id,
      poleCouleur: poleInfo.couleur,
    };
  });

  if (pole) {
    const poleCommunes = getCommunesByPole(pole).map((c) => c.nom.toLowerCase());
    etablissements = etablissements.filter(
      (e) =>
        e.poleId.toLowerCase() === pole.toLowerCase() ||
        e.poleNom.toLowerCase() === pole.toLowerCase() ||
        poleCommunes.includes(e.commune.toLowerCase())
    );
  }

  if (departement) {
    etablissements = etablissements.filter((e) => e.departement.toLowerCase() === departement.toLowerCase());
  }

  if (commune) {
    etablissements = etablissements.filter((e) => e.commune.toLowerCase() === commune.toLowerCase());
  }

  // Statistiques agrégées par pôle de développement
  const polesStats = POLES_DEVELOPPEMENT_BENIN.map((p) => {
    const pCommunes = p.communes.map((c) => c.toLowerCase());
    const etabsInPole = ETABLISSEMENTS_REF.filter((e) => pCommunes.includes(e.commune.toLowerCase()));
    return {
      id: p.id,
      nom: p.nom,
      description: p.description,
      couleur: p.couleur,
      chefLieu: p.chefLieu,
      communesCount: p.communes.length,
      etablissementsCount: etabsInPole.length,
      capaciteTotaleLits: etabsInPole.reduce((acc, curr) => acc + (curr.capaciteLits || 0), 0),
      communes: p.communes,
      lat: p.lat,
      lng: p.lng,
      zoom: p.zoom,
    };
  });

  return NextResponse.json({
    success: true,
    cadreTerritorial: "06 Pôles de Développement Territorial du Bénin (SNAT 2026)",
    totalCommunes: COMMUNES_BENIN.length,
    totalPoles: POLES_DEVELOPPEMENT_BENIN.length,
    totalEtablissements: etablissements.length,
    source: "Cartographie Nationale IASO Santé Bénin & SIG Ministère de la Santé",
    poles: polesStats,
    data: etablissements,
  });
}
