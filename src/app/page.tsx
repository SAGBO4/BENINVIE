"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NationalShowcase } from "@/components/marketing/NationalShowcase";
import { NationalDashboard } from "@/components/dashboard/NationalDashboard";
import { DonorPortal } from "@/components/donor/DonorPortal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MobileMoneyModal } from "@/components/simulators/MobileMoneyModal";
import { SmsDrawer } from "@/components/simulators/SmsDrawer";
import { IvrAudioPlayer } from "@/components/simulators/IvrAudioPlayer";
import {
  Activity,
  ShieldAlert,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Send,
  Lock,
  Leaf,
  Check,
} from "lucide-react";
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
import { MEDICAMENTS_MTA_CERTIFIES } from "@/data/referentiels";

export default function GbEMainPage() {
  // L'onglet par défaut démarre sur la vitrine nationale moderne inspirée de BMM
  const [activeTab, setActiveTab] = useState("vitrine");

  // Données d'état chargées depuis les API
  const [patient, setPatient] = useState<Patient | null>(null);
  const [ordonnance, setOrdonnance] = useState<Ordonnance | null>(null);
  const [donneurs, setDonneurs] = useState<DonneurHemora[]>([]);
  const [stocks, setStocks] = useState<StockSang[]>([]);
  const [campagnes, setCampagnes] = useState<CampagneDon[]>([]);
  const [transferts, setTransferts] = useState<TransfertSang[]>([]);
  const [pointsTransactions, setPointsTransactions] = useState<PointTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<SimulatedSmsResult[]>([]);

  // Simulateur Mobile Money
  const [momoOpen, setMomoOpen] = useState(false);
  const [momoParams, setMomoParams] = useState({
    montant: 2000,
    motif: "Défraiement Transport Donneur HEMORA",
    telephone: "+229 01 97 00 12 34",
  });

  // État du scénario interactif officiel Bio GOUDA à Kalalé
  const [currentStep, setCurrentStep] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);
  const [scenarioMessage, setScenarioMessage] = useState<string | null>(null);

  // État Bris de Glace
  const [brisDeGlaceActive, setBrisDeGlaceActive] = useState(false);
  const [brisDeGlaceData, setBrisDeGlaceData] = useState<any>(null);

  // État Matching HEMORA
  const [matchingResults, setMatchingResults] = useState<any[]>([]);

  // État Triage IA Clinique
  const [triageInput, setTriageInput] = useState(
    "La patiente présente de forts saignements utérins après l'accouchement avec vertiges et pâleur."
  );
  const [triageResult, setTriageResult] = useState<any>(null);

  // Chargement des données au démarrage
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

      if (patRes.data) setPatient(patRes.data);
      if (ordRes.data) setOrdonnance(ordRes.data);
      if (donRes.data) setDonneurs(donRes.data);
      if (stRes.data) setStocks(stRes.data);
      if (campRes.data) setCampagnes(campRes.data);
      if (trfRes.data) setTransferts(trfRes.data);
      if (ptsRes.data) setPointsTransactions(ptsRes.data);
      if (audRes.data) setAuditLogs(audRes.data);
      if (smsRes.data) setSmsLogs(smsRes.data);
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

  const handleRunTriage = async () => {
    try {
      const res = await fetch("/api/v1/triage/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptomes: triageInput, enceinte: true }),
      });
      const data = await res.json();
      if (data.success) {
        setTriageResult(data.data);
      }
    } catch (e) {
      console.error(e);
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
            <div className="space-y-6">
              <Card className="border-emerald-500/30 bg-slate-900/80 shadow-2xl">
                <CardHeader className="border-b border-slate-800 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-600 text-white font-bold text-xs">
                          Scénario Officiel Wadagni - Talata 2026
                        </Badge>
                        <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-950/30 text-xs">
                          Kalalé (Borgou)
                        </Badge>
                      </div>
                      <CardTitle as="h2" className="text-xl sm:text-2xl font-extrabold text-white">
                        🎬 Parcours Intégral de Soins de Bio GOUDA
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-slate-300">
                        Persona : Bio, 28 ans, enceinte de 7 mois (34 SA), village de Basso, commune de Kalalé.
                      </CardDescription>
                    </div>

                    <div className="text-left sm:text-right p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="text-[11px] text-slate-400">Progression du Parcours</p>
                      <p className="font-display text-xl font-bold text-emerald-400">
                        Étape {currentStep} / 7
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Indicateur de Progression 7 Étapes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {[
                      { step: 1, label: "1. Visite ASC Basso" },
                      { step: 2, label: "2. Rappel Bariba" },
                      { step: 3, label: "3. CS Kalalé" },
                      { step: 4, label: "4. Pharmacie ARCH" },
                      { step: 5, label: "5. Prime Gbèssoké" },
                      { step: 6, label: "6. Urgence Nikki" },
                      { step: 7, label: "7. Sang HEMORA" },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                          currentStep > s.step
                            ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300"
                            : currentStep === s.step
                            ? "border-emerald-400 bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-bold scale-102"
                            : "border-slate-800 bg-slate-950/50 text-slate-500"
                        }`}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>

                  {/* Panneau d'action de l'étape courante */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-4">
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-emerald-400" />
                          <span>Étape 1 : Visite communautaire à domicile (PWA Hors-Ligne à Basso)</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          L&apos;Agent Communautaire Ousmane Yarou se rend au domicile de Bio dans le village de Basso. Il renseigne la fiche prénatale hors-ligne et lui remet une carte QR physique de santé imprimée.
                        </p>
                        <Button
                          size="lg"
                          onClick={handleNextStep}
                          disabled={stepLoading}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          {stepLoading ? "Validation en cours..." : "Valider la visite à domicile & Enregistrer la carte QR ➔"}
                        </Button>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Clock className="h-5 w-5 text-amber-400" />
                          <span>Étape 2 : Rappel automatique par SMS et appel vocal en Bariba</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          Le système déclenche un rappel vocal et SMS en langue Bariba pour la Consultation Prénatale (CPN3) prévue demain au Centre de Santé Communal de Kalalé.
                        </p>
                        <IvrAudioPlayer
                          titre="Appel automatisé de rappel CPN3 (Voix Bariba)"
                          langue="Bariba (Kalalé)"
                          transcription="Fofo Bio ! Gbɛ Santé nɔ CPN3 waasi gari Kalalé CSC suba. Munissez-vous de votre carte QR imprimée."
                        />
                        <div className="pt-2">
                          <Button
                            size="lg"
                            onClick={handleNextStep}
                            disabled={stepLoading}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                          >
                            {stepLoading ? "Envoi du rappel..." : "Simuler la réception du rappel Bariba & Continuer ➔"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-cyan-400" />
                          <span>Étape 3 : Consultation au CS Kalalé & Ordonnance Numérique</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          La sage-femme Amina scanne la carte QR de Bio. Les antécédents s&apos;affichent instantanément. Constantes : Tension 11/7, Périmètre brachial 245 mm. Prescription de Fer + Acide Folique et TPI Paludisme.
                        </p>
                        <Button
                          size="lg"
                          onClick={handleNextStep}
                          disabled={stepLoading}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                        >
                          {stepLoading ? "Prescription..." : "Générer l'Ordonnance Sécurisée ORD-2026-KAL-042 ➔"}
                        </Button>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          <span>Étape 4 : Retrait en pharmacie couvert à 100% par ARCH</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          La pharmacie de Kalalé scanne le QR code de l&apos;ordonnance. Éligibilité ARCH confirmée (Reste à charge : 0 FCFA). L&apos;ordonnance passe au statut &quot;DÉLIVRÉE&quot; et son QR code est scellé pour bloquer toute réutilisation.
                        </p>
                        <Button
                          size="lg"
                          onClick={handleNextStep}
                          disabled={stepLoading}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          {stepLoading ? "Validation officine..." : "Scanner & Délivrer les médicaments (Tiers-payant ARCH) ➔"}
                        </Button>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Activity className="h-5 w-5 text-amber-400" />
                          <span>Étape 5 : Transfert monétaire fléché GBESSOKE (5 000 FCFA MoMo)</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          La confirmation médicale de la CPN3 déclenche immédiatement un virement Mobile Money de 5 000 FCFA vers le compte de la famille pour le soutien nutritionnel de la femme enceinte.
                        </p>
                        <Button
                          size="lg"
                          onClick={handleNextStep}
                          disabled={stepLoading}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                        >
                          {stepLoading ? "Versement Mobile Money..." : "Déclencher le versement GBESSOKE (5.000 FCFA) ➔"}
                        </Button>
                      </div>
                    )}

                    {currentStep === 6 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-rose-400">
                          <AlertTriangle className="h-5 w-5" />
                          <h3 className="text-base font-bold text-white">
                            Étape 6 : Urgence obstétricale vitale — Transport & Bris de Glace à Nikki
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          Le jour du travail, survenue d&apos;une hémorragie de la délivrance. Transport d&apos;urgence communautaire vers l&apos;Hôpital de Zone de Nikki. L&apos;urgentiste active le mode <strong>Bris de Glace</strong> (journalisé APDP) et admet Bio avec un <strong>Dossier de Paiement Différé</strong> garanti par l&apos;État (zéro caution exigée).
                        </p>
                        <Button
                          size="lg"
                          variant="destructive"
                          onClick={handleNextStep}
                          disabled={stepLoading}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                        >
                          {stepLoading ? "Activation Bris de Glace..." : "Activer le Bris de Glace & Ouvrir le Paiement Différé ➔"}
                        </Button>
                      </div>
                    )}

                    {currentStep === 7 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                          <HeartHandshake className="h-5 w-5" />
                          <span>Étape 7 : Module HEMORA — Mobilisation de 2 poches O+ & Défraiement</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          Besoin vital urgent : 2 poches de sang O+. Le moteur HEMORA classe les donneurs volontaires les plus proches via la formule de Haversine. Le donneur arrive, donne son sang, reçoit 2 000 FCFA de défraiement Mobile Money, et la preuve OTS est ancrée sur Bitcoin.
                        </p>
                        <Button
                          size="lg"
                          onClick={handleNextStep}
                          disabled={stepLoading}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          {stepLoading ? "Matching et mobilisation..." : "Lancer le Matching HEMORA & Clôturer l'Urgence ➔"}
                        </Button>
                      </div>
                    )}

                    {/* Rétroaction en cas de message */}
                    {scenarioMessage && (
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-medium">
                        {scenarioMessage}
                      </div>
                    )}
                  </div>

                  {/* Rétroaction visuelle Bris de Glace si déverrouillé */}
                  {brisDeGlaceActive && brisDeGlaceData && (
                    <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-rose-300 text-sm flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Profil Vital Déverrouillé en Mode Bris de Glace</span>
                        </span>
                        <Badge variant="destructive">Accès Urgentiste Tracé APDP</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div><strong className="text-slate-400">Patiente :</strong> {brisDeGlaceData.prenom} {brisDeGlaceData.nom}</div>
                        <div><strong className="text-slate-400">Groupe :</strong> <span className="text-rose-400 font-bold">{brisDeGlaceData.groupeSanguin}</span></div>
                        <div><strong className="text-slate-400">Allergies :</strong> {brisDeGlaceData.allergies?.join(", ")}</div>
                        <div><strong className="text-slate-400">N° ARCH :</strong> {brisDeGlaceData.numeroArch}</div>
                      </div>
                    </div>
                  )}

                  {/* Résultats du matching HEMORA */}
                  {matchingResults.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>🩸</span>
                        <span>Donneurs Compatibles Mobilisés par Algorithme Haversine (Nikki / Kalalé)</span>
                      </h4>
                      <div className="space-y-2">
                        {matchingResults.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-white">
                                {m.donneur.nomComplet} ({m.donneur.commune}) — Groupe : <span className="text-rose-400">{m.donneur.groupeSanguin}</span>
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Distance : {m.distanceKm} km • Score Proximité : {m.scoreProximite}/100 • Bonus Assiduité : +{m.bonusAssiduite} pts
                              </p>
                            </div>
                            <Badge className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40">
                              Indemnité 2.000 F MoMo Versée
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tiroir des notifications SMS reçues */}
              <SmsDrawer smsList={smsLogs} />
            </div>
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
            <div className="space-y-6">
              <Card className="border-rose-500/30 bg-slate-900/80 shadow-xl">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <ShieldAlert className="h-6 w-6" />
                    <CardTitle as="h3" className="text-xl text-white">
                      Règle d&apos;Or Républicaine : Zéro Refus d&apos;Urgence Vitale
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-slate-300">
                    Conformément aux engagements du Programme Wadagni-Talata 2026, aucun patient en détresse vitale ne peut être rejeté ou conditionné au versement préalable d&apos;une caution financière.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="destructive"
                      onClick={() => {
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
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Déclencher un Accès « Bris de Glace » Tracé APDP
                    </Button>

                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-200 hover:bg-slate-800"
                      onClick={() => {
                        setMomoParams({
                          montant: 85000,
                          motif: "Apurement Garantie État Paiement Différé",
                          telephone: "+229 01 97 00 12 34",
                        });
                        setMomoOpen(true);
                      }}
                    >
                      Simuler Apurement par Mobile Money (85 000 F)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Table des Dossiers de Paiement Différé Garantis par l'État */}
              <Card className="border-slate-800 bg-slate-900/60">
                <CardHeader>
                  <CardTitle as="h4" className="text-base text-white">
                    Dossiers de Paiement Différé Garantis par l&apos;État (Actifs)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">N° Garantie État</th>
                          <th className="p-3">Patient</th>
                          <th className="p-3">Montant Pris en Charge</th>
                          <th className="p-3">Statut Protection</th>
                          <th className="p-3">Échéance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        <tr className="hover:bg-slate-900/40">
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            GARANTIE-ETAT-2026-KAL-9821
                          </td>
                          <td className="p-3 font-semibold text-white">Bio GOUDA (Kalalé)</td>
                          <td className="p-3 font-mono font-extrabold text-white">85 000 FCFA</td>
                          <td className="p-3">
                            <Badge className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40">
                              Couvert ARCH 100%
                            </Badge>
                          </td>
                          <td className="p-3 text-slate-400">2026-10-30</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ONGLET 6 : PHARMACOPÉE TRADITIONNELLE ARS (MTA) */}
          {activeTab === "pharmacopee" && (
            <div className="space-y-6">
              <Card className="border-emerald-500/30 bg-slate-900/80 shadow-xl">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Leaf className="h-6 w-6" />
                    <CardTitle as="h3" className="text-xl text-white">
                      Filière Nationale de Pharmacopée Traditionnelle & Accréditation ARS
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-slate-300">
                    Registre des Médicaments Traditionnels Améliorés (MTA) homologués par l&apos;Autorité de Régulation du secteur de la Santé (ARS) et prescriptibles sur ordonnance numérique.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MEDICAMENTS_MTA_CERTIFIES.map((mta) => (
                  <Card key={mta.code} className="border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-colors">
                    <CardHeader className="space-y-1 pb-3">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs text-emerald-400 font-bold">{mta.code}</span>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-950/20 text-[10px]">
                          Homologué ARS
                        </Badge>
                      </div>
                      <CardTitle as="h4" className="text-base text-white">{mta.nom}</CardTitle>
                      <CardDescription className="text-xs text-slate-400">{mta.forme}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-300">Indication :</strong>{" "}
                        <span className="text-slate-400">{mta.indication}</span>
                      </div>
                      <div>
                        <strong className="text-slate-300">Posologie :</strong>{" "}
                        <span className="text-slate-400">{mta.posologie}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                        Producteur : {mta.producteur}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
