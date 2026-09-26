"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, StatCard, Badge, Button } from "@/components/ui/Primitives";
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
} from "lucide-react";
import { Patient, Ordonnance, DonneurHemora, StockSang, AuditLog, CampagneDon, TransfertSang, DemandeCarte } from "@/lib/types";
import { SimulatedSmsResult, SimulatedPaymentResult } from "@/lib/simulation";
import { DonorBadgeCard } from "@/components/hemora/DonorBadgeCard";
import { BloodStockMonitor } from "@/components/hemora/BloodStockMonitor";
import { EmergencyDispatchConsole } from "@/components/hemora/EmergencyDispatchConsole";
import { MobileCampaignsTracker } from "@/components/hemora/MobileCampaignsTracker";

export default function GbEMainPage() {
  const [activeTab, setActiveTab] = useState("scenario");

  // Données d'état chargées depuis l'API
  const [patient, setPatient] = useState<Patient | null>(null);
  const [ordonnance, setOrdonnance] = useState<Ordonnance | null>(null);
  const [donneurs, setDonneurs] = useState<DonneurHemora[]>([]);
  const [stocks, setStocks] = useState<StockSang[]>([]);
  const [campagnes, setCampagnes] = useState<CampagneDon[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<SimulatedSmsResult[]>([]);
  const [momoOpen, setMomoOpen] = useState(false);
  const [momoParams, setMomoParams] = useState({ montant: 5000, motif: "Versement Gbɛ", telephone: "+229 01 97 00 12 34" });

  // État du scénario interactif Bio à Kalalé
  const [currentStep, setCurrentStep] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);
  const [scenarioMessage, setScenarioMessage] = useState<string | null>(null);

  // État Bris de Glace
  const [brisDeGlaceActive, setBrisDeGlaceActive] = useState(false);
  const [brisDeGlaceData, setBrisDeGlaceData] = useState<any>(null);

  // État Matching HEMORA
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // État Triage IA
  const [triageInput, setTriageInput] = useState("La patiente présente de forts saignements utérins après l'accouchement avec vertiges et pâleur.");
  const [triageResult, setTriageResult] = useState<any>(null);

  // Chargement initial des données
  const refreshData = async () => {
    try {
      const [patRes, ordRes, donRes, stRes, audRes, smsRes, campRes] = await Promise.all([
        fetch("/api/v1/patients?npi=2026-KAL-9821-BIO").then((r) => r.json()),
        fetch("/api/v1/ordonnances?code=ORD-2026-KAL-042").then((r) => r.json()),
        fetch("/api/v1/hemora/donors").then((r) => r.json()),
        fetch("/api/v1/hemora/stocks").then((r) => r.json()),
        fetch("/api/v1/audit-logs").then((r) => r.json()),
        fetch("/api/v1/simulation/sms").then((r) => r.json()),
        fetch("/api/v1/hemora/campaigns").then((r) => r.json()),
      ]);

      if (patRes.data) setPatient(patRes.data);
      if (ordRes.data) setOrdonnance(ordRes.data);
      if (donRes.data) setDonneurs(donRes.data);
      if (stRes.data) setStocks(stRes.data);
      if (campRes.data) setCampagnes(campRes.data);
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
        // Étape 1 : Visite à domicile ASC et délivrance de la carte QR
        setScenarioMessage("✅ Étape 1 validée : L'Agent Communautaire Ousmane Yarou a enregistré la visite prénatale à domicile à Basso (Kalalé). Carte QR remise.");
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Étape 2 : Rappel vocal / SMS en Bariba
        const res = await fetch("/api/v1/simulation/sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telephone: patient?.telephone || "+229 01 97 00 12 34",
            message: "Gbɛ Santé : Fofo Bio ! CPN3 waasi gari Kalalé CSC suba. Munissez-vous de votre carte QR.",
            langue: "bariba",
          }),
        });
        const data = await res.json();
        if (data.data) {
          setSmsLogs((prev) => [data.data, ...prev]);
        }
        setScenarioMessage("✅ Étape 2 validée : Notification SMS et message vocal en langue Bariba reçus avec succès.");
        setCurrentStep(3);
      } else if (currentStep === 3) {
        // Étape 3 : Consultation au CS Kalalé & Ordonnance
        setScenarioMessage("✅ Étape 3 validée : Consultation effectuée par Dr Tossou & SF Amina. Ordonnance sécurisée émise avec QR code infalsifiable.");
        setCurrentStep(4);
      } else if (currentStep === 4) {
        // Étape 4 : Retrait en pharmacie couvert par ARCH (Usage unique)
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
          setScenarioMessage("✅ Étape 4 validée : Ordonnance délivrée sans reste à charge (couverte à 100% par ARCH). Usage unique scellé en base.");
          setCurrentStep(5);
        } else {
          setScenarioMessage(`⚠️ ${data.error}`);
        }
      } else if (currentStep === 5) {
        // Étape 5 : Transfert monétaire fléché GBESSOKE (5 000 FCFA)
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
          setScenarioMessage("✅ Étape 5 validée : Transfert de 5 000 FCFA versé par Mobile Money à Bio pour incitation nutritionnelle (GBESSOKE).");
          setCurrentStep(6);
        }
      } else if (currentStep === 6) {
        // Étape 6 : Urgence obstétricale à Nikki -> Bris de Glace & Paiement différé
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

          // Admission sans caution
          await fetch("/api/v1/urgences/admission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientNpi: "2026-KAL-9821-BIO",
              motifUrgence: "Hémorragie obstétricale aiguë de la délivrance",
              montantTotalFcfa: 85000,
            }),
          });

          setScenarioMessage("✅ Étape 6 validée : Mode Bris de Glace activé et tracé. Admission immédiate sans avance financière, prise en charge garantie par l'État.");
          setCurrentStep(7);
        }
      } else if (currentStep === 7) {
        // Étape 7 : Matching HEMORA & Défraiement
        const res = await fetch("/api/v1/hemora/matching?lat=9.9400&lng=3.2108&groupe=O+");
        const data = await res.json();
        if (data.success && data.data) {
          setMatchingResults(data.data);
          const topDonneur = data.data[0];

          // Enregistrement du don et versement du défraiement de transport (2000 FCFA)
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

          setScenarioMessage(`🎉 Félicitations ! Scénario complet achevé avec succès. 2 poches de sang O+ mobilisées pour Bio. Donneur ${topDonneur?.donneur.nomComplet} indemnisé de 2.000 FCFA en Mobile Money. Preuve Bitcoin OTS générée.`);
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "60px" }}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={{ maxWidth: "1280px", margin: "24px auto", padding: "0 20px" }}>
        {/* Résumé Statut National */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <StatCard title="Structures Connectées" value="77 Communes" subtitle="Cartographie IASO 2026" accentColor="#008751" />
          <StatCard title="Urgences Vitales" value="Zéro Refus" subtitle="Garantie Paiement Différé" accentColor="#e8112d" />
          <StatCard title="Réseau HEMORA" value="Matching ABO/Rh" subtitle="Distance Haversine" accentColor="#fcd116" />
          <StatCard title="Couverture ARCH" value="100% Tiers-Payant" subtitle="Maternité & Urgences" accentColor="#0284c7" />
        </div>

        {/* ONGLET 1 : SCÉNARIO OFFICIEL DE DÉMONSTRATION (BIO À KALALÉ) */}
        {activeTab === "scenario" && (
          <div>
            <Card style={{ marginBottom: "24px", borderLeft: "6px solid #008751" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <Badge variant="benin">Scénario de Validation Officiel</Badge>
                  <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginTop: "8px" }}>
                    🎬 Parcours de Soins de Bio GOUDA à Kalalé (Borgou)
                  </h2>
                  <p style={{ fontSize: "14px", color: "#64748b" }}>
                    Persona : Bio, 28 ans, enceinte de 7 mois (34 SA), village de Basso, commune de Kalalé, locutrice Bariba.
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Progression du Parcours</div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#008751" }}>Étape {currentStep} / 7</div>
                </div>
              </div>

              {/* Indicateur d'étapes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px", marginBottom: "20px" }}>
                {[
                  { step: 1, label: "1. Visite ASC" },
                  { step: 2, label: "2. Rappel Bariba" },
                  { step: 3, label: "3. CS Kalalé" },
                  { step: 4, label: "4. Pharmacie ARCH" },
                  { step: 5, label: "5. Prime GBESSOKE" },
                  { step: 6, label: "6. Urgence Nikki" },
                  { step: 7, label: "7. Sang HEMORA" },
                ].map((s) => (
                  <div
                    key={s.step}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: currentStep > s.step ? "#e6f4ea" : currentStep === s.step ? "#008751" : "#f1f5f9",
                      color: currentStep === s.step ? "#ffffff" : currentStep > s.step ? "#006b40" : "#64748b",
                      textAlign: "center",
                      border: currentStep === s.step ? "2px solid #006b40" : "1px solid #e2e8f0",
                    }}
                  >
                    {s.label}
                  </div>
                ))}
              </div>

              {/* Panneau d'action de l'étape courante */}
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
                {currentStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                      📍 Étape 1 : Visite communautaire à domicile (PWA Hors-Ligne à Basso)
                    </h3>
                    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                      L'Agent Communautaire Ousmane Yarou se rend au domicile de Bio dans le village de Basso. Il renseigne la fiche prénatale hors-ligne et lui remet une carte QR physique de santé imprimée.
                    </p>
                    <Button onClick={handleNextStep} disabled={stepLoading}>
                      {stepLoading ? "Validation en cours..." : "Valider la visite à domicile & Enregistrer la carte QR ➔"}
                    </Button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                      📞 Étape 2 : Rappel automatique par SMS et appel vocal en Bariba
                    </h3>
                    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "12px" }}>
                      Le système déclenche un rappel vocal et SMS en langue Bariba pour la Consultation Prénatale (CPN3) prévue demain au Centre de Santé Communal de Kalalé.
                    </p>
                    <IvrAudioPlayer
                      titre="Appel automatisé de rappel CPN3 (Voix Bariba)"
                      langue="Bariba (Kalalé)"
                      transcription="Fofo Bio ! Gbɛ Santé nɔ CPN3 waasi gari Kalalé CSC suba. Munissez-vous de votre carte QR imprimée."
                    />
                    <div style={{ marginTop: "16px" }}>
                      <Button onClick={handleNextStep} disabled={stepLoading}>
                        {stepLoading ? "Envoi du rappel..." : "Simuler la réception du rappel Bariba & Continuer ➔"}
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                      🩺 Étape 3 : Consultation au CS Kalalé & Ordonnance Numérique
                    </h3>
                    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                      La sage-femme Amina scanne la carte QR de Bio. Les antécédents s'affichent instantanément. Constantes : Tension 11/7, Périmètre brachial 245 mm. Prescription de Fer + Acide Folique et TPI Paludisme.
                    </p>
                    <Button onClick={handleNextStep} disabled={stepLoading}>
                      {stepLoading ? "Prescription..." : "Générer l'Ordonnance Sécurisée ORD-2026-KAL-042 ➔"}
                    </Button>
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                      💊 Étape 4 : Retrait en pharmacie couvert à 100% par ARCH
                    </h3>
                    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                      La pharmacie de Kalalé scanne le QR code de l'ordonnance. Éligibilité ARCH confirmée (Reste à charge : 0 FCFA). L'ordonnance passe au statut "DÉLIVRÉE" et son QR code est scellé pour bloquer toute réutilisation.
                    </p>
                    <Button onClick={handleNextStep} disabled={stepLoading}>
                      {stepLoading ? "Validation officine..." : "Scanner & Délivrer les médicaments (Tiers-payant ARCH) ➔"}
                    </Button>
                  </div>
                )}

                {currentStep === 5 && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                      💰 Étape 5 : Transfert monétaire fléché GBESSOKE (5 000 FCFA MoMo)
                    </h3>
                    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                      La confirmation médicale de la CPN3 déclenche immédiatement un virement Mobile Money de 5 000 FCFA vers le compte de la famille pour le soutien nutritionnel de la femme enceinte.
                    </p>
                    <Button onClick={handleNextStep} disabled={stepLoading}>
                      {stepLoading ? "Versement Mobile Money..." : "Déclencher le versement GBESSOKE (5.000 FCFA) ➔"}
                    </Button>
                  </div>
                )}

                {currentStep === 6 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e8112d", marginBottom: "8px" }}>
                      <AlertTriangle size={20} />
                      <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
                        🚨 Étape 6 : Urgence obstétricale vitale — Transport & Bris de Glace à Nikki
                      </h3>
                    </div>
                    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                      Le jour du travail, survenue d'une hémorragie de la délivrance. Transport d'urgence communautaire vers l'Hôpital de Zone de Nikki. L'urgentiste active le mode <strong>Bris de Glace</strong> (journalisé APDP) et admet Bio avec un <strong>Dossier de Paiement Différé</strong> garanti par l'État (zéro caution exigée).
                    </p>
                    <Button onClick={handleNextStep} variant="danger" disabled={stepLoading}>
                      {stepLoading ? "Activation Bris de Glace..." : "Activer le Bris de Glace & Ouvrir le Paiement Différé ➔"}
                    </Button>
                  </div>
                )}

                {currentStep === 7 && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#008751", marginBottom: "8px" }}>
                      🩸 Étape 7 : Module HEMORA — Mobilisation de 2 poches O+ & Défraiement
                    </h3>
                    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                      Besoin vital urgent : 2 poches de sang O+. Le moteur HEMORA classe les donneurs volontaires les plus proches via la formule de Haversine. Le donneur arrive, donne son sang, reçoit 2 000 FCFA de défraiement Mobile Money, et la preuve OTS est ancrée sur Bitcoin.
                    </p>
                    <Button onClick={handleNextStep} variant="primary" disabled={stepLoading}>
                      {stepLoading ? "Matching et mobilisation..." : "Lancer le Matching HEMORA & Clôturer l'Urgence ➔"}
                    </Button>
                  </div>
                )}

                {/* Message d'état */}
                {scenarioMessage && (
                  <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #bbf7d0", color: "#166534", fontSize: "13px", fontWeight: 500 }}>
                    {scenarioMessage}
                  </div>
                )}
              </div>

              {/* Rétroactions de l'étape 6 et 7 */}
              {brisDeGlaceActive && brisDeGlaceData && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "bold", color: "#991b1b" }}>🔓 Profil Vital Déverrouillé en Mode Bris de Glace</span>
                    <Badge variant="danger">Accès Urgentiste Tracé APDP</Badge>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "13px" }}>
                    <div><strong>Patiente :</strong> {brisDeGlaceData.prenom} {brisDeGlaceData.nom}</div>
                    <div><strong>Groupe Sanguin :</strong> <Badge variant="danger">{brisDeGlaceData.groupeSanguin}</Badge></div>
                    <div><strong>Allergies :</strong> {brisDeGlaceData.allergies?.join(", ")}</div>
                    <div><strong>État :</strong> Enceinte (Semaine {brisDeGlaceData.semaineAmenorrhee})</div>
                    <div><strong>Assurance :</strong> ARCH N° {brisDeGlaceData.numeroArch}</div>
                  </div>
                </div>
              )}

              {matchingResults.length > 0 && (
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                    🩸 Donneurs Compatibles Identifiés par Matching Haversine (Nikki / Kalalé)
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {matchingResults.map((m, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "13px" }}>
                        <div>
                          <strong>{m.donneur.nomComplet}</strong> ({m.donneur.commune}) — Groupe : <Badge variant="benin">{m.donneur.groupeSanguin}</Badge>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Distance : {m.distanceKm} km • Score Proximité : {m.scoreProximite}/100 • Bonus Assiduité : +{m.bonusAssiduite} pts
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "16px", fontWeight: "bold", color: "#008751" }}>Score {m.scoreTotal}</span>
                          <div style={{ fontSize: "11px", color: "#166534" }}>Indemnité 2.000 FCFA versée</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Tiroir des SMS reçus */}
            <SmsDrawer smsList={smsLogs} />
          </div>
        )}

        {/* ONGLET 2 : CARNET PATIENT FHIR */}
        {activeTab === "patient" && patient && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
            <Card>
              <div style={{ textAlign: "center", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0", marginBottom: "16px" }}>
                <div style={{ fontSize: "56px" }}>👩🏾</div>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a" }}>
                  {patient.prenom} {patient.nom}
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>NPI : {patient.npi}</p>
                <div style={{ marginTop: "8px" }}>
                  <Badge variant="benin">ARCH Assuré Actif</Badge>
                </div>
              </div>

              <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div><strong>Commune :</strong> {patient.commune} (Borgou)</div>
                <div><strong>Téléphone :</strong> {patient.telephone}</div>
                <div><strong>Groupe Sanguin :</strong> <Badge variant="danger">{patient.groupeSanguin}</Badge></div>
                <div><strong>Allergies :</strong> {patient.allergies.join(", ")}</div>
                <div><strong>Grossesse :</strong> {patient.estEnceinte ? `Oui (${patient.semaineAmenorrhee} SA)` : "Non"}</div>
                <div><strong>N° ARCH :</strong> {patient.numeroArch}</div>
              </div>

              <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", textAlign: "center" }}>
                <QrCode size={64} style={{ margin: "0 auto 8px" }} color="#008751" />
                <div style={{ fontSize: "11px", color: "#64748b" }}>Carte Santé QR Infalsifiable</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Scannable hors-ligne par tout soignant</div>
              </div>
            </Card>

            <div>
              <Card style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                  📋 Ordonnance Numérique en Cours
                </h3>
                {ordonnance ? (
                  <div style={{ padding: "16px", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "bold", color: "#0284c7" }}>Code : {ordonnance.code}</span>
                      <Badge variant={ordonnance.statut === "DELIVREE" ? "success" : "warning"}>
                        Statut : {ordonnance.statut}
                      </Badge>
                    </div>
                    <div style={{ fontSize: "13px", color: "#475569", marginBottom: "8px" }}>
                      Prescripteur : {ordonnance.prescripteurNom} ({ordonnance.etablissement})
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Médicaments prescrits :</div>
                    <ul style={{ fontSize: "13px", color: "#334155", paddingLeft: "20px", marginBottom: "8px" }}>
                      {ordonnance.medicaments.map((m, i) => (
                        <li key={i}>{m.nom} — {m.posologie} ({m.dureeJours} jours)</li>
                      ))}
                    </ul>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      Empreinte Hash : {ordonnance.empreinteHash.slice(0, 32)}... (Usage unique scellé)
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#64748b" }}>Aucune ordonnance active.</p>
                )}
              </Card>

              {/* Triage IA Clinique */}
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Sparkles size={18} color="#008751" />
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
                    Module Triage IA Médical & Aide à la Décision
                  </h3>
                </div>
                <textarea
                  value={triageInput}
                  onChange={(e) => setTriageInput(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "12px" }}
                />
                <Button onClick={handleRunTriage}>
                  Analyser les symptômes avec l'IA Clinique
                </Button>

                {triageResult && (
                  <div style={{ marginTop: "16px", padding: "16px", borderRadius: "8px", backgroundColor: triageResult.niveauUrgence === "ROUGE_VITALE" ? "#fef2f2" : "#f0fdf4", border: `1px solid ${triageResult.niveauUrgence === "ROUGE_VITALE" ? "#fecaca" : "#bbf7d0"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "bold", color: triageResult.niveauUrgence === "ROUGE_VITALE" ? "#991b1b" : "#166534" }}>
                        Niveau d'Urgence : {triageResult.niveauUrgence} (Gravité {triageResult.scoreGravite}/100)
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#334155", marginBottom: "6px" }}>
                      <strong>Orientation :</strong> {triageResult.orientationRecommandee}
                    </p>
                    <p style={{ fontSize: "13px", color: "#334155", marginBottom: "6px" }}>
                      <strong>Protocole National :</strong> {triageResult.protocoleNational}
                    </p>
                    {triageResult.alertesCliniques?.length > 0 && (
                      <div style={{ fontSize: "12px", color: "#b91c1c", fontWeight: 600 }}>
                        ⚠️ Alertes : {triageResult.alertesCliniques.join(" | ")}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ONGLET 3 : URGENCES VITALES & PAIEMENT DIFFÉRÉ */}
        {activeTab === "urgences" && (
          <div>
            <Card style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <ShieldAlert size={22} color="#e8112d" />
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
                  Prise en Charge des Urgences Vitales sans Avance Financière (Règle Zéro Refus)
                </h3>
              </div>
              <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                Conformément au Programme Wadagni-Talata 2026, aucun patient en détresse vitale ne peut être refusé ou retardé pour motif financier. L'admission immédiate ouvre un dossier de paiement différé garanti par l'État.
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Button
                  variant="danger"
                  onClick={() => {
                    fetch("/api/v1/encounters/bris-de-glace", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        patientNpi: "2026-KAL-9821-BIO",
                        praticienNpi: "NPI-MED-2026-0042",
                        praticienNom: "Dr. Emmanuel Tossou",
                        motifUrgence: "Urgence vitale polytraumatisé / hémorragie",
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
                  <Lock size={16} /> Déclencher un Accès « Bris de Glace » Tracé
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setMomoParams({
                      montant: 85000,
                      motif: "Apurement Paiement Différé État",
                      telephone: "+229 01 97 00 12 34",
                    });
                    setMomoOpen(true);
                  }}
                >
                  💳 Simuler Apurement par Mobile Money
                </Button>
              </div>
            </Card>

            {/* Dossiers de paiement différé */}
            <Card>
              <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                Dossiers de Paiement Différé Garantis par l'État (Actifs)
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                      <th style={{ padding: "8px" }}>N° Garantie État</th>
                      <th style={{ padding: "8px" }}>Patient</th>
                      <th style={{ padding: "8px" }}>Montant</th>
                      <th style={{ padding: "8px" }}>Statut</th>
                      <th style={{ padding: "8px" }}>Échéance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600 }}>GARANTIE-ETAT-2026-KAL-9821</td>
                      <td style={{ padding: "10px 8px" }}>Bio GOUDA (Kalalé)</td>
                      <td style={{ padding: "10px 8px", fontWeight: "bold" }}>85 000 FCFA</td>
                      <td style={{ padding: "10px 8px" }}><Badge variant="success">Couvert ARCH 100%</Badge></td>
                      <td style={{ padding: "10px 8px", color: "#64748b" }}>2026-10-30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ONGLET 4 : URGENCE SANG HEMORA (REFONTE TOTALE BMM) */}
        {activeTab === "hemora" && (
          <div className="space-y-6">
            {/* Console de Régulation & Dispatch d'Urgence */}
            <EmergencyDispatchConsole
              onSearchMatch={async (latVal, lngVal, grp) => {
                const res = await fetch(`/api/v1/hemora/matching?lat=${latVal}&lng=${lngVal}&groupe=${encodeURIComponent(grp)}`);
                const json = await res.json();
                return json.data || [];
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
                      message: `URGENCE VITALE HEMORA : Besoin immédiat de sang ${d.groupeSanguin} à ${hopital}. Défraiement transport 2 000 F garanti. Présentez-vous sans délai.`,
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
                      messageVocal: `Alerte urgente transfusion ${hopital}`,
                    }),
                  });
                }
                refreshData();
              }}
            />

            {/* Suivi Prédictif des Stocks par Établissement */}
            <BloodStockMonitor
              stocks={stocks}
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
            />

            {/* Campagnes Mobiles de Don dans les 77 Communes */}
            <MobileCampaignsTracker
              campagnes={campagnes}
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
            />

            {/* Répertoire des Donneurs Volontaires Actifs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>👥</span>
                    <span>Donneurs Volontaires Répertoriés & Cartes Physiques QR</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Profils salés SHA-256 conformes au Code du Numérique et à l&apos;APDP (Loi 2017-20).
                  </p>
                </div>
                <Badge variant="benin">{donneurs.length} donneurs actifs</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {donneurs.map((d) => (
                  <DonorBadgeCard
                    key={d.id}
                    donneur={d}
                    onCall={(tel) => {
                      fetch("/api/v1/simulation/ivr", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ telephone: tel, langue: "bariba", messageVocal: "Convocation don d'urgence" }),
                      }).then(() => refreshData());
                    }}
                    onSendSms={(tel) => {
                      fetch("/api/v1/simulation/sms", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ telephone: tel, message: "HEMORA: Convocation don de sang urgent." }),
                      }).then(() => refreshData());
                    }}
                    onRequestCard={(npi) => {
                      fetch("/api/v1/hemora/card-requests", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ donneurNpi: npi, communeLivraison: d.commune }),
                      }).then(() => refreshData());
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 5 : PHARMACOPÉE TRADITIONNELLE ARS */}
        {activeTab === "pharmacopee" && (
          <div>
            <Card style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>🌿</span>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
                  Filière Nationale de Pharmacopée Traditionnelle & Accréditation ARS
                </h3>
              </div>
              <p style={{ fontSize: "14px", color: "#475569" }}>
                Registre officiel sous la supervision de l'Autorité de Régulation du secteur de la Santé (ARS) et du Ministère de la Santé. Seuls les Médicaments Traditionnels Améliorés (MTA) certifiés peuvent faire l'objet d'une ordonnance numérique sécurisée.
              </p>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              <Card>
                <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                  MTA Certifiés Homologués au Bénin
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}>
                    <div style={{ fontWeight: "bold", color: "#166534" }}>FACA / Drepano-Cure (Fagara zanthoxyloides)</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Certification : ARS-MTA-HOMOLOGUE-0012</div>
                    <div style={{ marginTop: "4px" }}>Indication : Prévention des crises vaso-occlusives de la drépanocytose.</div>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}>
                    <div style={{ fontWeight: "bold", color: "#166534" }}>Paludi-Tisane ARS (Artemisia annua béninoise)</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Certification : ARS-MTA-HOMOLOGUE-0045</div>
                    <div style={{ marginTop: "4px" }}>Indication : Traitement d'appoint des accès palustres simples.</div>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}>
                    <div style={{ fontWeight: "bold", color: "#166534" }}>Hepato-Bénin (Phyllanthus amarus)</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Certification : ARS-MTA-HOMOLOGUE-0089</div>
                    <div style={{ marginTop: "4px" }}>Indication : Protection hépatique et convalescence infectieuse.</div>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                  Tradipraticien Accrédité ARS en Exercice
                </h4>
                <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "13px" }}>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a" }}>Dah Sèssinou Dako</div>
                  <div style={{ color: "#008751", fontWeight: 600 }}>N° Accréditation : ARS-TRADI-BOR-2026-04</div>
                  <div style={{ color: "#64748b", marginTop: "4px" }}>Spécialité : Phytothérapie pédiatrique & drépanocytose</div>
                  <div style={{ color: "#64748b" }}>Cabinet : Centre Gnonnan (Parakou)</div>
                  <div style={{ marginTop: "12px" }}>
                    <Badge variant="success">Habilité Prescriptions MTA ARS</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ONGLET 6 : ASC HORS-LIGNE */}
        {activeTab === "asc" && (
          <div>
            <Card style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
                    Application PWA Hors-Ligne pour les 16 000 ASC
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                    Fonctionnement autonome sans connexion réseau • Synchronisation automatique dès retour réseau
                  </p>
                </div>
                <Badge variant="benin">Statut PWA : Prêt Hors-Ligne (IndexedDB)</Badge>
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Card>
                <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                  Formulaire Terrain de Suivi Prénatal (Offline)
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div><strong>NPI Patiente :</strong> 2026-KAL-9821-BIO</div>
                  <div><strong>Périmètre Brachial (PB) :</strong> 245 mm (Nutrition Normale)</div>
                  <div><strong>Tension Artérielle :</strong> 11/7 mmHg</div>
                  <div><strong>Mouvement Fœtal :</strong> Présent et actif</div>
                  <Button variant="primary" style={{ marginTop: "8px" }}>
                    Enregistrer la fiche hors-ligne (Sync en attente)
                  </Button>
                </div>
              </Card>

              <Card>
                <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                  Messages Vocaux en Langues Nationales
                </h4>
                <IvrAudioPlayer
                  titre="Message Paludisme & Moustiquaire (Fon)"
                  langue="Fon (Sud & Centre)"
                  transcription="Mi ku do gbe me ! E bio do a na zun zan nu ason bo xo mi nu vi we le. (Dormez toujours sous moustiquaire imprégnée pour protéger vos enfants)."
                />
              </Card>
            </div>
          </div>
        )}

        {/* ONGLET 7 : JOURNAL D'AUDIT APDP */}
        {activeTab === "audit" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
                  Journal d'Audit Immuable — Conformité APDP (Loi n° 2017-20)
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  Traçabilité cryptographique de chaque accès bris de glace, délivrance et versement
                </p>
              </div>
              <Badge variant="benin">{auditLogs.length} Événements Audités</Badge>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                    <th style={{ padding: "8px" }}>Horodatage</th>
                    <th style={{ padding: "8px" }}>Action</th>
                    <th style={{ padding: "8px" }}>Acteur</th>
                    <th style={{ padding: "8px" }}>Rôle</th>
                    <th style={{ padding: "8px" }}>Cible NPI / ID</th>
                    <th style={{ padding: "8px" }}>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px", color: "#64748b", whiteSpace: "nowrap" }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: "8px" }}>
                        <Badge variant={log.action === "BRIS_DE_GLACE" ? "danger" : "info"}>
                          {log.action}
                        </Badge>
                      </td>
                      <td style={{ padding: "8px", fontWeight: 600 }}>{log.acteurNom}</td>
                      <td style={{ padding: "8px" }}>{log.role}</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>{log.cibleId}</td>
                      <td style={{ padding: "8px", color: "#334155" }}>
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Modal Mobile Money */}
      <MobileMoneyModal
        isOpen={momoOpen}
        onClose={() => setMomoOpen(false)}
        montantDefault={momoParams.montant}
        motifDefault={momoParams.motif}
        telephoneDefault={momoParams.telephone}
        onSuccess={() => refreshData()}
      />
    </div>
  );
}
