import { describe, it, expect } from "vitest";
import { GET as getCampaigns, POST as postCampaign } from "@/app/api/v1/hemora/campaigns/route";
import { GET as getTransfers, POST as postTransfer } from "@/app/api/v1/hemora/transfers/route";
import { GET as getCards, POST as postCard } from "@/app/api/v1/hemora/card-requests/route";
import { GET as verifyHash } from "@/app/api/v1/hemora/verify/route";
import { GET as getPoints, POST as postPoints } from "@/app/api/v1/hemora/points/route";
import { GET as getEmergencies, POST as postEmergency } from "@/app/api/v1/hemora/emergencies/route";
import { NextRequest } from "next/server";

describe("Refonte Complète BMM (HEMORA) - Tests d'Intégration", () => {
  it("doit lister les campagnes de don et permettre la création d'une collecte mobile", async () => {
    // 1. Lister les campagnes
    const reqList = new NextRequest("http://localhost:3000/api/v1/hemora/campaigns");
    const resList = await getCampaigns(reqList);
    const jsonList = await resList.json();
    expect(jsonList.success).toBe(true);
    expect(jsonList.data.length).toBeGreaterThanOrEqual(3);

    // 2. Créer une nouvelle campagne
    const reqCreate = new NextRequest("http://localhost:3000/api/v1/hemora/campaigns", {
      method: "POST",
      body: JSON.stringify({
        titre: "Collecte Spéciale Jeunesse Cotonou",
        commune: "Cotonou",
        departement: "Littoral",
        lieuCollecte: "Stade de l'Amitié Général Mathieu Kérékou",
        objectifPoches: 200,
      }),
    });
    const resCreate = await postCampaign(reqCreate);
    const jsonCreate = await resCreate.json();
    expect(jsonCreate.success).toBe(true);
    expect(jsonCreate.data.codeCampagne).toContain("CAMP-2026-COT");
    expect(jsonCreate.data.objectifPoches).toBe(200);
  });

  it("doit enregistrer un transfert de poches de sang entre établissements de santé", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/hemora/transfers", {
      method: "POST",
      body: JSON.stringify({
        sourceHopital: "CNHU-HKM (Cotonou)",
        destinationHopital: "CHIC (Calavi)",
        groupeSanguin: "O-",
        quantitePoches: 3,
        urgenceLevel: "VITALE",
      }),
    });
    const res = await postTransfer(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.statut).toBe("EN_TRANSIT");
    expect(json.data.quantitePoches).toBe(3);

    // Vérifier la liste des transferts
    const listRes = await getTransfers();
    const listJson = await listRes.json();
    expect(listJson.success).toBe(true);
    expect(listJson.data.some((t: any) => t.sourceHopital === "CNHU-HKM (Cotonou)")).toBe(true);
  });

  it("doit enregistrer une demande de carte physique QR pour un donneur", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/hemora/card-requests", {
      method: "POST",
      body: JSON.stringify({
        donneurNpi: "2026-KAL-4412-KOR",
        communeLivraison: "Kalalé",
      }),
    });
    const res = await postCard(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.donneurNom).toBe("Kora BIAOU");
    expect(json.data.statut).toBe("EN_ATTENTE");
    expect(json.data.qrCodeData).toContain("2026-KAL-4412-KOR");
  });

  it("doit vérifier publiquement l'authenticité d'un donneur par son empreinte cryptographique APDP / OTS", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/v1/hemora/verify?hash=0xd4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3"
    );
    const res = await verifyHash(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.valide).toBe(true);
    expect(json.data.groupeSanguin).toBe("O+");
    expect(json.data.ancrageOpenTimestamps.statut).toBe("VERIFIE_SUR_CHAINE");
    expect(json.data.conformiteApdp.statut).toBe("CONFORME_LOI_2017_20");
  });

  it("doit gérer le grand livre des points civiques, calcul du rang d'honneur et preuves OTS", async () => {
    // 1. Consulter les points d'un donneur
    const reqGet = new NextRequest("http://localhost:3000/api/v1/hemora/points?npi=2026-COT-3310-MAT");
    const resGet = await getPoints(reqGet);
    const jsonGet = await resGet.json();
    expect(jsonGet.success).toBe(true);
    expect(jsonGet.totalPoints).toBeGreaterThanOrEqual(0);
    expect(["BRONZE", "ARGENT", "OR", "PLATINE"]).toContain(jsonGet.tier);

    // 2. Attribuer des points avec preuve OTS
    const reqPost = new NextRequest("http://localhost:3000/api/v1/hemora/points", {
      method: "POST",
      body: JSON.stringify({
        donneurNpi: "2026-COT-3310-MAT",
        action: "AWARD",
        points: 50,
        motif: "Participation don d'urgence CNHU",
      }),
    });
    const resPost = await postPoints(reqPost);
    const jsonPost = await resPost.json();
    expect(jsonPost.success).toBe(true);
    expect(jsonPost.transaction.otsProof).toContain("OTS-PROOF-POINTS");
    expect(jsonPost.transaction.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it("doit déclarer une urgence transfusionnelle hospitalière et cibler les donneurs les plus proches", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/hemora/emergencies", {
      method: "POST",
      body: JSON.stringify({
        hopitalNom: "Hôpital de Zone de Tanguiéta",
        commune: "Tanguiéta",
        lat: 10.6167,
        lng: 1.2667,
        groupeRequis: "O+",
        pochesRequises: 4,
      }),
    });
    const res = await postEmergency(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.emergency.statut).toBe("OUVERTE");
    expect(json.emergency.groupeRequis).toBe("O+");
    expect(json.donneursCibles.length).toBeGreaterThan(0);
  });
});

