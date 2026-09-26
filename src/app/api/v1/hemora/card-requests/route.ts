import { NextRequest, NextResponse } from "next/server";
import { DEMANDES_CARTES_REF, DONNEURS_HEMORA_REF } from "@/data/referentiels";
import { DemandeCarte } from "@/lib/types";

let localDemandes: DemandeCarte[] = [...DEMANDES_CARTES_REF];

export async function GET() {
  return NextResponse.json({
    success: true,
    total: localDemandes.length,
    data: localDemandes,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { donneurNpi, communeLivraison } = body;

    if (!donneurNpi) {
      return NextResponse.json(
        { success: false, error: "donneurNpi est requis" },
        { status: 400 }
      );
    }

    const donneur = DONNEURS_HEMORA_REF.find((d) => d.npi === donneurNpi);
    if (!donneur) {
      return NextResponse.json(
        { success: false, error: "Donneur introuvable avec ce NPI" },
        { status: 404 }
      );
    }

    const newDemande: DemandeCarte = {
      id: `req-${Date.now()}`,
      donneurNpi: donneur.npi,
      donneurNom: donneur.nomComplet,
      groupeSanguin: donneur.groupeSanguin,
      communeLivraison: communeLivraison || donneur.commune,
      statut: "EN_ATTENTE",
      qrCodeData: `https://gbe.sante.gouv.bj/v/donor/${donneur.npi}`,
      hashVerification: donneur.profileHash,
      otsProof: `OTS-MERKLE-${donneur.npi.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`,
      dateDemande: new Date().toISOString().split("T")[0],
    };

    localDemandes.unshift(newDemande);

    return NextResponse.json({
      success: true,
      message: `Demande de carte physique enregistrée pour ${donneur.nomComplet}`,
      data: newDemande,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
