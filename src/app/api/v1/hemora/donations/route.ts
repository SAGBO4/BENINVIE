import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { executeSimulatedPayment } from "@/lib/simulation";
import { simulateOpenTimestampsAnchor } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      donneurNpi,
      etablissementId = "etab-hz-nikki-01",
      typeDon = "PRELEVEMENT_REUSSI", // ou "AJOURNEMENT_MEDICAL"
      motifAjournement,
      operateur = "MTN_MOMO",
    } = body;

    if (!donneurNpi) {
      return NextResponse.json({ success: false, error: "donneurNpi requis" }, { status: 400 });
    }

    const donneur = dbStore.donneursHemora.get(donneurNpi);
    if (!donneur) {
      return NextResponse.json({ success: false, error: "Donneur introuvable dans HEMORA" }, { status: 404 });
    }

    const dateAujourdhui = new Date().toISOString().split("T")[0];

    // 1. Règle éthique OMS : Versement systématique du défraiement forfaitaire de transport (2 000 FCFA)
    const defraiementFcfa = 2000;
    const paiement = executeSimulatedPayment({
      operateur,
      telephone: donneur.telephone,
      montantFcfa: defraiementFcfa,
      motif: `Défraiement forfaitaire transport don de sang HEMORA (${typeDon === "PRELEVEMENT_REUSSI" ? "Prélèvement validé" : "Présentation avec ajournement médical"})`,
    });

    dbStore.paymentLogs.unshift(paiement);
    donneur.soldeDefraiementFcfa += defraiementFcfa;

    let stockMisAJour = null;

    if (typeDon === "PRELEVEMENT_REUSSI") {
      donneur.dateDernierDon = dateAujourdhui;
      donneur.nombreDonsValides += 1;

      // Incrémentation du stock correspondant
      for (const stock of dbStore.stocksSang.values()) {
        if (stock.etablissementId === etablissementId && stock.groupe === donneur.groupeSanguin) {
          stock.quantitePoches += 1;
          stock.derniereMiseAJour = new Date().toISOString();
          stockMisAJour = stock;
          break;
        }
      }
    }

    // 2. Ancrage cryptographique OpenTimestamps sur Bitcoin
    const ots = simulateOpenTimestampsAnchor([
      donneur.profileHash,
      dateAujourdhui,
      paiement.referenceTransaction,
    ]);

    // 3. Journalisation d'audit
    dbStore.logAudit({
      action: "DON_SANG_VALIDE",
      acteurNpi: etablissementId,
      acteurNom: "Banque de Sang / Urgentiste",
      role: "banque_sang",
      cibleId: donneur.npi,
      details: {
        typeDon,
        motifAjournement,
        defraiementTransaction: paiement.referenceTransaction,
        montantFcfa: defraiementFcfa,
        otsProof: ots.otsProof,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        typeDon === "PRELEVEMENT_REUSSI"
          ? "Prélèvement validé avec succès. Défraiement forfaitaire versé et stock mis à jour."
          : "Présentation enregistrée. Ajournement médical sans pénalité : défraiement de transport versé conformément à la charte éthique.",
      data: {
        donneur,
        paiementTransport: paiement,
        stockMisAJour,
        preuveBitcoinOTS: ots,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
