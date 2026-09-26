"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NationalShowcase } from "@/components/marketing/NationalShowcase";
import { NationalDashboard } from "@/components/dashboard/NationalDashboard";
import { DonorPortal } from "@/components/donor/DonorPortal";
import { InteractiveScenarioKalale } from "@/components/scenario/InteractiveScenarioKalale";
import { EmergencyBrisDeGlace } from "@/components/emergencies/EmergencyBrisDeGlace";
import { PharmacopeeCatalog } from "@/components/pharmacopee/PharmacopeeCatalog";
import { MobileMoneyModal } from "@/components/simulators/MobileMoneyModal";
import {
  Patient,
  Ordonnance,
  DonneurHemora,
  StockSang,
  AuditLog,
  CampagneDon,
  TransfertSang,
  PointTransaction,
} from "@/lib/types";
import { SimulatedSmsResult } from "@/lib/simulation";

export default function GbEMainPage() {
  // Onglet actif : vitrine par défaut
  const [activeTab, setActiveTab] = useState("vitrine");

  // Données chargées depuis l'API
  const [patient, setPatient] = useState<Patient | null>(null);
  const [ordonnance, setOrdonnance] = useState<Ordonnance | null>(null);
  const [donneurs, setDonneurs] = useState<DonneurHemora[]>([]);
  const [stocks, setStocks] = useState<StockSang[]>([]);
  const [campagnes, setCampagnes] = useState<CampagneDon[]>([]);
  const [transferts, setTransferts] = useState<TransfertSang[]>([]);
  const [pointsTransactions, setPointsTransactions] = useState<PointTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<SimulatedSmsResult[]>([]);

  // Modale Simulateur Mobile Money
  const [momoOpen, setMomoOpen] = useState(false);
  const [momoParams, setMomoParams] = useState({
    montant: 2000,
    motif: "Défraiement Transport Donneur HEMORA",
    telephone: "+229 01 97 00 12 34",
  });

  // Scénario Bio à Kalalé
  const [currentStep, setCurrentStep] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);
  const [scenarioMessage, setScenarioMessage] = useState<string | null>(null);

  // État Bris de Glace & Matching
  const [brisDeGlaceActive, setBrisDeGlaceActive] = useState(false);
  const [brisDeGlaceData, setBrisDeGlaceData] = useState<any>(null);
  const [matchingResults, setMatchingResults] = useState<any[]>([]);

  // Rafraîchissement global des données
  const refreshData = async () => {
    try {
      const [patRes, ordRes, donRes, stRes, audRes, smsRes, campRes, trfRes, ptsRes] =
        await Promise.all([
          fetch("/api/v1/patients?npi=2026-KAL-9821-BIO").then((r) => r.json()),
          fetch("/api/v1/ordonnances?code=ORD-2026-KAL-042").then((r) => r.json()),
          fetch("/api/v1/hemora/donors").then((r) => r.json()),
          fetch("/api/v1/hemora/stocks").then((r) => r.json()),
          fetch("/api/v1/audit-logs").then((r) => r.json()),
          fetch("/api/v1/simulation/sms").then((r) => r.json()),
          fetch("/api/v1/hemora/campaigns").then((r) => r.json()),
          fetch("/api/v1/hemora/transfers").then((r) => r.json()),
          fetch("/api/v1/hemora/points").then((r) => r.json()),
        ]);

      if (patRes?.data) setPatient(patRes.data);
      if (ordRes?.data) setOrdonnance(ordRes.data);
      if (donRes?.data) setDonneurs(donRes.data);
      if (stRes?.data) setStocks(stRes.data);
      if (campRes?.data) setCampagnes(campRes.data);
      if (trfRes?.data) setTransferts(trfRes.data);
      if (ptsRes?.data) setPointsTransactions(ptsRes.data);
      if (audRes?.data) setAuditLogs(audRes.data);
      if (smsRes?.data) setSmsLogs(smsRes.data);
    } catch (e) {
      console.error("Erreur de chargement des données :", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Déroulement pas-à-pas du Scénario Bio à Kalalé
  const handleNextStep = async () => {
    setStepLoading(true);
    setScenarioMessage(null);

    try {
      if (currentStep === 1) {
        setScenarioMessage(
          "✅ Étape 1 validée : L'Agent Communautaire Ousmane Yarou a enregistré la visite prénatale à domicile à Basso (Kalalé). Carte QR remise."
        );
        setCurrentStep(2);
      } else if (currentStep === 2) {
        const res = await fetch("/api/v1/simulation/sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telephone: patient?.telephone || "+229 01 97 00 12 34",
            message:
              "Gbɛ Santé : Fofo Bio ! CPN3 waasi gari Kalalé CSC suba. Munissez-vous de votre carte QR.",
            langue: "bariba",
          }),
        });
        const data = await res.json();
        if (data.data) {
          setSmsLogs((prev) => [data.data, ...prev]);
        }
        setScenarioMessage(
          "✅ Étape 2 validée : Notification SMS et message vocal en langue Bariba reçus avec succès."
        );
        setCurrentStep(3);
      } else if (currentStep === 3) {
        setScenarioMessage(
          "✅ Étape 3 validée : Consultation effectuée par Dr Tossou & SF Amina. Ordonnance sécurisée émise avec QR code infalsifiable."
        );
        setCurrentStep(4);
      } else if (currentStep === 4) {
        const res = await fetch("/api/v1/ordonnances/delivrer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: "ORD-2026-KAL-042",
            pharmacieNom: "Pharmacie Communale de Kalalé",
          }),
        });
        const data = await res.json();
        if (data.success) {
          setOrdonnance(data.data);
          setScenarioMessage(
            "✅ Étape 4 validée : Ordonnance délivrée sans reste à charge (couverte à 100% par ARCH). Usage unique scellé en base."
          );
          setCurrentStep(5);
        } else {
          setScenarioMessage(`⚠️ ${data.error}`);
        }
      } else if (currentStep === 5) {
        const res = await fetch("/api/v1/transfers/fleches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientNpi: "2026-KAL-9821-BIO",
            typeSoin: "Consultation Prénatale (CPN3)",
            montantFcfa: 5000,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setScenarioMessage(
            "✅ Étape 5 validée : Transfert de 5 000 FCFA versé par Mobile Money à Bio pour incitation nutritionnelle (GBESSOKE)."
          );
          setCurrentStep(6);
        }
      } else if (currentStep === 6) {
        const res = await fetch("/api/v1/encounters/bris-de-glace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientNpi: "2026-KAL-9821-BIO",
            praticienNpi: "NPI-MED-2026-0042",
            praticienNom: "Dr. Emmanuel Tossou",
            etablissementNom: "Hôpital de Zone de Nikki",
            motifUrgence: "Hémorragie obstétricale aiguë de la délivrance post-partum",
          }),
        });
        const data = await res.json();
        if (data.success) {
          setBrisDeGlaceActive(true);
          setBrisDeGlaceData(data.profilVital);

          await fetch("/api/v1/urgences/admission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientNpi: "2026-KAL-9821-BIO",
              motifUrgence: "Hémorragie obstétricale aiguë de la délivrance",
              montantTotalFcfa: 85000,
            }),
          });

          setScenarioMessage(
            "✅ Étape 6 validée : Mode Bris de Glace activé et tracé. Admission immédiate sans avance financière, prise en charge garantie par l'État."
          );
          setCurrentStep(7);
        }
      } else if (currentStep === 7) {
        const res = await fetch(
          "/api/v1/hemora/matching?lat=9.9400&lng=3.2108&groupe=O+"
        );
        const data = await res.json();
        if (data.success && data.data) {
          setMatchingResults(data.data);
          const topDonneur = data.data[0];

          if (topDonneur) {
            await fetch("/api/v1/hemora/donations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                donneurNpi: topDonneur.donneur.npi,
                etablissementId: "etab-hz-nikki-01",
                typeDon: "PRELEVEMENT_REUSSI",
              }),
            });
          }

          setScenarioMessage(
            `🎉 Félicitations ! Scénario complet achevé avec succès. 2 poches de sang O+ mobilisées pour Bio. Donneur ${topDonneur?.donneur.nomComplet} indemnisé de 2 000 FCFA en Mobile Money. Preuve Bitcoin OTS générée.`
          );
        }
      }
      refreshData();
    } catch (e: any) {
      setScenarioMessage(`Erreur : ${e.message}`);
    } finally {
      setStepLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div>
        {/* Navigation & En-tête Supérieur */}
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Conteneur Principal */}
        <main className="mx-auto max-w-7xl px-4 py-6">
          {/* ONGLET 1 : VITRINE & PRÉSENTATION NATIONALE */}
          {activeTab === "vitrine" && (
            <NationalShowcase onNavigateToTab={(t) => setActiveTab(t)} />
          )}

          {/* ONGLET 2 : TABLEAU DE BORD HOSPITALIER & RÉGULATION TRANSFUSIONNELLE */}
          {activeTab === "dashboard" && (
            <NationalDashboard
              stocks={stocks}
              transferts={transferts}
              campagnes={campagnes}
              donneurs={donneurs}
              onTriggerTransfer={async (sourceHopital, grp) => {
                await fetch("/api/v1/hemora/transfers", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sourceHopital: "CHIC (Calavi)",
                    destinationHopital: sourceHopital,
                    groupeSanguin: grp,
                    quantitePoches: 3,
                    urgenceLevel: "VITALE",
                  }),
                });
                refreshData();
              }}
              onNewTransfer={async (data) => {
                await fetch("/api/v1/hemora/transfers", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                refreshData();
              }}
              onAddCampaign={async () => {
                await fetch("/api/v1/hemora/campaigns", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    titre: "Collecte de Proximité Grand Nord",
                    commune: "Kalalé",
                    departement: "Borgou",
                    lieuCollecte: "Place du Marché de Basso",
                    objectifPoches: 150,
                  }),
                });
                refreshData();
              }}
              onTriggerMobileMoney={(donneur) => {
                setMomoParams({
                  montant: 2000,
                  motif: `Défraiement Transport Don Sang HEMORA (${donneur.groupeSanguin})`,
                  telephone: donneur.telephone,
                });
                setMomoOpen(true);
              }}
              onBroadcastSms={async (donneursList, hopital) => {
                for (const d of donneursList) {
                  await fetch("/api/v1/simulation/sms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      telephone: d.telephone,
                      message: `URGENCE VITALE HEMORA : Besoin immédiat de sang ${d.groupeSanguin} à ${hopital}. Défraiement transport 2 000 F garanti.`,
                    }),
                  });
                }
                refreshData();
              }}
              onBroadcastCall={async (donneursList, hopital) => {
                for (const d of donneursList) {
                  await fetch("/api/v1/simulation/ivr", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      telephone: d.telephone,
                      langue: "bariba",
                      messageVocal: `Alerte transfusionnelle ${hopital}`,
                    }),
                  });
                }
                refreshData();
              }}
            />
          )}

          {/* ONGLET 3 : SCÉNARIO OFFICIEL DE VALIDATION (BIO À KALALÉ) */}
          {activeTab === "scenario" && (
            <InteractiveScenarioKalale
              currentStep={currentStep}
              stepLoading={stepLoading}
              scenarioMessage={scenarioMessage}
              brisDeGlaceActive={brisDeGlaceActive}
              brisDeGlaceData={brisDeGlaceData}
              matchingResults={matchingResults}
              smsLogs={smsLogs}
              onNextStep={handleNextStep}
            />
          )}

          {/* ONGLET 4 : ESPACE DONNEUR & CARTES QR CERTIFIÉES */}
          {activeTab === "donneur" && (
            <DonorPortal
              donneurs={donneurs}
              pointsTransactions={pointsTransactions}
              onOrderCard={async (npi, commune) => {
                await fetch("/api/v1/hemora/card-requests", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ donneurNpi: npi, communeLivraison: commune }),
                });
                refreshData();
              }}
              onTriggerMobileMoney={(donneur) => {
                setMomoParams({
                  montant: 2000,
                  motif: `Retrait Défraiement Donneur (${donneur.nomComplet})`,
                  telephone: donneur.telephone,
                });
                setMomoOpen(true);
              }}
              onRedeemPoints={async (pts, motif) => {
                await fetch("/api/v1/hemora/points", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    donneurNpi: "2026-COT-3310-MAT",
                    action: "REDEEM",
                    points: pts,
                    motif,
                  }),
                });
                refreshData();
              }}
            />
          )}

          {/* ONGLET 5 : URGENCES VITALES & PAIEMENT DIFFÉRÉ */}
          {activeTab === "urgences" && (
            <EmergencyBrisDeGlace
              brisDeGlaceActive={brisDeGlaceActive}
              brisDeGlaceData={brisDeGlaceData}
              onTriggerBrisDeGlace={() => {
                fetch("/api/v1/encounters/bris-de-glace", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    patientNpi: "2026-KAL-9821-BIO",
                    praticienNpi: "NPI-MED-2026-0042",
                    praticienNom: "Dr. Emmanuel Tossou",
                    motifUrgence: "Urgence vitale polytraumatisé / choc hémorragique",
                  }),
                })
                  .then((r) => r.json())
                  .then((d) => {
                    setBrisDeGlaceActive(true);
                    setBrisDeGlaceData(d.profilVital);
                    refreshData();
                  });
              }}
              onOpenMobileMoney={(montant, motif) => {
                setMomoParams({
                  montant,
                  motif,
                  telephone: "+229 01 97 00 12 34",
                });
                setMomoOpen(true);
              }}
            />
          )}

          {/* ONGLET 6 : PHARMACOPÉE TRADITIONNELLE ARS (MTA) */}
          {activeTab === "pharmacopee" && <PharmacopeeCatalog />}
        </main>
      </div>

      {/* Footer Officiel de Marque */}
      <Footer />

      {/* Modale Simulateur Mobile Money MTN/Moov */}
      <MobileMoneyModal
        isOpen={momoOpen}
        onClose={() => setMomoOpen(false)}
        montantDefault={momoParams.montant}
        motifDefault={momoParams.motif}
        telephoneDefault={momoParams.telephone}
      />
    </div>
  );
}
