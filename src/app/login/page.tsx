"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { DEMO_USERS, UserRole } from "@/lib/auth-session";
import {
  Shield,
  Building2,
  Stethoscope,
  HeartHandshake,
  Heart,
  Activity,
  Pill,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  UserCheck,
  Copy,
  Check,
  MapPin,
  FileCheck2,
  BadgeAlert,
  ChevronRight,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";

type ActorCard = {
  role: UserRole;
  title: string;
  category: "Gouvernance & Régulation" | "Soignants & Urgences" | "Citoyens & Services";
  description: string;
  facility: string;
  cadreReglementaire: string;
  icon: typeof Shield;
  color: string;
  badge: string;
};

const ACTOR_CARDS: ActorCard[] = [
  {
    role: "MINISTERE",
    title: "Ministère de la Santé",
    category: "Gouvernance & Régulation",
    description: "Supervision cartographique nationale des 77 communes (IASO), veille épidémiologique et régulation des stocks de sang CNTS.",
    facility: "Direction des Établissements Hospitaliers • Cotonou (Littoral)",
    cadreReglementaire: "Arrêté Ministériel - Super-Administration",
    icon: Building2,
    color: "from-[#0a3764] to-blue-900",
    badge: "Super-Admin National",
  },
  {
    role: "ARS",
    title: "Autorité de Régulation (ARS)",
    category: "Gouvernance & Régulation",
    description: "Accréditation des praticiens, contrôle de conformité des plateaux techniques et homologation officielle des médicaments MTA.",
    facility: "Direction du Contrôle et des Normes • Cotonou (Littoral)",
    cadreReglementaire: "Loi portant création de l'ARS Bénin",
    icon: Shield,
    color: "from-amber-600 to-yellow-700",
    badge: "Régulateur Sanitaire",
  },
  {
    role: "APDP",
    title: "Autorité de Protection (APDP)",
    category: "Gouvernance & Régulation",
    description: "Audit inaltérable des journaux d'accès, contrôle strict des déverrouillages 'Bris de Glace' et conformité des données médicales.",
    facility: "Commission Nationale de Contrôle • Cotonou (Littoral)",
    cadreReglementaire: "Loi n° 2017-20 (Code du Numérique)",
    icon: Lock,
    color: "from-purple-700 to-indigo-900",
    badge: "Protection des Données",
  },
  {
    role: "MEDECIN",
    title: "Médecin Urgentiste Hospitalier",
    category: "Soignants & Urgences",
    description: "Accès au dossier HL7 FHIR, activation Bris de Glace en 1 clic sans caution financière, admission vitale et prescriptions sécurisées.",
    facility: "Service Urgences • Hôpital de Zone de Nikki-Kalalé-Pèrèrè (Borgou)",
    cadreReglementaire: "Décret d'Urgence Vitale - Prise en charge 0 FCFA",
    icon: Stethoscope,
    color: "from-red-600 to-rose-800",
    badge: "Accrédité Bris de Glace",
  },
  {
    role: "ASC",
    title: "Agent de Santé Communautaire",
    category: "Soignants & Urgences",
    description: "Mode PWA fonctionnant 100% hors-ligne, triage vocal en Bariba/Fon/Dendi/Yoruba et fléchage des allocations GBESSOKE post-CPN.",
    facility: "Poste Avancé de Basso • CS Communal de Kalalé (Borgou)",
    cadreReglementaire: "Stratégie Nationale 16 000 ASC de Terrain",
    icon: Activity,
    color: "from-emerald-600 to-teal-800",
    badge: "Terrain PWA Offline",
  },
  {
    role: "PATIENT",
    title: "Espace Patient & Assuré ARCH",
    category: "Citoyens & Services",
    description: "Carnet de santé unifié HL7 FHIR lié au NPI ANIP, historique des consultations CPN, ordonnances sécurisées QR et tiers-payant ARCH.",
    facility: "Bassin Sanitaire Nikki-Kalalé • Régime ARCH 100%",
    cadreReglementaire: "Adossé au Numéro Personnel d'Identification (ANIP)",
    icon: HeartHandshake,
    color: "from-pink-600 to-rose-700",
    badge: "Dossier FHIR & ARCH",
  },
  {
    role: "CITOYEN",
    title: "Donneur Volontaire HEMORA",
    category: "Citoyens & Services",
    description: "Passeport numérique de donneur bénévole, géolocalisation d'urgence dans le rayon de 45 km et indemnité forfaitaire de déplacement MoMo.",
    facility: "Banque de Dépôt de Sang • Hôpital de Zone de Nikki",
    cadreReglementaire: "Décret Transfusionnel CNTS - Forfait 2 000 F",
    icon: Heart,
    color: "from-rose-600 to-red-700",
    badge: "Donneur Émérite O+",
  },
  {
    role: "PHARMACIE",
    title: "Pharmacien d'Officine Agréée",
    category: "Citoyens & Services",
    description: "Scan du QR code unique d'ordonnance, télétransmission de la prise en charge ARCH 100% et dispensation des médicaments MTA homologués.",
    facility: "Pharmacie Communale Conventionnée • Nikki (Borgou)",
    cadreReglementaire: "Convention Nationale Pharmaceutique ARCH",
    icon: Pill,
    color: "from-cyan-700 to-blue-800",
    badge: "Officine Conventionnée",
  },
];

export default function LoginPage(): ReactNode {
  const { loginWithCredentials } = useAuth();

  // Étape 1 : Choix de l'acteur ("select") | Étape 2 : Saisie des identifiants ("form")
  const [step, setStep] = useState<"select" | "form">("select");
  const [selectedRole, setSelectedRole] = useState<UserRole>("MEDECIN");
  const [npi, setNpi] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Vérifier si un rôle est passé en paramètre URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role") as UserRole | null;
      if (roleParam && DEMO_USERS[roleParam]) {
        handleSelectActor(roleParam);
      }
    }
  }, []);

  const handleSelectActor = (role: UserRole) => {
    setSelectedRole(role);
    setNpi(DEMO_USERS[role].npi);
    setPassword(DEMO_USERS[role].password || "benin2026");
    setStep("form");
  };

  const handleResetToOfficial = () => {
    setNpi(DEMO_USERS[selectedRole].npi);
    setPassword(DEMO_USERS[selectedRole].password || "benin2026");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      loginWithCredentials(
        npi || DEMO_USERS[selectedRole].npi,
        selectedRole,
        password || DEMO_USERS[selectedRole].password
      );
      setIsSubmitting(false);
    }, 350);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeCard = ACTOR_CARDS.find((c) => c.role === selectedRole) || ACTOR_CARDS[0];
  const activeUser = DEMO_USERS[selectedRole];
  const ActiveIcon = activeCard.icon;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900 pt-10 pb-20 px-6 sm:px-10 lg:px-12 flex flex-col justify-center">
      {/* ÉTAPE 1 : CHOISIR À QUEL ACTEUR ON APPARTIENT */}
      {step === "select" && (
        <FadeIn className="w-full max-w-7xl mx-auto flex flex-col items-center">
          {/* En-tête Institutionnel Spacieux */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0a3764]/20 bg-[#0a3764]/5 px-4 py-1.5 text-xs font-bold text-[#0a3764] mb-4">
              <CheckCircle2 className="h-4 w-4 text-[#008751]" />
              <span>Portail National d&apos;Authentification Habilitée • République du Bénin</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
              Espace d&apos;Accès Réglementaire
            </h1>

            <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Sélectionnez votre corps de rattachement pour accéder à votre console de travail habilitée par le Ministère de la Santé et l&apos;ANIP.
            </p>
          </div>

          {/* Grille Spacieuse des 8 Rôles Réglementaires (Large max-w-7xl) */}
          <ScaleUnblur className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {ACTOR_CARDS.map((card) => {
              const Icon = card.icon;
              const u = DEMO_USERS[card.role];

              return (
                <div
                  key={card.role}
                  onClick={() => handleSelectActor(card.role)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white hover:border-[#0a3764]/50 p-6 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div
                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0a3764] transition-colors leading-snug">
                      {card.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                      {card.description}
                    </p>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium text-[11px]">Titulaire :</span>
                        <span className="font-bold text-slate-900 truncate max-w-[140px]">
                          {u.prenom} {u.nom}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-slate-500 font-medium text-[11px] shrink-0">Structure :</span>
                        <span className="text-[11px] text-slate-600 text-right line-clamp-1">
                          {u.etablissementNom}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 flex items-center justify-between border-t border-slate-100 text-xs font-bold text-[#0a3764]">
                    <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Ouvrir la session</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {u.commune}
                    </span>
                  </div>
                </div>
              );
            })}
          </ScaleUnblur>

          {/* Bouton pour afficher l'annuaire officiel des comptes de test */}
          <div className="mt-12 flex flex-col items-center">
            <button
              onClick={() => setShowDirectory(!showDirectory)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-800 shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck2 className="h-4 w-4 text-[#0a3764]" />
              <span>
                {showDirectory
                  ? "Masquer le registre officiel des comptes d'évaluation"
                  : "Consulter le registre officiel des 8 comptes et identifiants pré-configurés"}
              </span>
            </button>

            {showDirectory && (
              <div className="mt-6 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#008751]" />
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Registre des Comptes et Prérogatives Officielles
                    </h4>
                  </div>
                  <span className="text-xs text-slate-600">
                    Mot de passe universel d&apos;évaluation : <code className="font-bold text-[#0a3764]">benin2026</code>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {ACTOR_CARDS.map((card) => {
                    const u = DEMO_USERS[card.role];
                    const isCopiedNpi = copiedKey === `${card.role}-npi`;
                    const isCopiedPass = copiedKey === `${card.role}-pass`;

                    return (
                      <div
                        key={card.role}
                        className="rounded-xl border border-slate-200/90 bg-[#f6f8fb] p-4 flex flex-col justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900 truncate">{card.badge}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 block truncate">
                            {u.prenom} {u.nom}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                            {u.etablissementNom}
                          </span>
                        </div>

                        <div className="font-mono text-[11px] space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-sans text-[10px]">NPI :</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#0a3764] font-bold">{u.npi}</span>
                              <button
                                onClick={() => handleCopy(u.npi, `${card.role}-npi`)}
                                className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Copier le NPI"
                              >
                                {isCopiedNpi ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-sans text-[10px]">Pass :</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-amber-700 font-bold">{u.password}</span>
                              <button
                                onClick={() => handleCopy(u.password || "", `${card.role}-pass`)}
                                className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Copier le mot de passe"
                              >
                                {isCopiedPass ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectActor(card.role)}
                          className="w-full text-center text-[11px] font-bold text-[#0a3764] hover:underline pt-1 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Accéder à ce profil</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {/* ÉTAPE 2 : FORMULAIRE DE CONNEXION AVEC IDENTIFIANTS DE L'ACTEUR CHOISI */}
      {step === "form" && (
        <ScaleUnblur className="max-w-xl mx-auto w-full">
          {/* Bouton retour vers le choix de l'acteur */}
          <button
            onClick={() => setStep("select")}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0a3764] hover:text-[#082a4d] mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← Retour à la sélection des profils institutionnels</span>
          </button>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-xl flex flex-col gap-6"
          >
            {/* Bannière du Profil Choisi */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200/90 bg-[#f6f8fb]">
              <div
                className={`h-12 w-12 rounded-xl bg-gradient-to-br ${activeCard.color} flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5`}
              >
                <ActiveIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800">
                    {activeCard.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 truncate mt-1">
                  {activeUser.prenom} {activeUser.nom}
                </h3>
                <p className="text-xs text-slate-600 truncate">
                  {activeUser.titre}
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{activeCard.facility}</span>
                </div>
              </div>
            </div>

            {/* Champ NPI */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Numéro Personnel d&apos;Identification (NPI ANIP)
                </label>
                <button
                  type="button"
                  onClick={handleResetToOfficial}
                  className="text-[11px] font-bold text-[#0a3764] hover:underline cursor-pointer"
                >
                  Rétablir l&apos;officiel
                </button>
              </div>
              <input
                type="text"
                value={npi}
                onChange={(e) => setNpi(e.target.value)}
                placeholder={activeUser.npi}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-mono text-slate-900 focus:border-[#0a3764] focus:ring-1 focus:ring-[#0a3764] focus:outline-none transition-colors"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                NPI officiel certifié par l&apos;ANIP : <strong className="font-mono text-slate-800">{activeUser.npi}</strong>
              </span>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Clé de Session Sécurisée / Mot de passe
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeUser.password}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-mono text-slate-900 focus:border-[#0a3764] focus:ring-1 focus:ring-[#0a3764] focus:outline-none transition-colors"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                Mot de passe officiel : <strong className="font-mono text-amber-700">{activeUser.password}</strong> (ou <em>benin2026</em>)
              </span>
            </div>

            {/* Bouton de Soumission */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-xl bg-[#0a3764] hover:bg-[#082a4d] py-3.5 text-sm font-bold text-white shadow-md shadow-[#0a3764]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              <span>{isSubmitting ? "Vérification des habilitations..." : `Ouvrir la session réglementaire ${activeCard.badge}`}</span>
            </button>

            <div className="border-t border-slate-100 pt-4 text-center">
              <span className="text-xs text-slate-500">
                Structure de rattachement : <strong className="text-slate-800">{activeUser.etablissementNom}</strong> ({activeUser.commune}, {activeUser.departement})
              </span>
            </div>
          </form>
        </ScaleUnblur>
      )}

      {/* Garantie Légale et Réglementaire */}
      <div className="text-center max-w-2xl mx-auto mt-12 text-xs text-slate-500 space-y-1">
        <p>
          Plateforme opérée sous l&apos;égide du Ministère de la Santé de la République du Bénin.
        </p>
        <p>
          Conformité stricte à la Loi n° 2017-20 du 20 avril 2017 portant Code du Numérique en République du Bénin (Livre V - APDP).
        </p>
      </div>
    </main>
  );
}
