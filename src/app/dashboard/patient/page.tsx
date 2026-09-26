"use client";

import { useState, useEffect, type ReactNode } from "react";
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
  Activity,
  FileText,
  User,
  Baby,
  Pill,
  Droplet,
  Download,
  AlertCircle,
  Eye,
  CreditCard,
  Building,
  AlertTriangle,
  Send,
  Megaphone,
  Check,
  ArrowRight,
  ArrowLeft,
  Award,
  Zap,
  PhoneCall,
  CheckCheck,
  Share2,
  Lock,
} from "lucide-react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";

type PatientModuleCard = {
  id: "constantes" | "consultations" | "ordonnances" | "social" | "hemora" | "denonciation";
  title: string;
  badge: string;
  description: string;
  icon: typeof Activity;
  color: string;
  metric: string;
};

const PATIENT_MODULES: PatientModuleCard[] = [
  {
    id: "constantes",
    title: "Constantes & Observations FHIR",
    badge: "Biométrie FHIR",
    description: "Tension artérielle, périmètre brachial, hauteur utérine et constantes vitales.",
    icon: Activity,
    color: "from-emerald-600 to-teal-700",
    metric: "115/75 mmHg • 34 SA",
  },
  {
    id: "consultations",
    title: "Consultations & Visites ASC",
    badge: "Suivi Prénatal",
    description: "Visites prénatales CPN1 à CPN3 au CSC Kalalé et carnet d'observations.",
    icon: Calendar,
    color: "from-blue-600 to-indigo-700",
    metric: "CPN3 validée (Kalalé)",
  },
  {
    id: "ordonnances",
    title: "Ordonnances Sécurisées QR",
    badge: "Scellé ANIP",
    description: "Prescriptions numériques scellées, Fer Folate 60mg et pharmacopée MTA.",
    icon: Pill,
    color: "from-purple-600 to-indigo-600",
    metric: "2 ordonnances actives",
  },
  {
    id: "social",
    title: "Assurance ARCH (100% Gratuit)",
    badge: "0 FCFA Tiers-Payant",
    description: "Prise en charge intégrale de l'État et protocole de paiement différé.",
    icon: ShieldCheck,
    color: "from-amber-600 to-yellow-600",
    metric: "Régime ARCH Actif",
  },
  {
    id: "hemora",
    title: "Passeport Donneur HEMORA",
    badge: "Donneur O+",
    description: "Carte transfusionnelle, contrôle 60 jours et 400 Points Santé réductibles en pharmacie.",
    icon: Heart,
    color: "from-pink-600 to-rose-600",
    metric: "400 Pts Pharmacie (-4 000 F)",
  },
  {
    id: "denonciation",
    title: "Signalement au Ministère",
    badge: "Inspection 24/7",
    description: "Dénoncer racket, absence de personnel ou exigence illégale de caution.",
    icon: AlertTriangle,
    color: "from-red-600 to-rose-700",
    metric: "Transmission Cabinet",
  },
];

