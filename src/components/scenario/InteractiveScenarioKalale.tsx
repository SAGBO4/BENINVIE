"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IvrAudioPlayer } from "@/components/simulators/IvrAudioPlayer";
import { SmsDrawer } from "@/components/simulators/SmsDrawer";
import {
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Activity,
  AlertTriangle,
  HeartHandshake,
  Lock,
  ArrowRight,
  RotateCcw,
  Check,
} from "lucide-react";
import { SimulatedSmsResult } from "@/lib/simulation";

interface InteractiveScenarioProps {
  currentStep: number;
  stepLoading: boolean;
  scenarioMessage: string | null;
  brisDeGlaceActive: boolean;
  brisDeGlaceData: any;
  matchingResults: any[];
  smsLogs: SimulatedSmsResult[];
  onNextStep: () => Promise<void>;
  onResetStep?: () => void;
}

const SCENARIO_STEPS = [
  { step: 1, title: "Visite ASC", subtitle: "Basso (Kalalé)", icon: MapPin },
  { step: 2, title: "Rappel Bariba", subtitle: "SMS & Vocal IVR", icon: Clock },
  { step: 3, title: "CS Kalalé", subtitle: "Ordonnance Sécurisée", icon: Sparkles },
  { step: 4, title: "Pharmacie", subtitle: "Tiers-payant ARCH", icon: CheckCircle2 },
  { step: 5, title: "Prime Gbèssoké", subtitle: "5 000 F Mobile Money", icon: Activity },
  { step: 6, title: "Urgence Nikki", subtitle: "Bris de Glace", icon: AlertTriangle },
  { step: 7, title: "Sang HEMORA", subtitle: "2 Poches O+ & OTS", icon: HeartHandshake },
];

