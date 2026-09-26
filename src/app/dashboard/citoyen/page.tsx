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
} from "lucide-react";
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

  // Formulaire de signalement rapide citoyen
  const [signalementEnvoye, setSignalementEnvoye] = useState(false);
  const [etablissement, setEtablissement] = useState("Hôpital de Zone de Nikki");
  const [motif, setMotif] = useState("Exigence de caution financière illégale en urgence");
  const [description, setDescription] = useState("Refus d'admission sans paiement préalable de 20 000 FCFA.");

  const handleSendSignalement = (e: React.FormEvent) => {
    e.preventDefault();
    setSignalementEnvoye(true);
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
              <div className="h-28 w-28 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-md">
                <QrCode className="h-full w-full text-black" />
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
                <p className="text-[10px] font-mono text-foreground/45 mt-0.5">
                  Ancrage OTS : 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </p>
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
                <p className="text-[10px] font-mono text-foreground/45 mt-0.5">
                  Ancrage OTS : e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </p>
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
            </div>

            <div className="p-4 rounded-3xl border border-foreground/8 bg-foreground/3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Versement MoMo #TRF-7412</span>
                <span className="text-[10px] font-bold text-emerald-500">Effectué</span>
              </div>
              <span className="text-xl font-bold text-foreground">2 000 FCFA</span>
              <p className="text-[11px] text-foreground/60">Transmis sur Moov Money suite au don #DON-2025-0842 à Basso.</p>
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
                Votre dossier a été enregistré sous le numéro officiel <strong className="font-mono text-emerald-400">PLN-2026-CIT-9821</strong>. L&apos;Inspection Générale des Services de Santé a été immédiatement alertée.
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
                className="mt-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-3 px-4 shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Transmettre immédiatement au Ministère de la Santé</span>
              </button>
            </form>
          )}
        </ScaleUnblur>
      )}
        </div>
      )}
    </main>
  );
}
