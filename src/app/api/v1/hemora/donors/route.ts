import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { DonneurHemora } from "@/lib/types";
import { buildProfileHash } from "@/lib/crypto";
import { isEligibleDelai60Jours } from "@/lib/haversine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const npi = searchParams.get("npi");

  if (npi) {
    const donneur = dbStore.donneursHemora.get(npi);
    if (!donneur) {
      return NextResponse.json({ success: false, error: "Donneur introuvable pour ce NPI" }, { status: 404 });
    }
    const { eligible, joursRestants } = isEligibleDelai60Jours(donneur.dateDernierDon);
    return NextResponse.json({
      success: true,
      data: {
        ...donneur,
        eligibleDelai: eligible,
        joursRestantsAvantEligibilite: joursRestants,
        carteQrPayload: `https://gbe.sante.gouv.bj/hemora/card/${donneur.profileHash}`,
      },
    });
  }

  const allDonneurs = Array.from(dbStore.donneursHemora.values()).map((d) => {
    const { eligible, joursRestants } = isEligibleDelai60Jours(d.dateDernierDon);
    return {
      ...d,
      eligibleDelai: eligible,
      joursRestantsAvantEligibilite: joursRestants,
    };
  });

  return NextResponse.json({ success: true, data: allDonneurs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { npi, nomComplet, groupeSanguin, telephone, commune, lat = 6.3703, lng = 2.4183 } = body;

    if (!npi || !nomComplet || !groupeSanguin || !telephone || !commune) {
      return NextResponse.json(
        { success: false, error: "npi, nomComplet, groupeSanguin, telephone et commune sont obligatoires" },
        { status: 400 }
      );
    }

    if (dbStore.donneursHemora.has(npi)) {
      return NextResponse.json(
        { success: false, error: "Un donneur avec ce NPI est déjà inscrit dans le réseau HEMORA" },
        { status: 409 }
      );
    }

    // Génération du hachage salé SHA-256 avec 32 octets de sel (Conformité APDP)
    const { hash: profileHash, salt: selSecret } = buildProfileHash({
      npi,
      groupeSanguin,
      dateInscription: new Date().toISOString(),
    });

    const nouveauDonneur: DonneurHemora = {
      id: `don-${Date.now()}`,
      npi,
      nomComplet,
      groupeSanguin,
      telephone,
      commune,
      lat,
      lng,
      selSecret,
      profileHash,
      nombreDonsValides: 0,
      disponiblePourUrgence: true,
      soldeDefraiementFcfa: 0,
    };

    dbStore.donneursHemora.set(npi, nouveauDonneur);

    return NextResponse.json({
      success: true,
      message: "Donneur bénévole inscrit au réseau HEMORA avec profil salé SHA-256 scellé.",
      data: nouveauDonneur,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