export function InteractiveScenarioKalale({
  currentStep,
  stepLoading,
  scenarioMessage,
  brisDeGlaceActive,
  brisDeGlaceData,
  matchingResults,
  smsLogs,
  onNextStep,
}: InteractiveScenarioProps) {
  return (
    <div className="space-y-8 py-4">
      {/* En-tête du Scénario */}
      <Card className="border-emerald-500/30 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
        <CardHeader className="border-b border-slate-800 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white font-semibold text-xs px-2.5 py-0.5">
                  Scénario Officiel Wadagni - Talata 2026
                </Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-950/30 text-xs">
                  Commune de Kalalé (Borgou)
                </Badge>
              </div>
              <CardTitle as="h2" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                🎬 Parcours de Soins de Bio GOUDA
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-300">
                Persona : Bio, 28 ans, primipare enceinte de 34 SA, village isolé de Basso, commune de Kalalé.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <p className="text-[11px] font-medium text-slate-400">Progression</p>
                <p className="font-display text-2xl font-black text-emerald-400">
                  {currentStep} <span className="text-slate-500 text-sm font-normal">/ 7</span>
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Stepper moderne 7 Étapes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {SCENARIO_STEPS.map((s) => {
              const Icon = s.icon;
              const isPast = currentStep > s.step;
              const isCurrent = currentStep === s.step;

              return (
                <div
                  key={s.step}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    isPast
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                      : isCurrent
                      ? "border-emerald-400 bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-bold scale-[1.02]"
                      : "border-slate-800/80 bg-slate-950/40 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] opacity-75 font-mono">0{s.step}</span>
                    {isPast ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 opacity-80" />
                    )}
                  </div>
                  <p className="font-display truncate text-xs">{s.title}</p>
                  <p className="text-[10px] opacity-75 truncate">{s.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Panneau d'action de l'étape courante */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-inner space-y-5">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Étape 1 : Visite communautaire à domicile (PWA Hors-Ligne à Basso)
                    </h3>
                    <p className="text-xs text-slate-400">Agent de Santé Communautaire : Ousmane Yarou</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  L&apos;Agent Communautaire se rend au domicile de Bio dans le village de Basso. Il renseigne la fiche prénatale hors-ligne sur sa tablette PWA et lui remet une <strong>carte de santé plastifiée avec QR code infalsifiable</strong>.
                </p>
                <Button
                  size="lg"
                  onClick={onNextStep}
                  disabled={stepLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-lg shadow-emerald-950/60"
                >
                  {stepLoading ? "Validation en cours..." : "Valider la visite à domicile & Enregistrer la carte QR ➔"}
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Étape 2 : Rappel automatisé par SMS et appel vocal en Bariba
                    </h3>
                    <p className="text-xs text-slate-400">Relais Digital Communautaire • Langue Bariba</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  La veille de sa consultation, le système déclenche un rappel vocal et SMS en Bariba pour la Consultation Prénatale (CPN3) prévue demain au Centre de Santé Communal de Kalalé.
                </p>
                <IvrAudioPlayer
                  titre="Appel automatisé de rappel CPN3 (Voix Bariba)"
                  langue="Bariba (Kalalé)"
                  transcription="Fofo Bio ! Gbɛ Santé nɔ CPN3 waasi gari Kalalé CSC suba. Munissez-vous de votre carte QR imprimée."
                />
                <Button
                  size="lg"
                  onClick={onNextStep}
                  disabled={stepLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 shadow-lg shadow-amber-950/60"
                >
                  {stepLoading ? "Envoi du rappel..." : "Simuler la réception du rappel Bariba & Continuer ➔"}
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Étape 3 : Consultation au CS Kalalé & Ordonnance Numérique
                    </h3>
                    <p className="text-xs text-slate-400">Sage-femme Amina & Dr. Tossou</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  La sage-femme scanne la carte QR de Bio. Constantes enregistrées : Tension 11/7, Périmètre brachial 245 mm. Prescription de Fer + Acide Folique et TPI Paludisme avec ordonnance sécurisée.
                </p>
                <Button
                  size="lg"
                  onClick={onNextStep}
                  disabled={stepLoading}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 shadow-lg shadow-cyan-950/60"
                >
                  {stepLoading ? "Prescription..." : "Générer l'Ordonnance Sécurisée ORD-2026-KAL-042 ➔"}
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Étape 4 : Retrait en pharmacie couvert à 100% par ARCH
                    </h3>
                    <p className="text-xs text-slate-400">Pharmacie Communale de Kalalé • Tiers-Payant</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  Le pharmacien scanne le QR code de l&apos;ordonnance. Reste à charge : <strong>0 FCFA</strong> pris en charge par l&apos;Assurance Maladie ARCH. L&apos;ordonnance passe au statut &quot;DÉLIVRÉE&quot; et son QR code est scellé pour empêcher toute réutilisation.
                </p>
                <Button
                  size="lg"
                  onClick={onNextStep}
                  disabled={stepLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6"
                >
                  {stepLoading ? "Validation officine..." : "Scanner & Délivrer les médicaments (Tiers-payant ARCH) ➔"}
                </Button>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Étape 5 : Transfert monétaire fléché GBESSOKE (5 000 FCFA MoMo)
                    </h3>
                    <p className="text-xs text-slate-400">Filet Social • Soutien Nutritionnel</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  La confirmation médicale de la consultation prénatale déclenche instantanément un virement Mobile Money de 5 000 FCFA sur le compte de la famille pour le soutien nutritionnel de la femme enceinte.
                </p>
                <Button
                  size="lg"
                  onClick={onNextStep}
                  disabled={stepLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6"
                >
                  {stepLoading ? "Versement Mobile Money..." : "Déclencher le versement GBESSOKE (5.000 FCFA) ➔"}
                </Button>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Étape 6 : Urgence obstétricale vitale — Transport & Bris de Glace à Nikki
                    </h3>
                    <p className="text-xs text-rose-400 font-semibold">Admission Vitale sans Caution • Garantie État</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  Survenue d&apos;une hémorragie de la délivrance. Transport d&apos;urgence communautaire vers l&apos;Hôpital de Zone de Nikki. L&apos;urgentiste active le mode <strong>Bris de Glace</strong> (journalisé APDP) et admet Bio avec un <strong>Dossier de Paiement Différé</strong> garanti par l&apos;État.
                </p>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={onNextStep}
                  disabled={stepLoading}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 shadow-lg shadow-rose-950/60"
                >
                  {stepLoading ? "Activation Bris de Glace..." : "Activer le Bris de Glace & Ouvrir le Paiement Différé ➔"}
                </Button>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Étape 7 : Module HEMORA — Mobilisation de 2 poches O+ & Défraiement
                    </h3>
                    <p className="text-xs text-emerald-400 font-semibold">Matching Géodésique Haversine • Scellement OTS</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  Besoin vital urgent : 2 poches de sang O+. Le moteur HEMORA classe les donneurs volontaires les plus proches via la formule de Haversine. Le donneur sélectionné reçoit immédiatement 2 000 FCFA de défraiement Mobile Money et la preuve OTS est scellée sur Bitcoin.
                </p>
                <Button
                  size="lg"
                  onClick={onNextStep}
                  disabled={stepLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-lg shadow-emerald-950/60"
                >
                  {stepLoading ? "Matching et mobilisation..." : "Lancer le Matching HEMORA & Clôturer l'Urgence ➔"}
                </Button>
              </div>
            )}

            {/* Notification de rétroaction */}
            {scenarioMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-medium animate-in fade-in duration-300">
                {scenarioMessage}
              </div>
            )}
          </div>

          {/* Rétroaction visuelle Bris de Glace si déverrouillé */}
          {brisDeGlaceActive && brisDeGlaceData && (
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="font-bold text-rose-300 text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Profil Vital Déverrouillé en Mode Bris de Glace</span>
                </span>
                <Badge variant="destructive">Accès Tracé APDP</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Patiente :</span>{" "}
                  <strong className="text-white">{brisDeGlaceData.prenom} {brisDeGlaceData.nom}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Groupe :</span>{" "}
                  <strong className="text-rose-400 font-bold">{brisDeGlaceData.groupeSanguin}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Allergies :</span>{" "}
                  <strong className="text-white">{brisDeGlaceData.allergies?.join(", ") || "Aucune"}</strong>
                </div>
                <div>
                  <span className="text-slate-400">N° ARCH :</span>{" "}
                  <strong className="text-emerald-400 font-mono">{brisDeGlaceData.numeroArch}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Résultats du matching HEMORA */}
          {matchingResults.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-rose-500">🩸</span>
                <span>Donneurs Compatibles Mobilisés par Algorithme Haversine (Nikki / Kalalé)</span>
              </h4>
              <div className="space-y-2">
                {matchingResults.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">
                        {m.donneur.nomComplet} ({m.donneur.commune}) — Groupe :{" "}
                        <span className="text-rose-400 font-black">{m.donneur.groupeSanguin}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Distance : <strong>{m.distanceKm} km</strong> • Score Proximité : {m.scoreProximite}/100 • Bonus Assiduité : +{m.bonusAssiduite} pts
                      </p>
                    </div>
                    <Badge className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40 font-semibold">
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
  );
}
