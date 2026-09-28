"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Heart,
  QrCode,
  ShieldCheck,
  CheckCircle,
  Coins,
  History,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Droplet,
  CreditCard,
  AlertTriangle,
  Check,
  Building,
  Send,
  ExternalLink,
  Printer,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";
import { getPoleForCommune } from "@/data/communes";

type CitoyenModule = "carte" | "dons" | "defraiements" | "signalement";

type CitoyenCard = {
  id: CitoyenModule;
  title: string;
  badge: string;
  description: string;
  icon: typeof Heart;
  color: string;
  metric: string;
};

const CITOYEN_MODULES: CitoyenCard[] = [
  {
    id: "carte",
    title: "Carte Nationale de Santé & QR",
    badge: "Identité ANIP",
    description: "Dossier sanitaire unifié, groupe sanguin O+ et couverture ARCH 100%.",
    icon: QrCode,
    color: "from-pink-600 to-rose-700",
    metric: "NPI Actif • ARCH 100%",
  },
  {
    id: "dons",
    title: "Passeport Transfusionnel & Dons",
    badge: "Donneur O+",
    description: "Historique des dons de sang validés et preuves d'ancrage cryptographique OpenTimestamps.",
    icon: Heart,
    color: "from-red-600 to-rose-600",
    metric: "Éligible (> 60 jours)",
  },
  {
    id: "defraiements",
    title: "Défraiements MoMo Reçus",
    badge: "2 000 FCFA / Don",
    description: "Forfaits de déplacement versés sur compte Mobile Money (MTN / Moov) après chaque don.",
    icon: CreditCard,
    color: "from-amber-600 to-yellow-600",
    metric: "4 000 FCFA perçus",
  },
  {
    id: "signalement",
    title: "Signalement au Ministère",
    badge: "Inspection 24/7",
    description: "Signaler directement un abus, racket, absence de personnel ou refus de prise en charge.",
    icon: AlertTriangle,
    color: "from-purple-600 to-indigo-700",
    metric: "Ligne Directe Cabinet",
  },
];

