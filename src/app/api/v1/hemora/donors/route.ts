import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";
import { dbStore } from "@/db/client";
import { DonneurHemora } from "@/lib/types";
import { buildProfileHash } from "@/lib/crypto";
import { isEligibleDelai60Jours } from "@/lib/haversine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const npi = searchParams.get("npi")?.trim().toUpperCase();

  try {
    if (npi) {
      const [donneurDb] = await db
        .select()
        .from(schema.donneursHemora)
        .where(eq(schema.donneursHemora.npi, npi));

      if (donneurDb) {
        const { eligible, joursRestants } = isEligibleDelai60Jours(donneurDb.dateDernierDon ?? undefined);
        return NextResponse.json({
          success: true,
          source: "NEON_POSTGRESQL",
          data: {
            ...donneurDb,
            eligibleDelai: eligible,
            joursRestantsAvantEligibilite: joursRestants,
            carteQrPayload: `https://gbe.sante.gouv.bj/hemora/card/${donneurDb.profileHash}`,
          },
        });
      }
    } else {
      const allDonneursDb = await db.select().from(schema.donneursHemora);
      if (allDonneursDb && allDonneursDb.length > 0) {
        const formatted = allDonneursDb.map((d) => {
          const { eligible, joursRestants } = isEligibleDelai60Jours(d.dateDernierDon ?? undefined);
          return {
            ...d,
            eligibleDelai: eligible,
            joursRestantsAvantEligibilite: joursRestants,
          };
        });
        return NextResponse.json({ success: true, source: "NEON_POSTGRESQL", data: formatted });
      }
    }
  } catch {
    // Fallback mémoire
  }

  // Fallback mémoire
  if (npi) {
    const donneur = dbStore.donneursHemora.get(npi);
    if (!donneur) {
      return NextResponse.json({ success: false, error: "Donneur introuvable pour ce NPI" }, { status: 404 });
    }
    const { eligible, joursRestants } = isEligibleDelai60Jours(donneur.dateDernierDon);
    return NextResponse.json({
      success: true,
      source: "IN_MEMORY_FALLBACK",
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

  return NextResponse.json({ success: true, source: "IN_MEMORY_FALLBACK", data: allDonneurs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { npi, nomComplet, groupeSanguin, telephone, commune, lat = 6.3703, lng = 2.4183 } = body;

    const npiClean = (npi || "").trim().toUpperCase();
    const nomClean = (nomComplet || "").trim();
    const groupeClean = (groupeSanguin || "").trim().toUpperCase();
    const telClean = (telephone || "").trim();
    const communeClean = (commune || "").trim();

    if (!npiClean || !nomClean || !groupeClean || !telClean || !communeClean) {
      return NextResponse.json(
        { success: false, error: "npi, nomComplet, groupeSanguin, telephone et commune sont obligatoires" },
        { status: 400 }
      );
    }

    // Génération du hachage salé SHA-256 avec 32 octets de sel (Conformité APDP)
    const { hash: profileHash, salt: selSecret } = buildProfileHash({
      npi: npiClean,
      groupeSanguin: groupeClean,
      dateInscription: new Date().toISOString(),
    });

    try {
      const [existing] = await db
        .select()
        .from(schema.donneursHemora)
        .where(eq(schema.donneursHemora.npi, npiClean));

      if (existing) {
        return NextResponse.json(
          { success: false, error: "Un donneur avec ce NPI est déjà inscrit dans le réseau HEMORA" },
          { status: 409 }
        );
      }

      const [inserted] = await db
        .insert(schema.donneursHemora)
        .values({
          npi: npiClean,
          nomComplet: nomClean,
          groupeSanguin: groupeClean,
          telephone: telClean,
          commune: communeClean,
          lat: Number(lat) || 6.3703,
          lng: Number(lng) || 2.4183,
          selSecret,
          profileHash,
          nombreDonsValides: 0,
          disponiblePourUrgence: true,
          soldeDefraiementFcfa: 0,
        })
        .returning();

      // Synchronisation mémoire
      const memDonneur: DonneurHemora = {
        id: `don-${inserted.id}`,
        npi: inserted.npi,
        nomComplet: inserted.nomComplet,
        groupeSanguin: inserted.groupeSanguin as any,
        telephone: inserted.telephone,
        commune: inserted.commune,
        lat: inserted.lat,
        lng: inserted.lng,
        selSecret: inserted.selSecret,
        profileHash: inserted.profileHash,
        nombreDonsValides: inserted.nombreDonsValides,
        disponiblePourUrgence: inserted.disponiblePourUrgence,
        soldeDefraiementFcfa: inserted.soldeDefraiementFcfa,
      };
      dbStore.donneursHemora.set(npiClean, memDonneur);

      return NextResponse.json(
        {
          success: true,
          message: "Donneur bénévole inscrit au réseau HEMORA avec profil salé SHA-256 scellé.",
          data: inserted,
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      if (dbErr.code === "23505") {
        return NextResponse.json(
          { success: false, error: "Un donneur avec ce NPI est déjà inscrit dans le réseau HEMORA" },
          { status: 409 }
        );
      }
      throw dbErr;
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
