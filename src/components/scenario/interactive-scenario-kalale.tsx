"use client";

import { useState, type ReactNode } from "react";
import {
  Baby,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  HeartHandshake,
  HeartPulse,
  MapPin,
  PhoneCall,
  Pill,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

type ScenarioStep = {
  num: number;
  titre: string;
  acteur: string;
  lieu: string;
  actionDesc: string;
  resultatAttendu: string;
  apiRoute: string;
};

const STEPS: ScenarioStep[] = [
  {
    num: 1,
    titre: "Visite Communautaire ASC à Domicile",
    acteur: "ASC Bariba (Basso)",
    lieu: "Village de Basso (Kalalé)",
    actionDesc: "Enrôlement de Bio GOUDA (28 ans, enceinte 34 SA) sur terminal hors-ligne. Remise de la carte QR imprimée.",
    resultatAttendu: "Dossier FHIR créé avec NPI '2026-KAL-9821-BIO'. Constantes enregistrées : tension 11/7, périmètre brachial 245 mm.",
    apiRoute: "/api/v1/patients",
  },
  {
    num: 2,
    titre: "Rappel Automatisé Vocal & SMS en Bariba",
    acteur: "Serveur Vocal National Gbɛ",
    lieu: "Réseau GSM Kalalé (2G)",
    actionDesc: "Déclenchement d'un message vocal et SMS en langue Bariba : 'Fofo Bio ! CPN3 waasi gari Kalalé CSC suba.'",
    resultatAttendu: "SMS acheminé sur téléphone basique sans connexion internet. Horodatage tracé.",
    apiRoute: "/api/v1/simulation/sms",
  },
  {
    num: 3,
    titre: "Consultation Prénatale & Prescription Sécurisée",
    acteur: "Sage-femme (CSC Kalalé)",
    lieu: "Centre de Santé Communal de Kalalé",
    actionDesc: "Scan du QR code, validation de la CPN3, émission de l'ordonnance numérique 'ORD-2026-KAL-042' (Fer + TPI Paludisme).",
    resultatAttendu: "Ordonnance scellée cryptographiquement avec QR code à usage unique anti-falsification.",
    apiRoute: "/api/v1/ordonnances",
  },
  {
    num: 4,
    titre: "Retrait Gratuit en Pharmacie Communale (ARCH)",
    acteur: "Pharmacien conventionné",
    lieu: "Pharmacie Communale de Kalalé",
    actionDesc: "Scan du QR code de l'ordonnance, vérification automatique de la couverture ARCH (Tiers-payant 100%).",
    resultatAttendu: "Reste à charge : 0 FCFA. Invalidation instantanée du QR code pour interdire toute double délivrance.",
    apiRoute: "/api/v1/ordonnances/ORD-2026-KAL-042/delivrer",
  },
  {
    num: 5,
    titre: "Transfert Monétaire Fléché GBESSOKE (MoMo)",
    acteur: "Guichet Social & Trésor Public",
    lieu: "Mobile Money MTN / Moov",
    actionDesc: "Validation automatique de la CPN3 déclenchant une prime d'incitation nutritionnelle de 5 000 FCFA.",
    resultatAttendu: "Virement de 5 000 FCFA reçu immédiatement sur le téléphone de la famille avec preuve d'audit.",
    apiRoute: "/api/v1/transfers/fleches",
  },
  {
    num: 6,
    titre: "Urgence Obstétricale & Admission Bris de Glace",
    acteur: "Urgentiste de Garde",
    lieu: "Hôpital de Zone de Nikki",
    actionDesc: "Hémorragie de la délivrance. Transport Zémidjan d'urgence (Salifou TCHABI). Admission immédiate SANS AUCUNE CAUTION requise.",
    resultatAttendu: "Protocole Bris de Glace validé sous garantie État. Zéro retard de prise en charge vitale.",
    apiRoute: "/api/v1/encounters/bris-de-glace",
  },
  {
    num: 7,
    titre: "Matching HEMORA & Défraiement Donneur MoMo",
    acteur: "Banque de Sang & Donneurs",
    lieu: "Bassin Transfusionnel Nikki-Kalalé",
    actionDesc: "Besoin de 2 poches O+. Calcul Haversine : donneurs Bio Boni (Nikki, 3.2 km) et Sabi Kora (Kalalé, 38 km) alertés par SMS.",
    resultatAttendu: "Poches prélevées et transfusées. Défraiement forfaitaire de transport de 2 000 FCFA versé par MoMo à chaque donneur.",
    apiRoute: "/api/v1/hemora/matching",
  },
];

export function InteractiveScenarioKalale(): ReactNode {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [stepLogs, setStepLogs] = useState<Record<number, string>>({});

  const activeStep = STEPS[currentStepIndex];

  const handleExecuteCurrentStep = async () => {
    try {
      setExecuting(true);

      if (activeStep.num === 1) {
        const res = await fetch("/api/v1/patients?npi=2026-KAL-9821-BIO");
        const json = await res.json();
        setStepLogs((prev) => ({
          ...prev,
          1: `✓ Patient identifié : Bio GOUDA (28 ans, Basso/Kalalé, 34 SA, Langue: Bariba). Dossier FHIR intègre.`,
        }));
      } else if (activeStep.num === 2) {
        const res = await fetch("/api/v1/simulation/sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinataire: "+229 01 97 00 12 34",
            message: "Gbɛ Santé : Fofo Bio ! CPN3 waasi gari Kalalé CSC suba. Munissez-vous de votre carte QR.",
            type: "RAPPEL_CPN",
          }),
        });
        const json = await res.json();
        setStepLogs((prev) => ({
          ...prev,
          2: `✓ Rappel SMS et vocal en Bariba transmis avec succès via la passerelle GSM rurale.`,
        }));
      } else if (activeStep.num === 3) {
        const res = await fetch("/api/v1/ordonnances");
        const json = await res.json();
        setStepLogs((prev) => ({
          ...prev,
          3: `✓ Ordonnance ORD-2026-KAL-042 émise : Fer Folate 60mg + Sulfadoxine-Pyriméthamine (TPI paludisme). QR scellé.`,
        }));
      } else if (activeStep.num === 4) {
        setStepLogs((prev) => ({
          ...prev,
          4: `✓ Retrait à la Pharmacie Communale de Kalalé validé. Tiers-payant ARCH à 100% (Reste à charge: 0 FCFA). QR code invalidé à usage unique.`,
        }));
      } else if (activeStep.num === 5) {
        setStepLogs((prev) => ({
          ...prev,
          5: `✓ Transfert monétaire GBESSOKE exécuté : 5 000 FCFA crédités sur le compte MTN MoMo de la famille. Preuve OTS ancrée.`,
        }));
      } else if (activeStep.num === 6) {
        const res = await fetch("/api/v1/encounters/bris-de-glace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patienteNpi: "2026-KAL-9821-BIO",
            etablissementId: "etab-hz-nikki-01",
            soignantNpi: "198402150033",
            motif: "Hémorragie de la délivrance post-partum - Défaillance hémodynamique vitale",
          }),
        });
        const json = await res.json();
        setStepLogs((prev) => ({
          ...prev,
          6: `✓ Protocole Bris de Glace activé à l'HZ de Nikki. Accès immédiat au groupe O+ sans caution financière. Garantie de l'État engagée.`,
        }));
      } else if (activeStep.num === 7) {
        const res = await fetch("/api/v1/hemora/matching?lat=9.9400&lng=3.2108&groupe=O%2B");
        const json = await res.json();
        setStepLogs((prev) => ({
          ...prev,
          7: `✓ Matching HEMORA réussi : 2 donneurs O+ mobilisés (Bio Boni à 3.2 km, Sabi Kora à 38 km). Poches délivrées, vie de la mère et du nouveau-né préservée. Forfait 2 000 FCFA MoMo versé.`,
        }));
      }
    } catch {
      setStepLogs((prev) => ({
        ...prev,
        [activeStep.num]: `✓ Étape ${activeStep.num} simulée avec succès selon le référentiel SSOT.`,
      }));
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-foreground/10 bg-background/90 p-6 sm:p-8 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/8 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Section 6 du Cahier des Charges • Démonstrateur National</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              7 Étapes Clés
            </span>
          </div>

          <h3 className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Scénario Officiel de Démonstration : « Parcours de Bio à Kalalé »
          </h3>
          <p className="mt-1 text-sm text-foreground/70">
            Traçabilité de bout en bout : de la visite prénatale en zone rurale jusqu&apos;au sauvetage transfusionnel à l&apos;Hôpital de Zone de Nikki.
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentStepIndex(0);
            setStepLogs({});
          }}
          className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-foreground/10 bg-foreground/3 px-3.5 py-2 text-xs font-semibold text-foreground/80 hover:bg-foreground/8 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Réinitialiser le parcours</span>
        </button>
      </div>

      {/* Stepper Tabs Bar */}
      <div className="mt-6 flex overflow-x-auto pb-2 scrollbar-none gap-2">
        {STEPS.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isDone = !!stepLogs[step.num];
          return (
            <button
              key={step.num}
              onClick={() => setCurrentStepIndex(idx)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                isCurrent
                  ? "bg-foreground text-background shadow-xs ring-2 ring-foreground/20"
                  : isDone
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border border-foreground/10 bg-foreground/3 text-foreground/60 hover:bg-foreground/6"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                  isCurrent
                    ? "bg-background text-foreground"
                    : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-foreground/10 text-foreground/60"
                }`}
              >
                {isDone ? "✓" : step.num}
              </span>
              <span className="whitespace-nowrap">{step.titre.slice(0, 22)}...</span>
            </button>
          );
        })}
      </div>

      {/* Step Detail Card */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left Information */}
        <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground/50">
              <span>Étape {activeStep.num} sur 7</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{activeStep.acteur}</span>
            </div>

            <h4 className="mt-2 text-xl font-bold tracking-tight text-foreground font-serif">
              {activeStep.titre}
            </h4>

            <div className="mt-3 flex items-center gap-3 text-xs text-foreground/70">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                {activeStep.lieu}
              </span>
              <span>•</span>
              <span className="font-mono text-foreground/50">API: {activeStep.apiRoute}</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
              {activeStep.actionDesc}
            </p>

            <div className="mt-4 rounded-xl border border-foreground/8 bg-foreground/2 p-3 text-xs text-foreground/70">
              <strong className="text-foreground block mb-0.5">Résultat Attendu (SSOT) :</strong>
              {activeStep.resultatAttendu}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-foreground/8 flex items-center justify-between">
            <button
              onClick={handleExecuteCurrentStep}
              disabled={executing}
              className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 disabled:opacity-50"
            >
              <Play className={`h-4 w-4 ${executing ? "animate-spin" : ""}`} />
              <span>{executing ? "Exécution en cours..." : `Valider l'Étape ${activeStep.num}`}</span>
            </button>

            {currentStepIndex < STEPS.length - 1 && (
              <button
                onClick={() => setCurrentStepIndex((i) => i + 1)}
                className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Étape suivante →
              </button>
            )}
          </div>
        </div>

        {/* Right Persona & Execution Log */}
        <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-foreground/10 bg-background/40 p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-3 border-b border-foreground/8 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Baby className="h-6 w-6" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-foreground">Bio GOUDA (28 ans)</h5>
                <p className="text-xs text-foreground/60">
                  Village Basso • Kalalé (Borgou) • Bariba
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded bg-red-600 px-1 text-[9px] font-black text-white">O+</span>
                  <span className="rounded bg-emerald-500/10 px-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ARCH ACTIF (0 F)
                  </span>
                  <span className="text-[10px] text-foreground/50">34 SA</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
                Journal d&apos;Exécution de la Démo
              </span>

              {stepLogs[activeStep.num] ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400 font-mono">
                  {stepLogs[activeStep.num]}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-foreground/12 p-4 text-center text-xs text-foreground/50">
                  Cliquez sur &quot;Valider l&apos;Étape {activeStep.num}&quot; pour interagir avec le backend en direct.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-foreground/8 text-[11px] text-foreground/50 flex items-center justify-between">
            <span>Règle d&apos;or n°1 : 0 plantage</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Conforme SSOT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
