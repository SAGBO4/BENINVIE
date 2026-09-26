"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { DEMO_USERS, UserRole, ROLE_DASHBOARDS } from "@/lib/auth-session";
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
  Sparkles,
  CheckCircle2,
  UserCheck,
  Zap,
  KeyRound,
  Users,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";

type ActorCard = {
  role: UserRole;
  title: string;
  category: "Gouvernance & Régulation" | "Soignants & Urgences" | "Citoyens & Services";
  description: string;
  icon: typeof Shield;
  color: string;
  badge: string;
};

const ACTOR_CARDS: ActorCard[] = [
  {
    role: "MINISTERE",
    title: "Ministère de la Santé (Super-Admin)",
    category: "Gouvernance & Régulation",
    description: "Supervision cartographique des 77 communes (IASO), veille sanitaire et stocks nationaux.",
    icon: Building2,
    color: "from-blue-600 to-indigo-700",
    badge: "Directeur National",
  },
  {
    role: "ARS",
    title: "Régulateur ARS",
    category: "Gouvernance & Régulation",
    description: "Accréditation des praticiens, contrôle et homologation des MTA (Pharmacopée traditionnelle).",
    icon: Shield,
    color: "from-amber-600 to-yellow-600",
    badge: "Autorité de Régulation",
  },
  {
    role: "APDP",
    title: "Auditeur Sécurité APDP",
    category: "Gouvernance & Régulation",
    description: "Audit inaltérable des journaux, traçabilité des 'Bris de Glace' et conformité Loi 2017-20.",
    icon: Lock,
    color: "from-purple-600 to-indigo-600",
    badge: "Protection des Données",
  },
  {
    role: "MEDECIN",
    title: "Médecin / Urgentiste",
    category: "Soignants & Urgences",
    description: "Dossier FHIR, activation Bris de Glace 1-clic, admissions vitales sans caution et ordonnances MTA.",
    icon: Stethoscope,
    color: "from-red-600 to-rose-700",
    badge: "Accrédité Bris de Glace",
  },
  {
    role: "ASC",
    title: "Agent de Santé Communautaire",
    category: "Soignants & Urgences",
    description: "Mode PWA hors-ligne, triage IA vocal en langues locales, transferts GBESSOKE post-CPN.",
    icon: Activity,
    color: "from-emerald-600 to-teal-700",
    badge: "16 000 ASC de Terrain",
  },
  {
    role: "PATIENT",
    title: "Espace Patient (Dossier FHIR)",
    category: "Citoyens & Services",
    description: "Carnet de santé HL7 FHIR, constantes vitales, ordonnances sécurisées QR, suivi CPN et régime ARCH.",
    icon: HeartHandshake,
    color: "from-pink-600 to-rose-600",
    badge: "Dossier FHIR & ARCH",
  },
  {
    role: "CITOYEN",
    title: "Espace Citoyen & Donneur HEMORA",
    category: "Citoyens & Services",
    description: "Passeport de don du sang, géolocalisation des urgences vitales, points civiques et défraiement MoMo.",
    icon: Heart,
    color: "from-rose-600 to-red-600",
    badge: "Donneur de Sang O+",
  },
  {
    role: "PHARMACIE",
    title: "Pharmacien d'Officine",
    category: "Citoyens & Services",
    description: "Scan QR code ordonnance à usage unique, vérification tiers-payant ARCH et délivrance.",
    icon: Pill,
    color: "from-cyan-600 to-blue-600",
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
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col justify-center">
      {/* ÉTAPE 1 : CHOISIR À QUEL ACTEUR ON APPARTIENT */}
      {step === "select" && (
        <FadeIn className="w-full flex flex-col items-center">
          {/* En-tête */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Portail d&apos;Authentification National • République du Bénin</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              À quel profil appartenez-vous ?
            </h1>
            <p className="mt-3 text-sm sm:text-base text-foreground/70 max-w-2xl mx-auto">
              Sélectionnez votre fonction dans le système de santé pour accéder à la saisie de vos identifiants sécurisés.
            </p>
          </div>

          {/* Grille des 8 Acteurs */}
          <ScaleUnblur className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
            {ACTOR_CARDS.map((card) => {
              const Icon = card.icon;
              const u = DEMO_USERS[card.role];

              return (
                <div
                  key={card.role}
                  onClick={() => handleSelectActor(card.role)}
                  className="group relative flex flex-col justify-between rounded-3xl border border-foreground/10 bg-background/85 hover:border-emerald-500/50 p-5 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer backdrop-blur-md overflow-hidden"
                >
                  {/* Lueur d'ambiance */}
                  <div
                    className={`absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br ${card.color} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity`}
                  />

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div
                        className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/80">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-foreground/60 mt-1 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-foreground/5 flex flex-col gap-1 text-[11px] text-foreground/75">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/45">Titulaire :</span>
                        <span className="font-semibold text-foreground truncate max-w-[130px]">{u.prenom} {u.nom}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/45">Structure :</span>
                        <span className="truncate max-w-[130px] text-foreground/60">{u.etablissementNom}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-2 flex items-center justify-between border-t border-foreground/5">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Je suis cet acteur</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 opacity-60 group-hover:scale-125 transition-transform" />
                  </div>
                </div>
              );
            })}
          </ScaleUnblur>

          {/* Bouton pour afficher l'annuaire des mots de passe */}
          <div className="mt-10 flex flex-col items-center">
            <button
              onClick={() => setShowDirectory(!showDirectory)}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/3 hover:bg-foreground/6 px-4 py-2 text-xs font-medium text-foreground/70 transition-colors cursor-pointer"
            >
              <Users className="h-3.5 w-3.5 text-emerald-500" />
              <span>{showDirectory ? "Masquer l'annuaire des identifiants" : "Consulter l'annuaire des 8 comptes et identifiants pré-créés"}</span>
            </button>

            {showDirectory && (
              <div className="mt-6 w-full max-w-4xl rounded-3xl border border-foreground/10 bg-background/95 p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4 border-b border-foreground/10 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Identifiants Officiels des 8 Comptes
                    </h4>
                  </div>
                  <span className="text-[11px] text-foreground/50">Mot de passe universel démo : <code>benin2026</code></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {ACTOR_CARDS.map((card) => {
                    const u = DEMO_USERS[card.role];
                    const isCopiedNpi = copiedKey === `${card.role}-npi`;
                    const isCopiedPass = copiedKey === `${card.role}-pass`;

                    return (
                      <div
                        key={card.role}
                        className="rounded-2xl border border-foreground/8 bg-foreground/3 p-3 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[11px] text-foreground truncate">{card.badge}</span>
                          </div>
                          <span className="text-[11px] text-foreground/70 block truncate">{u.prenom} {u.nom}</span>
                        </div>

                        <div className="font-mono text-[10px] space-y-1 bg-background/80 p-2 rounded-xl border border-foreground/6">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/50 font-sans">NPI :</span>
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{u.npi}</span>
                              <button
                                onClick={() => handleCopy(u.npi, `${card.role}-npi`)}
                                className="p-0.5 text-foreground/40 hover:text-foreground cursor-pointer"
                              >
                                {isCopiedNpi ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/50 font-sans">Pass :</span>
                            <div className="flex items-center gap-1">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">{u.password}</span>
                              <button
                                onClick={() => handleCopy(u.password || "", `${card.role}-pass`)}
                                className="p-0.5 text-foreground/40 hover:text-foreground cursor-pointer"
                              >
                                {isCopiedPass ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectActor(card.role)}
                          className="w-full text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1 cursor-pointer"
                        >
                          Se connecter avec ce rôle →
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
        <ScaleUnblur className="max-w-md mx-auto w-full">
          {/* Bouton retour vers le choix de l'acteur */}
          <button
            onClick={() => setStep("select")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← Choisir un autre profil</span>
          </button>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-foreground/10 bg-background/95 p-7 sm:p-8 shadow-2xl backdrop-blur-2xl flex flex-col gap-6"
          >
            {/* Bannière du Profil Choisi */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-foreground/8 bg-foreground/3">
              <div
                className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${activeCard.color} flex items-center justify-center text-white shadow-md shrink-0`}
              >
                <ActiveIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-foreground/5 text-foreground/80">
                    {activeCard.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground truncate mt-0.5">
                  {activeUser.prenom} {activeUser.nom}
                </h3>
                <p className="text-[11px] text-foreground/60 truncate">
                  {activeUser.titre}
                </p>
              </div>
            </div>

            {/* Champ NPI */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Identifiant NPI ANIP
                </label>
                <button
                  type="button"
                  onClick={handleResetToOfficial}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Rétablir l&apos;officiel
                </button>
              </div>
              <input
                type="text"
                value={npi}
                onChange={(e) => setNpi(e.target.value)}
                placeholder={activeUser.npi}
                className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-3 text-sm font-mono text-foreground focus:border-emerald-500 focus:outline-none transition-colors"
                required
              />
              <span className="text-[11px] text-foreground/50 mt-1 block">
                NPI officiel associé : <strong className="font-mono text-emerald-600 dark:text-emerald-400">{activeUser.npi}</strong>
              </span>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Mot de passe / Clé Numérique
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeUser.password}
                className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-3 text-sm font-mono text-foreground focus:border-emerald-500 focus:outline-none transition-colors"
                required
              />
              <span className="text-[11px] text-foreground/50 mt-1 block">
                Mot de passe officiel : <strong className="font-mono text-amber-600 dark:text-amber-400">{activeUser.password}</strong> (ou <em>benin2026</em>)
              </span>
            </div>

            {/* Bouton de Soumission */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              <span>{isSubmitting ? "Ouverture de session..." : `Ouvrir la session ${activeCard.badge}`}</span>
            </button>

            <div className="border-t border-foreground/8 pt-3 text-center">
              <span className="text-[11px] text-foreground/50">
                Structure de rattachement : <strong className="text-foreground">{activeUser.etablissementNom}</strong> ({activeUser.commune})
              </span>
            </div>
          </form>
        </ScaleUnblur>
      )}

      {/* Garantie légale */}
      <p className="text-center text-[11px] text-foreground/45 mt-10">
        Authentification adossée au Référentiel National ANIP & Régulation ARS • Conformité stricte APDP (Loi n° 2017-20).
      </p>
    </main>
  );
}