export default function PatientDashboardPage(): ReactNode {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "constantes" | "consultations" | "ordonnances" | "social" | "hemora" | "denonciation" | null
  >(null);

  const currentModule = PATIENT_MODULES.find((m) => m.id === activeTab);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as any;
      if (
        tabParam &&
        ["constantes", "consultations", "ordonnances", "social", "hemora", "denonciation"].includes(
          tabParam
        )
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // États interactifs HEMORA & Passeport Donneur
  const [showHemoraCardModal, setShowHemoraCardModal] = useState(false);
  const [pointsSanteBalance, setPointsSanteBalance] = useState(400);
  const [bonPharmacieGenere, setBonPharmacieGenere] = useState(false);
  const [bonPharmacieLoading, setBonPharmacieLoading] = useState(false);
  const [showBonPharmacieModal, setShowBonPharmacieModal] = useState(false);
  const [otsModalHash, setOtsModalHash] = useState<string | null>(null);
  const [urgenceVolontaireEnregistre, setUrgenceVolontaireEnregistre] = useState(false);
  const [copiedCardNumber, setCopiedCardNumber] = useState(false);

  // Ordonnance sélectionnée pour modal / zoom
  const [showQrModal, setShowQrModal] = useState<string | null>(null);

  // Formulaire de Dénonciation / Signalement au Ministère
  const [typeInfraction, setTypeInfraction] = useState("EXIGENCE_CAUTION_ILLEGALE");
  const [etablissementCible, setEtablissementCible] = useState("Hôpital de Zone de Nikki");
  const [communeFaits, setCommuneFaits] = useState("Nikki");
  const [departementFaits, setDepartementFaits] = useState("Borgou");
  const [dateFaits, setDateFaits] = useState("2026-03-24");
  const [descriptionFaits, setDescriptionFaits] = useState(
    "Un agent a exigé une caution de 25 000 FCFA avant d'admettre un patient en urgence vitale, en violation du protocole d'État Zéro Refus."
  );
  const [anonyme, setAnonyme] = useState(false);
  const [graviteSignalement, setGraviteSignalement] = useState("CRITIQUE");
  const [loadingSignalement, setLoadingSignalement] = useState(false);
  const [signalementSuccess, setSignalementSuccess] = useState<any | null>(null);
  const [mesSignalements, setMesSignalements] = useState<any[]>([
    {
      codeDossier: "PLN-2026-MIN-001",
      typeInfractionLabel: "Exigence de caution financière préalable en urgence vitale",
      etablissementNom: "Hôpital de Zone de Nikki",
      commune: "Nikki",
      dateFaits: "2026-03-24",
      statut: "INSPECTEUR_DEPECHE",
      reponseMinistere:
        "Inspection Générale de la Santé saisie. Rappel à l'ordre formel notifié à la direction de l'établissement avec instruction de sanctions conservatoires.",
    },
  ]);

  const handleSendSignalement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSignalement(true);
    try {
      const res = await fetch("/api/v1/signalements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeInfraction,
          etablissementNom: etablissementCible,
          commune: communeFaits,
          departement: departementFaits,
          dateFaits,
          description: descriptionFaits,
          anonyme,
          declarantNpi: user?.npi || "NPI-BEN-1998-0412-8871",
          declarantNom: `${user?.prenom || "Bio"} ${user?.nom || "GOUDA"}`,
          declarantTelephone: "+229 97 45 12 33",
          gravite: graviteSignalement,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSignalementSuccess(data);
        setMesSignalements((prev) => [data.signalement, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSignalement(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* 1. CARTE D'IDENTITÉ PATIENT & EN-TÊTE FHIR */}
      <FadeIn className="p-6 sm:p-8 rounded-4xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-background to-background backdrop-blur-md shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-600/30">
              BG
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-background">
              <Check className="h-3 w-3" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Carnet de Santé HL7 FHIR
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center gap-1">
                <Baby className="h-3 w-3" /> Maternité : 32 SA (7 mois)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {user?.prenom || "Bio"} {user?.nom || "GOUDA"}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/70">
              <span className="font-mono text-emerald-400 font-semibold">
                NPI : {user?.npi || "NPI-BEN-1998-0412-8871"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-500" />
                Village de Basso, Commune de Kalalé (Borgou)
              </span>
            </div>
          </div>
        </div>

        {/* Badges de Droits & Couverture */}
        <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Régime ARCH : Tiers-Payant 100%</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
            <Droplet className="h-3.5 w-3.5" />
            <span>Groupe Sanguin : O+ (Donneur)</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
            <Building className="h-3.5 w-3.5" />
            <span>Zone : Hôpital Nikki & CSC Kalalé</span>
          </div>
        </div>
      </FadeIn>

      {/* 2. SÉLECTION PAR CARDS OU VUE D'UN DOMAINE UNIQUE */}
      {activeTab === null ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-foreground/8 pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
                Modules & Dossiers du Patient
              </h2>
              <p className="text-xs text-foreground/60">
                Sélectionnez un domaine ci-dessous pour ouvrir son espace dédié
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
              6 modules disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PATIENT_MODULES.map((mod) => {
              const Icon = mod.icon;

              return (
                <div
                  key={mod.id}
                  onClick={() => setActiveTab(mod.id)}
                  className="group relative flex flex-col justify-between rounded-3xl border border-foreground/10 bg-background/80 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-md overflow-hidden"
                >
                  {/* Lueur d'ambiance */}
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

                    <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-foreground/60 mt-1 leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-foreground/8 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-foreground/75 truncate max-w-[170px]">
                      {mod.metric}
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-1 text-emerald-500 group-hover:translate-x-1 transition-all">
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
          {/* BARRE DE NAVIGATION DU DOMAINE UNIQUE SÉLECTIONNÉ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab(null)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold transition-all border border-foreground/10 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Tous les modules</span>
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

            {/* Sélecteur direct pour naviguer entre domaines */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 hidden md:inline">Changer de domaine :</span>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="rounded-2xl border border-foreground/15 bg-background px-3 py-2 text-xs text-foreground font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {PATIENT_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

      {/* ONGLET 1 : CONSTANTES VITALES FHIR */}
      {activeTab === "constantes" && (
        <ScaleUnblur className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md">
              <span className="text-xs uppercase font-semibold text-foreground/50">Tension Artérielle</span>
              <div className="text-2xl font-bold text-foreground mt-1">115 / 75 <span className="text-xs font-normal text-foreground/60">mmHg</span></div>
              <p className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" /> Tension normale au repos
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md">
              <span className="text-xs uppercase font-semibold text-foreground/50">Périmètre Brachial (PB)</span>
              <div className="text-2xl font-bold text-foreground mt-1">24.5 <span className="text-xs font-normal text-foreground/60">cm</span></div>
              <p className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" /> Statut nutritionnel satisfaisant
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md">
              <span className="text-xs uppercase font-semibold text-foreground/50">Hauteur Utérine</span>
              <div className="text-2xl font-bold text-pink-400 mt-1">28 <span className="text-xs font-normal text-foreground/60">cm</span></div>
              <p className="text-[11px] text-foreground/60 mt-1">Croissance fœtale harmonieuse (32 SA)</p>
            </div>

            <div className="p-5 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md">
              <span className="text-xs uppercase font-semibold text-foreground/50">Taux d&apos;Hémoglobine (Hb)</span>
              <div className="text-2xl font-bold text-amber-500 mt-1">10.8 <span className="text-xs font-normal text-foreground/60">g/dL</span></div>
              <p className="text-[11px] text-amber-500 mt-1">Suppléments Fer/Acide folique prescrits</p>
            </div>
          </div>

          {/* Tableau détaillé des observations */}
          <div className="rounded-3xl border border-foreground/10 bg-background/80 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-foreground/10 flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Historique des Observations Cliniques HL7 FHIR</h3>
              <span className="text-xs text-foreground/50">Norme internationale FHIR R4</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-foreground/5 text-foreground/60 uppercase">
                  <tr>
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Paramètre Observé</th>
                    <th className="py-3 px-4">Valeur Mesurée</th>
                    <th className="py-3 px-4">Interprétation</th>
                    <th className="py-3 px-4">Praticien / Structure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  <tr className="hover:bg-foreground/2">
                    <td className="py-3 px-4 font-mono text-foreground/70">18 Mars 2026</td>
                    <td className="py-3 px-4 font-semibold text-foreground">Périmètre Brachial (PB)</td>
                    <td className="py-3 px-4 font-bold text-emerald-500">24.5 cm</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Normal</span></td>
                    <td className="py-3 px-4 text-foreground/75">Salimata Biaou (ASC Kalalé)</td>
                  </tr>
                  <tr className="hover:bg-foreground/2">
                    <td className="py-3 px-4 font-mono text-foreground/70">18 Mars 2026</td>
                    <td className="py-3 px-4 font-semibold text-foreground">Tension Artérielle</td>
                    <td className="py-3 px-4 font-bold text-foreground">115 / 75 mmHg</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Normal</span></td>
                    <td className="py-3 px-4 text-foreground/75">Salimata Biaou (ASC Kalalé)</td>
                  </tr>
                  <tr className="hover:bg-foreground/2">
                    <td className="py-3 px-4 font-mono text-foreground/70">10 Février 2026</td>
                    <td className="py-3 px-4 font-semibold text-foreground">Glycémie à jeun</td>
                    <td className="py-3 px-4 font-bold text-foreground">0.86 g/L</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Normal</span></td>
                    <td className="py-3 px-4 text-foreground/75">Centre de Santé Communal de Kalalé</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ScaleUnblur>
      )}

      {/* ONGLET 2 : CONSULTATIONS & ENCOUNTERS */}
      {activeTab === "consultations" && (
        <ScaleUnblur className="flex flex-col gap-4">
          <div className="p-6 rounded-3xl border border-foreground/10 bg-background/80 flex flex-col gap-4">
            <h3 className="font-bold text-base text-foreground">Parcours de Soins & Rencontres Médicales</h3>

            <div className="relative pl-6 border-l-2 border-emerald-500/30 flex flex-col gap-6">
              {/* Étape 1 : Visite ASC */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
                <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400">Visite Communautaire à Domicile (PWA Offline)</span>
                    <span className="font-mono text-foreground/50">18 Mars 2026</span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-1.5 font-medium">
                    Praticien : Salimata BIAOU (ASC Kalalé) • Village de Basso
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Contrôle des signes vitaux pré-CPN3, vérification de la prise des suppléments fer/acide folique, remise de la carte de santé avec QR code.
                  </p>
                </div>
              </div>

              {/* Étape 2 : CPN3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-blue-500 border-2 border-background" />
                <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-400">Consultation Prénatale (CPN 3)</span>
                    <span className="font-mono text-foreground/50">20 Mars 2026</span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-1.5 font-medium">
                    Centre de Santé Communal de Kalalé • Sage-Femme d&apos;État
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Échographie obstétricale sommaire, dépistage du paludisme, émission de l&apos;ordonnance certifiée MTA et déclenchement automatique du transfert GBESSOKE (5 000 FCFA).
                  </p>
                </div>
              </div>

              {/* Étape 3 : Urgence Vitale & Bris de Glace */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-red-500 border-2 border-background" />
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-red-500">Admission d&apos;Urgence Vitale (Mode Bris de Glace)</span>
                    <span className="font-mono text-foreground/50">Jour de Démonstration</span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-1.5 font-medium">
                    Hôpital de Zone de Nikki • Dr. Bienvenu MENSAH (Urgentiste)
                  </p>
                  <p className="text-xs text-foreground/70 mt-1">
                    Survenue d&apos;une urgence hémorragique obstétricale. Admission immédiate sans avance financière garantie par l&apos;État, déverrouillage tracé APDP et activation de la chaîne transfusionnelle HEMORA (2 poches O+).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScaleUnblur>
      )}

      {/* ONGLET 3 : ORDONNANCES SÉCURISÉES QR */}
      {activeTab === "ordonnances" && (
        <ScaleUnblur className="flex flex-col gap-6">
          {/* BANNIÈRE LIAISON PHARMACIE & CRÉDIT POINTS DONNEUR HEMORA */}
          <div className="p-5 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-background to-background backdrop-blur-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Pill className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                    Officine Conventionnée : Pharmacie Communale de Nikki
                  </span>
                  <span className="text-[10px] text-foreground/50">Tiers-Payant ARCH & Points HEMORA</span>
                </div>
                <h4 className="text-sm font-bold text-foreground mt-0.5">
                  Délivrance Sécurisée en Pharmacie • Vos Points Donneur sont utilisables ici
                </h4>
                <p className="text-xs text-foreground/60">
                  En plus de la gratuité ARCH, vos <strong>{pointsSanteBalance} Points Santé</strong> (crédit de {pointsSanteBalance * 10} FCFA) déduisent tout reste à charge sur vos médicaments.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("hemora")}
              className="px-4 py-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              Gérer mes Points Donneur ({pointsSanteBalance} pts)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ordonnance 1 : MTA Certifié ARS */}
          <div className="p-6 rounded-3xl border border-amber-500/30 bg-background/80 backdrop-blur-md shadow-lg flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
                  Phytothérapie MTA Certifiée ARS
                </span>
                <span className="text-xs font-mono text-foreground/50">#ORD-2026-001</span>
              </div>

              <h4 className="text-base font-bold text-foreground">MALARIS-MTA (Cassia occidentalis)</h4>
              <p className="text-xs text-foreground/60 mt-1">Prescrit par le Centre de Santé Communal de Kalalé</p>

              <div className="mt-4 p-3 rounded-2xl bg-foreground/5 text-xs text-foreground/80">
                <strong>Posologie :</strong> 1 sachet en décoction 3 fois par jour pendant 5 jours.
              </div>
            </div>

            <div className="pt-4 border-t border-foreground/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-500">Pris en charge ARCH (0 FCFA)</span>
              </div>
              <button
                onClick={() => setShowQrModal("ORD-2026-001")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Afficher QR</span>
              </button>
            </div>
          </div>

          {/* Ordonnance 2 : Traitement Préventif Paludisme & MILD */}
          <div className="p-6 rounded-3xl border border-blue-500/30 bg-background/80 backdrop-blur-md shadow-lg flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase">
                  Conventionnelle • Gratuité PEV/CPN
                </span>
                <span className="text-xs font-mono text-foreground/50">#ORD-2026-002</span>
              </div>

              <h4 className="text-base font-bold text-foreground">Fer + Acide Folique + Moustiquaire MILDA</h4>
              <p className="text-xs text-foreground/60 mt-1">Programme National de Santé de la Mère et de l&apos;Enfant</p>

              <div className="mt-4 p-3 rounded-2xl bg-foreground/5 text-xs text-foreground/80">
                <strong>Posologie :</strong> 1 comprimé par jour jusqu&apos;à l&apos;accouchement. Dormir sous MILDA imprégnée.
              </div>
            </div>

            <div className="pt-4 border-t border-foreground/10 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-500">Gratuité d&apos;État (0 FCFA)</span>
              <button
                onClick={() => setShowQrModal("ORD-2026-002")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Afficher QR</span>
              </button>
            </div>
          </div>
          </div>
        </ScaleUnblur>
      )}

      {/* ONGLET 4 : PROTECTION SOCIALE ARCH & GBESSOKE */}
      {activeTab === "social" && (
        <ScaleUnblur className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 : Régime ARCH */}
          <div className="p-6 rounded-3xl border border-emerald-500/30 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ARCH
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Assurance Maladie ARCH (Tiers-Payant)</h3>
                <p className="text-xs text-foreground/60">Protection sociale universelle du Bénin</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground/70">Statut d&apos;affiliation :</span>
                <span className="font-bold text-emerald-400">Actif & Vérifié ANIP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/70">Taux de prise en charge :</span>
                <span className="font-bold text-emerald-400">100% (Panier Essentiel)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/70">Reste à charge patient :</span>
                <span className="font-bold text-emerald-400">0 FCFA</span>
              </div>
            </div>

            <p className="text-xs text-foreground/60 leading-relaxed">
              Vos consultations, médicaments essentiels et actes d&apos;urgence vitale sont intégralement pris en charge dans les formations sanitaires conventionnées.
            </p>
          </div>

          {/* Card 2 : Transfert Monétaire Fléché GBESSOKE */}
          <div className="p-6 rounded-3xl border border-amber-500/30 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Filet Social GBESSOKE</h3>
                <p className="text-xs text-foreground/60">Transferts monétaires incitatifs de nutrition</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground/70">Dernier versement reçu :</span>
                <span className="font-bold text-amber-500">+5 000 FCFA (MTN MoMo)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/70">Motif de déclenchement :</span>
                <span className="font-bold text-foreground">Validation CPN3 à Kalalé</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/70">Réf Transaction :</span>
                <span className="font-mono text-foreground/60">GBESSOKE-CPN3-2026</span>
              </div>
            </div>

            <p className="text-xs text-foreground/60 leading-relaxed">
              Ce soutien financier direct est accordé à chaque étape validée du parcours maternel pour garantir une nutrition optimale de la mère et du nouveau-né.
            </p>
          </div>
        </ScaleUnblur>
      )}

      {/* ONGLET 5 : PASSEPORT DONNEUR HEMORA & CARTE NUMÉRIQUE COMPLÈTE */}
      {activeTab === "hemora" && (
        <ScaleUnblur className="flex flex-col gap-6">
          {/* 1. CARTE NUMÉRIQUE OFFICIELLE CNTS & ÉLIGIBILITÉ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CARTE BIOMÉTRIQUE DIGITALE HEMORA */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-4xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-background to-background backdrop-blur-md shadow-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
              {/* Lueur d'ambiance */}
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />

              <div>
                {/* En-tête officiel de la carte avec drapeau tricolore */}
                <div className="flex items-start justify-between gap-4 border-b border-rose-500/20 pb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-3 rounded-xs bg-[#008751]" title="Vert" />
                      <div className="h-2 w-3 rounded-xs bg-[#FCD116]" title="Jaune" />
                      <div className="h-2 w-3 rounded-xs bg-[#E8112D]" title="Rouge" />
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-1">
                        RÉPUBLIQUE DU BÉNIN • MINISTÈRE DE LA SANTÉ
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                      CENTRE NATIONAL DE TRANSFUSION SANGUINE (CNTS)
                    </h3>
                    <p className="text-[11px] text-foreground/60 font-medium">
                      Passeport Numérique & Carte Transfusionnelle Sécurisée • Réseau HEMORA
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-600/30 border border-white/20">
                      <span className="text-[10px] font-bold uppercase leading-none opacity-80">Groupe</span>
                      <span className="text-xl font-black leading-none mt-0.5">O+</span>
                    </div>
                    <span className="text-[9px] font-bold text-rose-400 mt-1 uppercase">Universel</span>
                  </div>
                </div>

                {/* Corps de la carte : QR scellé + Identité ANIP */}
                <div className="flex flex-col sm:flex-row items-center gap-6 py-5">
                  <div
                    onClick={() => setShowHemoraCardModal(true)}
                    className="group relative cursor-pointer shrink-0 rounded-2xl bg-white p-3 shadow-xl border-2 border-rose-500/30 hover:border-rose-500 transition-all"
                    title="Cliquer pour agrandir le QR Code de prélèvement"
                  >
                    <QrCode className="h-32 w-32 text-black transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <span className="block text-[9px] font-mono text-zinc-700 text-center font-bold mt-1">
                      Scellé ANIP Valide
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 w-full text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">
                        Titulaire du Passeport
                      </span>
                      <h4 className="text-lg font-black text-foreground">
                        {user?.prenom || "Sabi"} {user?.nom || "KORA"}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[10px] text-foreground/50 block">NPI Biométrique</span>
                        <span className="font-mono text-xs font-bold text-rose-400">
                          {user?.npi || "NPI-CIT-1995-1029"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-foreground/50 block">Commune d&apos;attache</span>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-rose-400 shrink-0" />
                          <span>{user?.commune || "Nikki"} ({user?.departement || "Borgou"})</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-foreground/50 block">N° Carte HEMORA</span>
                        <span className="font-mono text-[11px] font-semibold text-foreground/80">
                          HEMORA-BJ-2026-O-8871
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-foreground/50 block">Validité Certifiée</span>
                        <span className="font-semibold text-emerald-400">2026 - 2030 (Actif)</span>
                      </div>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Biométrie ANIP Homologuée</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                        <Lock className="h-3 w-3" />
                        <span>Protection Salée APDP</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre d'actions rapides sur la carte */}
              <div className="pt-4 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHemoraCardModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Agrandir la Carte & QR</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("HEMORA-BJ-2026-O-8871");
                      setCopiedCardNumber(true);
                      setTimeout(() => setCopiedCardNumber(false), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/80 border border-foreground/10 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {copiedCardNumber ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">N° Copié !</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Copier N° Carte</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => alert("Génération du certificat PDF sécurisé du CNTS signée avec scellé ANIP.")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-foreground text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Attestation PDF Officielle</span>
                </button>
              </div>
            </div>

            {/* VOLET DROIT : ÉLIGIBILITÉ MÉDICALE & FORFAIT MOMO */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-5">
              {/* Carte 1 : Statut d'Aptitude Médicale */}
              <div className="p-6 rounded-3xl border border-emerald-500/30 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Éligibilité Médicale au Don</h4>
                      <p className="text-[11px] text-foreground/60">Contrôle biologique & délai OMS de 60 jours</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    APTE AU DON
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Dernier don enregistré :</span>
                    <span className="font-bold text-foreground">15 Janvier 2026 (70 jours)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Délai réglementaire (&gt; 60 j) :</span>
                    <span className="font-bold text-emerald-400">Respecté (+10 jours de battement)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Tension artérielle récente :</span>
                    <span className="font-mono font-bold text-foreground">115/75 mmHg (Optimale)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Hémoglobine estimée :</span>
                    <span className="font-mono font-bold text-foreground">14.2 g/dL (&gt; 12.5 requis)</span>
                  </div>
                </div>

                <div className="text-[11px] text-foreground/60 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>Centre de collecte attitré : <strong>Banque de Sang de l&apos;Hôpital de Zone de Nikki</strong></span>
                </div>
              </div>

              {/* Carte 2 : Points Santé & Réduction Médicaments en Pharmacie */}
              <div className="p-6 rounded-3xl border border-emerald-500/30 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Pill className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Points Santé & Bon Pharmacie</h4>
                      <p className="text-[11px] text-foreground/60">Défraiement éthique transformé en réduction médicaments</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {pointsSanteBalance} Pts (-{pointsSanteBalance * 10} F)
                  </span>
                </div>

                <p className="text-xs text-foreground/70 leading-relaxed">
                  Conformément aux règles d&apos;éthique transfusionnelle de l&apos;OMS et du CNTS, le don de sang n&apos;est pas rémunéré en argent liquide. En reconnaissance républicaine, chaque don validé vous octroie <strong>200 Points Santé</strong>, directement déductibles de vos achats de médicaments dans les officines conventionnées.
                </p>

                <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Solde de Points Santé :</span>
                    <span className="font-bold text-foreground font-mono">{pointsSanteBalance} Points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Valeur de réduction officinale :</span>
                    <span className="font-bold text-emerald-400 font-mono">-{pointsSanteBalance * 10} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Officine conventionnée partenaire :</span>
                    <span className="font-semibold text-foreground">Pharmacie Communale de Nikki</span>
                  </div>
                </div>

                {bonPharmacieGenere ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
                    <div className="flex items-center gap-2">
                      <CheckCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold block">Bon Officinal Activé : #BON-PHARMA-8871</span>
                        <span className="text-[11px] text-foreground/70">Présentez ce code ou le QR à la pharmacie pour -2 000 FCFA</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBonPharmacieModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                    >
                      Afficher QR
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setBonPharmacieLoading(true);
                      setTimeout(() => {
                        setBonPharmacieLoading(false);
                        setBonPharmacieGenere(true);
                        setShowBonPharmacieModal(true);
                      }, 700);
                    }}
                    disabled={bonPharmacieLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {bonPharmacieLoading ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Création du Bon Pharmacie...</span>
                      </>
                    ) : (
                      <>
                        <Pill className="h-3.5 w-3.5" />
                        <span>Générer un Bon Pharmacie (-2 000 FCFA / 200 Pts)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. RADAR D'URGENCE TRANSFUSIONNELLE LOCALE (APPELS AUX DONS IMMÉDIATS) */}
          <div className="p-6 rounded-4xl border border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-background to-background backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Alerte Vitale En Cours
                  </span>
                  <span className="text-xs text-foreground/50">Rayon : 3.2 km</span>
                </div>
                <h4 className="text-base font-bold text-foreground">
                  Hôpital de Zone de Nikki — Besoin Urgent de Culots O+
                </h4>
                <p className="text-xs text-foreground/60 max-w-2xl">
                  Urgence obstétricale en cours (Césarienne de secours). Votre groupe O+ est compatible. Votre engagement peut sauver 2 vies dans les 30 prochaines minutes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {urgenceVolontaireEnregistre ? (
                <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Volontaire Enregistré • Priorité 136 Accordée</span>
                </div>
              ) : (
                <button
                  onClick={() => setUrgenceVolontaireEnregistre(true)}
                  className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-white" />
                  <span>Se Porter Volontaire</span>
                </button>
              )}
              <a
                href="tel:136"
                className="px-3.5 py-2.5 rounded-2xl bg-foreground/10 hover:bg-foreground/15 text-foreground text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Ligne directe d'urgence sanitaire"
              >
                <PhoneCall className="h-4 w-4 text-emerald-400" />
                <span>136</span>
              </a>
            </div>
          </div>

          {/* 3. HISTORIQUE DES DONS & ANCRAGE BITCOIN OPENTIMESTAMPS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Historique des dons scellés OTS */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-4xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <History className="h-5 w-5 text-rose-500" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Historique des Dons & Preuves d&apos;Ancrage OTS</h4>
                    <p className="text-[11px] text-foreground/60">Horodatage cryptographique certifié sur la blockchain Bitcoin</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  2 dons scellés
                </span>
              </div>

              <div className="space-y-3">
                {/* Don 1 */}
                <div className="p-4 rounded-3xl border border-foreground/8 bg-foreground/3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">Don de Sang Volontaire #DON-2026-1001</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        Validé O+
                      </span>
                    </div>
                    <p className="text-xs text-foreground/60 mt-1">
                      Banque de Sang de l&apos;Hôpital de Zone de Nikki • 15 Janvier 2026
                    </p>
                    <p className="text-[10px] font-mono text-foreground/45 mt-0.5 truncate max-w-md">
                      OTS: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                    </p>
                    <button
                      onClick={() =>
                        setOtsModalHash("7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069")
                      }
                      className="mt-2 text-[11px] font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                    >
                      Examiner l&apos;attestation OTS (Bloc #882104)
                    </button>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-sm font-bold text-emerald-400">+2 000 FCFA</span>
                    <span className="block text-[10px] text-foreground/50">MTN MoMo versé</span>
                  </div>
                </div>

                {/* Don 2 */}
                <div className="p-4 rounded-3xl border border-foreground/8 bg-foreground/3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">Don de Sang Volontaire #DON-2025-0842</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        Validé O+
                      </span>
                    </div>
                    <p className="text-xs text-foreground/60 mt-1">
                      Poste de Collecte Communale de Basso • 12 Octobre 2025
                    </p>
                    <p className="text-[10px] font-mono text-foreground/45 mt-0.5 truncate max-w-md">
                      OTS: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </p>
                    <button
                      onClick={() =>
                        setOtsModalHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                      }
                      className="mt-2 text-[11px] font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                    >
                      Examiner l&apos;attestation OTS (Bloc #871209)
                    </button>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-sm font-bold text-emerald-400">+2 000 FCFA</span>
                    <span className="block text-[10px] text-foreground/50">Moov Money versé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Privilèges civiques & reconnaissance républicaine */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-4xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Award className="h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Reconnaissance Civique HEMORA</h4>
                      <p className="text-[11px] text-foreground/60">Privilèges accordés aux donneurs réguliers</p>
                    </div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    350 Points
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/8 flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-foreground">Bilan Biologique Annuel Offert</h5>
                      <p className="text-[11px] text-foreground/60 mt-0.5">
                        Dépistage complet annuel gratuit (Hémogramme, glycémie, sérologies) pris en charge par le CNTS.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/8 flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-foreground">Priorité Transfusionnelle Familiale</h5>
                      <p className="text-[11px] text-foreground/60 mt-0.5">
                        En cas d&apos;urgence vitale pour vous ou vos ayants droit, allocation immédiate sans délai d&apos;attente.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/8 flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-foreground">Coupe-File Hôpitaux Publics ARCH</h5>
                      <p className="text-[11px] text-foreground/60 mt-0.5">
                        Accès prioritaire aux consultations externes sur présentation de votre carte dématérialisée HEMORA.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/10 text-[11px] text-foreground/60 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Statut de Citoyen Donneur Émérite de la République du Bénin.</span>
              </div>
            </div>
          </div>
        </ScaleUnblur>
      )}

      {/* ONGLET 6 : DÉNONCIATION & SIGNALEMENT DIRECT AU MINISTÈRE */}
      {activeTab === "denonciation" && (
        <ScaleUnblur className="flex flex-col gap-6">
          {/* Bannière solennelle Inspection Générale */}
          <div className="p-6 rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-background to-background backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 shrink-0">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25">
                    Ligne Directe Ministérielle • Zéro Impunité
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  Cellule Nationale de Signalement & d&apos;Inspection Sanitaire
                </h3>
                <p className="text-xs text-foreground/70">
                  Dénoncez tout refus d&apos;admission vitale, caution illégale ou rançonnement. Vos signalements sont transmis directement au cabinet du Ministre.
                </p>
              </div>
            </div>
            <div className="text-xs text-foreground/60 bg-foreground/5 p-3 rounded-2xl border border-foreground/10 shrink-0">
              <span className="text-red-400 font-bold block">Protection APDP :</span>
              <span>Anonymat garanti selon votre choix</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Formulaire de Signalement Gauche */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <form
                onSubmit={handleSendSignalement}
                className="p-6 sm:p-8 rounded-4xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-xl flex flex-col gap-5"
              >
                <div>
                  <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Déposer une Dénonciation Citoyenne</span>
                  </h4>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    Remplissez les détails avec précision pour permettre une enquête administrative immédiate.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground/80 uppercase mb-1.5">
                    Type d&apos;infraction ou manquement constaté *
                  </label>
                  <select
                    value={typeInfraction}
                    onChange={(e) => setTypeInfraction(e.target.value)}
                    className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-3 text-xs text-foreground focus:border-red-500 focus:outline-none transition-colors"
                  >
                    <option value="EXIGENCE_CAUTION_ILLEGALE">Exigence de caution financière préalable en urgence vitale</option>
                    <option value="REFUS_ADMISSION_URGENCE">Refus d&apos;admission ou d&apos;installation d&apos;un patient en détresse</option>
                    <option value="RANCONNEMENT_CORRUPTION">Rançonnement, corruption ou surfacturation non officielle</option>
                    <option value="ABSENCE_INJUSTIFIEE_PERSONNEL">Absence injustifiée de personnel soignant de garde</option>
                    <option value="REFUS_DELIVRANCE_ARCH">Refus de délivrance de médicaments gratuits sous régime ARCH</option>
                    <option value="DEFAUT_PRISE_EN_CHARGE">Négligence grave ou défaut de soins</option>
                    <option value="AUTRE_MANQUEMENT">Autre manquement aux obligations sanitaires</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 uppercase mb-1.5">
                      Formation Sanitaire Incriminée *
                    </label>
                    <input
                      type="text"
                      value={etablissementCible}
                      onChange={(e) => setEtablissementCible(e.target.value)}
                      placeholder="Ex: Hôpital de Zone de Nikki, CHUD Borgou..."
                      className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground focus:border-red-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 uppercase mb-1.5">
                      Commune / Département
                    </label>
                    <input
                      type="text"
                      value={`${communeFaits} (${departementFaits})`}
                      onChange={(e) => {
                        setCommuneFaits(e.target.value);
                      }}
                      className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 uppercase mb-1.5">
                      Date des faits
                    </label>
                    <input
                      type="date"
                      value={dateFaits}
                      onChange={(e) => setDateFaits(e.target.value)}
                      className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 uppercase mb-1.5">
                      Niveau de Gravité perçu
                    </label>
                    <select
                      value={graviteSignalement}
                      onChange={(e) => setGraviteSignalement(e.target.value)}
                      className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground focus:border-red-500 focus:outline-none"
                    >
                      <option value="CRITIQUE">Urgence Vitale / Menace Immédiate</option>
                      <option value="ELEVEE">Élevée (Rançonnement, refus abusif)</option>
                      <option value="MOYENNE">Moyenne (Retard injustifié, accueil)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground/80 uppercase mb-1.5">
                    Description détaillée et circonstanciée des faits *
                  </label>
                  <textarea
                    rows={4}
                    value={descriptionFaits}
                    onChange={(e) => setDescriptionFaits(e.target.value)}
                    placeholder="Précisez le lieu exact, l'heure, l'attitude du soignant ou de l'agent, le montant réclamé, et l'impact sur le patient..."
                    className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-3 text-xs text-foreground focus:border-red-500 focus:outline-none resize-none leading-relaxed"
                    required
                  />
                </div>

                {/* Option d'Anonymat */}
                <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Option de Confidentialité</span>
                    <span className="text-[11px] text-foreground/60">
                      {anonyme
                        ? "Votre identité ne sera transmise à aucun agent (Signalement 100% Anonyme)."
                        : `Le dossier sera adossé à votre NPI (${user?.npi || "Bio GOUDA"}) pour le suivi administratif.`}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={anonyme}
                      onChange={(e) => setAnonyme(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loadingSignalement}
                  className="py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {loadingSignalement ? "Transmission en cours..." : "Transmettre directement le Signalement au Ministère"}
                  </span>
                </button>

                {/* Accusé de réception */}
                {signalementSuccess?.success && (
                  <ScaleUnblur className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 flex flex-col gap-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Signalement Reçu par l&apos;Inspection Générale
                      </span>
                      <span className="font-mono text-emerald-300">{signalementSuccess.codeDossier}</span>
                    </div>
                    <p className="text-[11px] text-foreground/80">
                      {signalementSuccess.message}
                    </p>
                  </ScaleUnblur>
                )}
              </form>
            </div>

            {/* Suivi des Signalements Déposés Droite */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="p-6 rounded-4xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-foreground">Mes Signalements en Cours</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/70 font-mono">
                    {mesSignalements.length} dossier(s)
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {mesSignalements.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col gap-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-red-400">{sig.codeDossier}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          {sig.statut === "INSPECTEUR_DEPECHE" ? "Inspecteur Dépêché" : "Transmis au Ministère"}
                        </span>
                      </div>

                      <div className="font-semibold text-foreground">{sig.typeInfractionLabel}</div>
                      <div className="text-[11px] text-foreground/70 flex items-center justify-between">
                        <span>Lieu : {sig.etablissementNom} ({sig.commune || "Borgou"})</span>
                        <span className="font-mono text-foreground/50">{sig.dateFaits}</span>
                      </div>

                      {sig.reponseMinistere && (
                        <div className="p-2.5 rounded-xl bg-background/80 border border-foreground/10 text-[11px] text-foreground/80 mt-1">
                          <strong className="text-emerald-400 block mb-0.5">Réponse Officielle du Ministère :</strong>
                          {sig.reponseMinistere}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScaleUnblur>
      )}
        </div>
      )}

      {/* Modal QR Code Ordonnance */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowQrModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-foreground/10 bg-background p-6 shadow-2xl flex flex-col items-center gap-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <QrCode className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">QR Code d&apos;Ordonnance Sécurisé</h3>
              <p className="text-xs text-foreground/60 mt-1">À présenter au pharmacien pour délivrance unique</p>
              <p className="font-mono text-xs text-emerald-500 font-bold mt-1">#{showQrModal}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-foreground/15 shadow-inner">
              <div className="h-44 w-44 bg-zinc-950 flex flex-col items-center justify-center rounded-xl p-3 text-white text-[10px] font-mono text-center break-all">
                <QrCode className="h-28 w-28 text-white mb-2" />
                <span>BENINVIE-ORD-2026</span>
              </div>
            </div>

            <p className="text-[11px] text-foreground/50">
              Validité à usage unique • Prise en charge intégrale ARCH (Reste à charge 0 FCFA).
            </p>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-xs font-bold text-foreground transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal 2 : Zoom Haute Définition Passeport Donneur HEMORA */}
      {showHemoraCardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setShowHemoraCardModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-4xl border border-rose-500/40 bg-background p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-3 rounded-xs bg-[#008751]" />
                <div className="h-2.5 w-3 rounded-xs bg-[#FCD116]" />
                <div className="h-2.5 w-3 rounded-xs bg-[#E8112D]" />
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-1">
                  CNTS • RÉPUBLIQUE DU BÉNIN
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
                Passeport Donneur
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-600/30">
                <span className="text-[10px] font-bold uppercase opacity-80 leading-none">Groupe</span>
                <span className="text-2xl font-black leading-none mt-0.5">O+</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {user?.prenom || "Sabi"} {user?.nom || "KORA"}
              </h3>
              <p className="text-xs font-mono text-rose-400">{user?.npi || "NPI-CIT-1995-1029"}</p>
            </div>

            {/* Grand QR Code scannable */}
            <div className="p-4 rounded-3xl bg-white border-2 border-rose-500/30 shadow-inner flex flex-col items-center justify-center mx-auto">
              <QrCode className="h-56 w-56 text-black" />
              <div className="mt-2 text-[10px] font-mono text-zinc-800 font-bold">
                HEMORA-BJ-2026-O-8871 • SCELLÉ ANIP
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-left">
              <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8">
                <span className="text-[10px] text-foreground/50 block">Statut CNTS</span>
                <span className="font-bold text-emerald-400">Actif & Homologué</span>
              </div>
              <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8">
                <span className="text-[10px] text-foreground/50 block">Délai Don (&gt; 60 j)</span>
                <span className="font-bold text-emerald-400">Conforme (70 jours)</span>
              </div>
            </div>

            <button
              onClick={() => setShowHemoraCardModal(false)}
              className="w-full py-3 rounded-2xl bg-foreground/10 hover:bg-foreground/15 text-xs font-bold text-foreground transition-colors cursor-pointer"
            >
              Fermer la vue agrandie
            </button>
          </div>
        </div>
      )}

      {/* Modal 3 : Examen de la Preuve Cryptographique OpenTimestamps */}
      {otsModalHash && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setOtsModalHash(null)}
        >
          <div
            className="w-full max-w-lg rounded-4xl border border-rose-500/30 bg-background p-6 sm:p-8 shadow-2xl flex flex-col gap-4 text-left relative"
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

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8">
                  <span className="text-[10px] text-foreground/50 block">Réseau Public</span>
                  <span className="font-bold text-foreground">Bitcoin Mainnet</span>
                </div>
                <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/8">
                  <span className="text-[10px] text-foreground/50 block">Statut d&apos;Horodatage</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
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
              className="mt-2 w-full py-2.5 rounded-2xl bg-foreground/10 hover:bg-foreground/15 text-xs font-bold text-foreground transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