export default function CitoyenDashboardPage(): ReactNode {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState<CitoyenModule | null>(null);

  const currentModule = CITOYEN_MODULES.find((m) => m.id === activeModule);

  // Modales interactives
  const [otsModalHash, setOtsModalHash] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [showCarteModal, setShowCarteModal] = useState<boolean>(false);

  // Formulaire de signalement rapide citoyen
  const [signalementEnvoye, setSignalementEnvoye] = useState(false);
  const [loadingSignalement, setLoadingSignalement] = useState(false);
  const [codeDossierGenere, setCodeDossierGenere] = useState("");
  const [erreurSignalement, setErreurSignalement] = useState("");
  const [etablissement, setEtablissement] = useState("Hôpital de Zone de Nikki");
  const [motif, setMotif] = useState("Exigence de caution financière illégale en urgence");
  const [description, setDescription] = useState("Refus d'admission sans paiement préalable de 20 000 FCFA.");

  const handleSendSignalement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSignalement(true);
    setErreurSignalement("");
    try {
      const res = await fetch("/api/v1/signalements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeInfraction: "EXIGENCE_CAUTION_ILLEGALE",
          etablissementNom: etablissement,
          description: `${motif} : ${description}`,
          declarantNpi: user?.npi,
          declarantNom: user ? `${user.prenom} ${user.nom}` : "Citoyen Bio GOUDA",
          declarantTelephone: user?.telephone || "+229 97 45 12 33",
          commune: user?.commune || "Nikki",
          gravite: "CRITIQUE",
          anonyme: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCodeDossierGenere(data.codeDossier || "PLN-2026-CIT-9821");
        setSignalementEnvoye(true);
      } else {
        setErreurSignalement(data.error || "Erreur lors de la transmission");
      }
    } catch (err: any) {
      setErreurSignalement(err.message || "Erreur de connexion");
    } finally {
      setLoadingSignalement(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* 1. Bannière de Bienvenue */}
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-4xl border border-pink-500/20 bg-gradient-to-r from-pink-950/40 via-background to-background backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-3xl bg-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-600/30">
            <Heart className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                Passeport Citoyen & Donneur
              </span>
              <span className="text-[11px] text-foreground/50">République du Bénin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
              Espace Citoyen & Donneur HEMORA
            </h1>
            <p className="text-xs sm:text-sm text-foreground/60">
              Citoyen : <strong className="text-foreground">{user?.prenom} {user?.nom}</strong> — NPI : <span className="font-mono text-pink-400">{user?.npi}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Assuré ARCH 100% (Tiers-Payant 0 F)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">
            <Droplet className="h-3.5 w-3.5" />
            <span>Donneur Universel O+</span>
          </span>
        </div>
      </FadeIn>

      {/* 2. SÉLECTION PAR CARDS OU VUE D'UN SERVICE UNIQUE */}
      {activeModule === null ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-foreground/8 pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
                Services & Prestations Citoyennes
              </h2>
              <p className="text-xs text-foreground/60">
                Sélectionnez un service ci-dessous pour ouvrir son espace dédié
              </p>
            </div>
            <span className="text-[11px] font-semibold text-pink-500 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
              4 services disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CITOYEN_MODULES.map((mod) => {
              const Icon = mod.icon;

              return (
                <div
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className="group relative flex flex-col justify-between rounded-3xl border border-foreground/10 bg-background/80 hover:border-pink-500/50 hover:bg-pink-500/5 p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-md overflow-hidden"
                >
                  <div
                    className={`absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br ${mod.color} opacity-10 group-hover:opacity-25 blur-2xl transition-opacity`}
                  />

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/80">
                        {mod.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground group-hover:text-pink-500 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-foreground/60 mt-1 leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-foreground/8 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-foreground/75 truncate max-w-[140px]">
                      {mod.metric}
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-1 text-pink-500 group-hover:translate-x-1 transition-all">
                      <span>Ouvrir l&apos;espace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* BARRE DE RETOUR ET DE CHANGEMENT DE SERVICE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModule(null)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold transition-all border border-foreground/10 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Tous les services</span>
              </button>

              {currentModule && (
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-foreground/10">
                  <div
                    className={`h-7 w-7 rounded-xl bg-gradient-to-br ${currentModule.color} flex items-center justify-center text-white`}
                  >
                    <currentModule.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">{currentModule.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/70 border border-foreground/10">
                    {currentModule.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Sélecteur direct de changement de service */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 hidden md:inline">Changer de service :</span>
              <select
                value={activeModule}
                onChange={(e) => setActiveModule(e.target.value as any)}
                className="rounded-2xl border border-foreground/15 bg-background px-3 py-2 text-xs text-foreground font-semibold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                {CITOYEN_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

      {/* MODULE 1 : CARTE NATIONALE DE SANTÉ */}
      {activeModule === "carte" && (
        <ScaleUnblur className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-4xl border border-pink-500/30 bg-gradient-to-br from-pink-950/30 to-background backdrop-blur-md shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
                  RÉPUBLIQUE DU BÉNIN • MINISTÈRE DE LA SANTÉ
                </span>
                <h2 className="text-xl font-bold text-foreground mt-0.5">Carte Nationale de Santé Dématérialisée</h2>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-black text-lg">
                O+
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 py-3 border-y border-foreground/10">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="h-28 w-28 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md">
                  <QRCodeSVG
                    value={`https://beninvie.bj/verify?token=CARTE-${user?.npi || "NPI-CIT-1995-1029"}`}
                    size={96}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <a
                  href={`/verify?token=CARTE-${user?.npi || "NPI-CIT-1995-1029"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-pink-400 hover:text-pink-300 font-bold underline flex items-center gap-1"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  Tester Guichet National
                </a>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <div className="font-bold text-foreground text-base">{user?.prenom} {user?.nom}</div>
                <div className="text-pink-400 font-mono text-xs">{user?.npi}</div>
                <div className="text-[11px] text-foreground/75 flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-pink-400" />
                  <span>Commune de {user?.commune} ({user?.departement}) • {getPoleForCommune(user?.commune || "").nom}</span>
                </div>
                <div className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Régime ARCH Actif : Prise en charge 100%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/8">
                <span className="text-[10px] text-foreground/50 block font-semibold">Statut Transfusionnel</span>
                <span className="font-bold text-emerald-500 text-sm mt-0.5 block">Éligible au don (&gt; 60 j)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/8">
                <span className="text-[10px] text-foreground/50 block font-semibold">Forfaits Transport Reçus</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">4 000 FCFA MoMo</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowCarteModal(true)}
                className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>Agrandir Carte & Scellé</span>
              </button>
              <button
                onClick={() => window.print()}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground/10 hover:bg-foreground/15 text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Attestation PDF</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/10 text-[11px] text-foreground/60 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Dossier chiffré et anonymisé selon la Loi 2017-20 sous contrôle APDP.</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 rounded-4xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Building className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-bold text-foreground">Établissements de Rattachement</h3>
              </div>
              <p className="text-xs text-foreground/60">
                Centres de santé primaires et hôpitaux de référence où votre dossier FHIR est synchronisé :
              </p>

              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-2xl border border-foreground/8 bg-foreground/3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Hôpital de Zone de Nikki</h4>
                    <span className="text-[10px] text-foreground/60">Centre chirurgical, maternité et banque de sang</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                    Référent
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border border-foreground/8 bg-foreground/3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Centre de Santé Communal de Kalalé</h4>
                    <span className="text-[10px] text-foreground/60">Soins primaires, CPN, vaccination et pharmacie ARCH</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                    Proximité
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>Numéro Vert d&apos;Urgence gratuit 24/7 :</span>
              <a href="tel:136" className="font-bold underline">Appeler le 136</a>
            </div>
          </div>
        </ScaleUnblur>
      )}

      {/* MODULE 2 : PASSEPORT TRANSFUSIONNEL & HISTORIQUE DONS */}
      {activeModule === "dons" && (
        <ScaleUnblur className="p-6 sm:p-8 rounded-4xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-foreground/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Historique des Dons & Ancrage Cryptographique</h3>
                <p className="text-xs text-foreground/60">Chaque don est certifié sur la blockchain Bitcoin (OpenTimestamps) pour traçabilité immuable</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 self-start sm:self-auto">
              2 dons validés
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-3xl border border-foreground/8 bg-foreground/3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">Don de Sang #DON-2026-1001</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                    Poche Validée O+
                  </span>
                </div>
                <p className="text-xs text-foreground/60 mt-1">Banque de Sang de l&apos;Hôpital de Zone de Nikki • 15 Janvier 2026</p>
                <button
                  onClick={() => setOtsModalHash("7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069")}
                  className="mt-1 text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Examiner le scellé Bitcoin OTS (7f83b165...)</span>
                </button>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-sm font-bold text-emerald-500">+2 000 FCFA</span>
                <span className="block text-[10px] text-foreground/50">Forfait MoMo versé</span>
              </div>
            </div>

            <div className="p-4 rounded-3xl border border-foreground/8 bg-foreground/3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">Don de Sang #DON-2025-0842</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                    Poche Validée O+
                  </span>
                </div>
                <p className="text-xs text-foreground/60 mt-1">Centre Communal de Basso • 12 Octobre 2025</p>
                <button
                  onClick={() => setOtsModalHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")}
                  className="mt-1 text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Examiner le scellé Bitcoin OTS (e3b0c442...)</span>
                </button>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-sm font-bold text-emerald-500">+2 000 FCFA</span>
                <span className="block text-[10px] text-foreground/50">Forfait MoMo versé</span>
              </div>
            </div>
          </div>
        </ScaleUnblur>
      )}

      {/* MODULE 3 : DÉFRAIEMENTS MOMO */}
      {activeModule === "defraiements" && (
        <ScaleUnblur className="p-6 sm:p-8 rounded-4xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Forfaits de Déplacement (Règle OMS & CNTS)</h3>
                <p className="text-xs text-foreground/60">Défraiement forfaitaire de 2 000 FCFA pour couvrir le transport du donneur</p>
              </div>
            </div>
            <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Total reçu : 4 000 FCFA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-3xl border border-foreground/8 bg-foreground/3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Versement MoMo #TRF-9821</span>
                <span className="text-[10px] font-bold text-emerald-500">Effectué</span>
              </div>
              <span className="text-xl font-bold text-foreground">2 000 FCFA</span>
              <p className="text-[11px] text-foreground/60">Transmis sur MTN Mobile Money (+229 97 45 12 33) suite au don #DON-2026-1001.</p>
              <button
                onClick={() =>
                  setSelectedReceipt({
                    id: "TRF-9821",
                    montant: "2 000 FCFA",
                    operateur: "MTN Mobile Money",
                    telephone: "+229 97 45 12 33",
                    date: "15 Janvier 2026",
                    motif: "Défraiement déplacement don bénévole #DON-2026-1001",
                    hash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                  })
                }
                className="mt-2 min-h-[36px] px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Voir Quittance MoMo Officielle</span>
              </button>
            </div>

            <div className="p-4 rounded-3xl border border-foreground/8 bg-foreground/3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Versement MoMo #TRF-7412</span>
                <span className="text-[10px] font-bold text-emerald-500">Effectué</span>
              </div>
              <span className="text-xl font-bold text-foreground">2 000 FCFA</span>
              <p className="text-[11px] text-foreground/60">Transmis sur Moov Money suite au don #DON-2025-0842 à Basso.</p>
              <button
                onClick={() =>
                  setSelectedReceipt({
                    id: "TRF-7412",
                    montant: "2 000 FCFA",
                    operateur: "Moov Money Bénin",
                    telephone: "+229 96 11 22 33",
                    date: "12 Octobre 2025",
                    motif: "Défraiement déplacement don bénévole #DON-2025-0842",
                    hash: "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                  })
                }
                className="mt-2 min-h-[36px] px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Voir Quittance MoMo Officielle</span>
              </button>
            </div>
          </div>
        </ScaleUnblur>
      )}

      {/* MODULE 4 : SIGNALEMENT DIRECT AU MINISTÈRE */}
      {activeModule === "signalement" && (
        <ScaleUnblur className="p-6 sm:p-8 rounded-4xl border border-red-500/30 bg-background/90 backdrop-blur-md shadow-xl flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
            <div className="h-10 w-10 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Signalement Citoyen d&apos;Urgence au Ministère</h3>
              <p className="text-xs text-foreground/60">
                Racket, exigence illégale de caution avant une urgence vitale, ou refus d&apos;appliquer la gratuité ARCH
              </p>
            </div>
          </div>

          {signalementEnvoye ? (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center text-center gap-3">
              <Check className="h-8 w-8 text-emerald-500" />
              <h4 className="text-base font-bold text-foreground">Signalement Transmis au Cabinet du Ministre</h4>
              <p className="text-xs text-foreground/75 max-w-lg">
                Votre dossier a été enregistré sous le numéro officiel <strong className="font-mono text-emerald-400">{codeDossierGenere}</strong>. L&apos;Inspection Générale des Services de Santé a été immédiatement alertée et l&apos;intervention est tracée dans le registre ministériel.
              </p>
              <button
                onClick={() => setSignalementEnvoye(false)}
                className="mt-2 text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
              >
                Faire un nouveau signalement
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendSignalement} className="flex flex-col gap-4">
              {erreurSignalement && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {erreurSignalement}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                  Établissement de Santé Concerné
                </label>
                <input
                  type="text"
                  value={etablissement}
                  onChange={(e) => setEtablissement(e.target.value)}
                  className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                  Motif de l&apos;Infraction
                </label>
                <select
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground focus:border-red-500 focus:outline-none cursor-pointer"
                >
                  <option value="Exigence de caution financière illégale en urgence">Exigence de caution financière illégale en urgence</option>
                  <option value="Refus d'application du tiers-payant ARCH (femme enceinte/indigent)">Refus d'application du tiers-payant ARCH (femme enceinte/indigent)</option>
                  <option value="Absentéisme ou abandon de poste du personnel soignant">Absentéisme ou abandon de poste du personnel soignant</option>
                  <option value="Trafic ou vente illicite de poches de sang CNTS">Trafic ou vente illicite de poches de sang CNTS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                  Description Précise des Faits
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-foreground/15 bg-background p-3 text-xs text-foreground focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingSignalement}
                className="mt-2 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs py-3 px-4 shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="h-4 w-4" />
                <span>{loadingSignalement ? "Transmission sécurisée en cours..." : "Transmettre immédiatement au Ministère de la Santé"}</span>
              </button>
            </form>
          )}
        </ScaleUnblur>
      )}
        </div>
      )}

      {/* MODALE 1 : CARTE NATIONALE DE SANTÉ PLEIN ÉCRAN & QR */}
      {showCarteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4"
          onClick={() => setShowCarteModal(false)}
        >
          <div
            className="w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-4xl border border-pink-500/40 bg-background p-5 sm:p-8 shadow-2xl flex flex-col gap-5 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-3 rounded-xs bg-[#008751]" />
                <div className="h-2.5 w-3 rounded-xs bg-[#FCD116]" />
                <div className="h-2.5 w-3 rounded-xs bg-[#E8112D]" />
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest ml-1">
                  RÉPUBLIQUE DU BÉNIN • MINISTÈRE DE LA SANTÉ
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400">
                Carte Dématérialisée
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-2xl bg-pink-600 text-white flex flex-col items-center justify-center shadow-lg shadow-pink-600/30">
                <span className="text-[10px] font-bold uppercase opacity-80 leading-none">Groupe</span>
                <span className="text-2xl font-black leading-none mt-0.5">O+</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {user?.prenom} {user?.nom}
              </h3>
              <p className="text-xs font-mono text-pink-400 break-all">{user?.npi}</p>
            </div>

            {/* Grand QR Code scannable */}
            <div className="p-4 rounded-3xl bg-white border-2 border-pink-500/30 shadow-inner flex flex-col items-center justify-center mx-auto max-w-full">
              <QRCodeSVG
                value={`https://beninvie.bj/verify?token=CARTE-${user?.npi || "NPI-CIT-1995-1029"}`}
                size={180}
                level="M"
                className="max-w-full h-auto"
              />
              <div className="mt-2 text-[10px] font-mono text-zinc-800 font-bold break-all">
                CNS-BJ-{user?.npi} • SCELLÉ ANIP
              </div>
            </div>

            <a
              href={`/verify?token=CARTE-${user?.npi || "NPI-CIT-1995-1029"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-bold text-pink-500 hover:underline"
            >
              <span>Tester le guichet de contrôle national (/verify)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left">
              <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8">
                <span className="text-[10px] text-foreground/50 block">Régime ARCH</span>
                <span className="font-bold text-emerald-400">100% Pris en Charge</span>
              </div>
              <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8">
                <span className="text-[10px] text-foreground/50 block">Rattachement</span>
                <span className="font-bold text-foreground">{user?.commune} ({user?.departement})</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Imprimer la Carte</span>
              </button>
              <button
                onClick={() => setShowCarteModal(false)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-xs font-bold text-foreground transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE 2 : PREUVE CRYPTOGRAPHIQUE OPENTIMESTAMPS */}
      {otsModalHash && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4"
          onClick={() => setOtsModalHash(null)}
        >
          <div
            className="w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-4xl border border-rose-500/30 bg-background p-4 sm:p-8 shadow-2xl flex flex-col gap-4 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-foreground/10 pb-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Attestation Immuable OpenTimestamps</h4>
                <p className="text-[11px] text-foreground/60">Ancrage cryptographique sur la blockchain Bitcoin</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8">
                <span className="text-[10px] text-foreground/50 block font-semibold">Empreinte SHA-256 du Don</span>
                <span className="font-mono text-[11px] text-rose-400 break-all select-all font-semibold">
                  {otsModalHash}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8">
                  <span className="text-[10px] text-foreground/50 block">Réseau Public</span>
                  <span className="font-bold text-foreground">Bitcoin Mainnet</span>
                </div>
                <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8">
                  <span className="text-[10px] text-foreground/50 block">Statut d&apos;Horodatage</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Confirmé Immuable</span>
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8 text-[11px] text-foreground/70 leading-relaxed">
                Ce scellé mathématique garantit l&apos;existence et l&apos;intégrité de la poche de sang prélevée sans divulguer l&apos;identité nominative du donneur, conformément aux exigences de l&apos;APDP (Loi n° 2017-20).
              </div>
            </div>

            <button
              onClick={() => setOtsModalHash(null)}
              className="min-h-[44px] mt-2 w-full py-2.5 rounded-2xl bg-foreground/10 hover:bg-foreground/15 text-xs font-bold text-foreground transition-colors cursor-pointer flex items-center justify-center"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MODALE 3 : QUITTANCE DE VERSEMENT MOBILE MONEY */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-4xl border border-amber-500/40 bg-background p-5 sm:p-8 shadow-2xl flex flex-col gap-4 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                    REÇU OFFICIEL DE DÉFRAIEMENT
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    CNTS • RÉPUBLIQUE DU BÉNIN
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                Versé
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Identifiant Transaction :</span>
                <span className="font-mono font-bold text-foreground">{selectedReceipt.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Montant Forfaitaire :</span>
                <span className="text-base font-black text-emerald-400">{selectedReceipt.montant}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Opérateur / Canal :</span>
                <span className="font-semibold text-foreground">{selectedReceipt.operateur}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Numéro Bénéficiaire :</span>
                <span className="font-mono text-foreground">{selectedReceipt.telephone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Date & Heure :</span>
                <span className="text-foreground">{selectedReceipt.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Motif Réglementaire :</span>
                <span className="text-[11px] text-foreground/80 font-medium">{selectedReceipt.motif}</span>
              </div>
            </div>

            {/* QR Code Scannable */}
            <div className="p-3 rounded-2xl bg-white border border-amber-500/30 flex flex-col items-center justify-center text-center">
              <QRCodeSVG
                value={`https://beninvie.bj/verify?token=GBESSOKE-${selectedReceipt.id}`}
                size={110}
                level="M"
                includeMargin={false}
              />
              <span className="text-[9px] font-mono text-zinc-700 font-bold mt-1">
                Scellé Trésor Public • {selectedReceipt.id}
              </span>
            </div>

            <div className="flex gap-2 pt-2 border-t border-foreground/10">
              <button
                onClick={() => window.print()}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Imprimer Quittance</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-xs font-bold text-foreground transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
