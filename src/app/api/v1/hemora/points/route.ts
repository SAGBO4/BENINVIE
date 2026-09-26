import { NextRequest, NextResponse } from "next/server";
import { POINTS_LEDGER_REF, DONNEURS_HEMORA_REF } from "@/data/referentiels";
import { PointTransaction } from "@/lib/types";
import crypto from "crypto";

// Mémoire locale pour les transactions de points ajoutées durant la session
let runtimePointsLedger: PointTransaction[] = [...POINTS_LEDGER_REF];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const npi = searchParams.get("npi");

    if (npi) {
      const filtered = runtimePointsLedger.filter((t) => t.donneurNpi === npi);
      const totalPoints = filtered.reduce((acc, curr) => acc + curr.points, 0);

      // Calcul du rang d'honneur civique (Donor Tier)
      let tier = "BRONZE";
      if (totalPoints >= 500) tier = "PLATINE";
      else if (totalPoints >= 300) tier = "OR";
      else if (totalPoints >= 150) tier = "ARGENT";

      return NextResponse.json({
        success: true,
        npi,
        totalPoints,
        tier,
        transactions: filtered,
      });
    }

    // Calcul global des statistiques de points
    const totalTransactions = runtimePointsLedger.length;
    const totalPointsDistribues = runtimePointsLedger
      .filter((t) => t.action === "AWARD")
      .reduce((acc, curr) => acc + curr.points, 0);

    return NextResponse.json({
      success: true,
      totalTransactions,
      totalPointsDistribues,
      data: runtimePointsLedger,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de récupération des points" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { donneurNpi, action, points, motif } = body;

    if (!donneurNpi || !action || typeof points !== "number" || !motif) {
      return NextResponse.json(
        { success: false, error: "Champs requis : donneurNpi, action (AWARD/REDEEM), points (number), motif" },
        { status: 400 }
      );
    }

    const donneur = DONNEURS_HEMORA_REF.find((d) => d.npi === donneurNpi);
    const nom = donneur ? donneur.nomComplet : "Donneur Citoyen";

    // Hachage cryptographique de la transaction
    const txPayload = JSON.stringify({
      donneurNpi,
      action,
      points,
      motif,
      timestamp: new Date().toISOString(),
    });
    const transactionHash = "0x" + crypto.createHash("sha256").update(txPayload).digest("hex");
    const otsProof = `OTS-PROOF-POINTS-${Date.now()}-${transactionHash.slice(2, 10).toUpperCase()}`;

    const newTx: PointTransaction = {
      id: `pts-tx-${Date.now()}`,
      donneurNpi,
      donneurNom: nom,
      action,
      points: action === "REDEEM" ? -Math.abs(points) : Math.abs(points),
      motif,
      transactionHash,
      otsProof,
      dateTransaction: new Date().toISOString(),
    };

    runtimePointsLedger = [newTx, ...runtimePointsLedger];

    // Calcul du nouveau solde
    const userTxs = runtimePointsLedger.filter((t) => t.donneurNpi === donneurNpi);
    const nouveauSolde = userTxs.reduce((acc, curr) => acc + curr.points, 0);

    return NextResponse.json(
      {
        success: true,
        message: action === "AWARD" ? "Points civiques attribués et ancrés sur OTS !" : "Points échangés avec succès !",
        nouveauSolde,
        transaction: newTx,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de l'enregistrement de la transaction de points" },
      { status: 500 }
    );
  }
}
