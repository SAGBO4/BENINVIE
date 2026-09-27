"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { DEMO_USERS, UserRole } from "@/lib/auth-session";
import {
  Shield,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  UserPlus,
  LogIn,
  Sparkles,
  HelpCircle,
  Building2,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  FileCheck,
  Check,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const BENIN_DEPARTEMENTS = [
  "Littoral",
  "Atlantique",
  "Ouémé",
  "Plateau",
  "Zou",
  "Collines",
  "Mono",
  "Couffo",
  "Borgou",
  "Alibori",
  "Atacora",
  "Donga",
];

interface RoleOption {
  role: UserRole;
  label: string;
  desc: string;
  category: "Gouvernance & Régulation" | "Soignants & Urgences" | "Citoyens & Services";
  facility: string;
  reglementaire: string;
  badge: string;
  icon: typeof Shield;
}

const ROLES_CATALOG: RoleOption[] = [
  {
    role: "MINISTERE",
    label: "Ministère de la Santé",
    desc: "Supervision cartographique nationale des 77 communes, veille épidémiologique et régulation des stocks de sang CNTS.",
    category: "Gouvernance & Régulation",
    facility: "Direction des Établissements Hospitaliers • Cotonou (Littoral)",
    reglementaire: "Arrêté Ministériel - Super-Administration Sanitaire",
    badge: "Super-Admin National",
    icon: Building2,
  },
  {
    role: "ARS",
    label: "Autorité de Régulation (ARS)",
    desc: "Accréditation des praticiens, contrôle de conformité des plateaux techniques et homologation officielle des médicaments MTA.",
    category: "Gouvernance & Régulation",
    facility: "Direction du Contrôle et des Normes • Cotonou (Littoral)",
    reglementaire: "Loi portant création de l'ARS Bénin",
    badge: "Régulateur Sanitaire",
    icon: Shield,
  },
  {
    role: "APDP",
    label: "Autorité de Protection (APDP)",
    desc: "Audit inaltérable des journaux d'accès, contrôle strict des déverrouillages Bris de Glace et protection des données médicales.",
    category: "Gouvernance & Régulation",
    facility: "Commission Nationale de Contrôle • Cotonou (Littoral)",
    reglementaire: "Loi n° 2017-20 (Code du Numérique)",
    badge: "Protection des Données",
    icon: Lock,
  },
  {
    role: "MEDECIN",
    label: "Médecin Urgentiste Hospitalier",
    desc: "Accès au dossier HL7 FHIR, activation Bris de Glace sans caution financière, admission vitale et prescriptions sécurisées.",
    category: "Soignants & Urgences",
    facility: "Service Urgences • Hôpital de Zone de Nikki-Kalalé-Pèrèrè (Borgou)",
    reglementaire: "Décret d'Urgence Vitale - Prise en charge 0 FCFA",
    badge: "Accrédité Bris de Glace",
    icon: Stethoscope,
  },
  {
    role: "ASC",
    label: "Agent de Santé Communautaire",
    desc: "Console PWA fonctionnant 100% hors-ligne, triage vocal en langues nationales et fléchage des allocations GBESSOKE post-CPN.",
    category: "Soignants & Urgences",
    facility: "Poste Avancé de Basso • CS Communal de Kalalé (Borgou)",
    reglementaire: "Stratégie Nationale 16 000 ASC de Terrain",
    badge: "Terrain PWA Offline",
    icon: Activity,
  },
  {
    role: "PATIENT",
    label: "Espace Patient & Assuré ARCH",
    desc: "Carnet de santé unifié HL7 FHIR lié au NPI ANIP, suivi des consultations CPN, ordonnances sécurisées QR et tiers-payant ARCH 100%.",
    category: "Citoyens & Services",
    facility: "Centre de Santé Communal de Kalalé (Borgou)",
    reglementaire: "Régime d'Assurance Maladie Universelle (ARCH)",
    badge: "Dossier FHIR & ARCH",
    icon: Heart,
  },
  {
    role: "CITOYEN",
    label: "Donneur Volontaire HEMORA",
    desc: "Passeport numérique de donneur bénévole, géolocalisation d'urgence dans le rayon de 45 km et indemnité forfaitaire de déplacement.",
    category: "Citoyens & Services",
    facility: "Banque de Sang • Hôpital de Zone de Nikki",
    reglementaire: "Programme National de Transfusion Sanguine (CNTS)",
    badge: "Donneur Émérite O+",
    icon: Heart,
  },
  {
    role: "PHARMACIE",
    label: "Pharmacien d'Officine Agréée",
    desc: "Scan du QR code unique d'ordonnance, télétransmission de la prise en charge ARCH 100% et dispensation des médicaments MTA.",
    category: "Soignants & Urgences",
    facility: "Pharmacie Communale de Nikki (Borgou)",
    reglementaire: "Convention Nationale Pharmaceutique & Tiers-Payant",
    badge: "Officine Conventionnée",
    icon: Pill,
  },
];

export default function LoginPage(): ReactNode {
  const { loginWithCredentials, registerAccount, lastLoginError, clearLoginError } = useAuth();

  const [activeTab, setActiveTab] = useState<"connexion" | "inscription">("connexion");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Formulaire Connexion
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "AUTO">("AUTO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("TOUS");

  // Formulaire Inscription
  const [regRole, setRegRole] = useState<UserRole>("CITOYEN");
  const [regNom, setRegNom] = useState("");
  const [regPrenom, setRegPrenom] = useState("");
  const [regNpi, setRegNpi] = useState("");
  const [regTelephone, setRegTelephone] = useState("");
  const [regDepartement, setRegDepartement] = useState("Borgou");
  const [regCommune, setRegCommune] = useState("Kalalé");
  const [regEtablissement, setRegEtablissement] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [regIsSubmitting, setRegIsSubmitting] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);

  // Pré-remplissage via URL ?role=... ou ?tab=...
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "inscription") {
        setActiveTab("inscription");
      }
      const roleParam = params.get("role")?.toUpperCase() as UserRole | null;
      if (roleParam && DEMO_USERS[roleParam]) {
        setSelectedRole(roleParam);
        setIdentifier(DEMO_USERS[roleParam].npi);
        setPassword(DEMO_USERS[roleParam].password || "benin2026");
      }
    }
  }, []);

  const handleQuickFill = (role: UserRole) => {
    clearLoginError();
    const demo = DEMO_USERS[role];
    if (demo) {
      setSelectedRole(role);
      setIdentifier(demo.npi);
      setPassword(demo.password || "benin2026");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearLoginError();
    setIsSubmitting(true);

    try {
      const roleToUse = selectedRole === "AUTO" ? undefined : selectedRole;
      await loginWithCredentials(identifier.trim(), roleToUse, password.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearLoginError();
    setRegErrorMsg(null);
    setRegSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (regPassword.length < 6) {
      setRegErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (!acceptTerms) {
      setRegErrorMsg("Veuillez accepter les dispositions du Code de la Santé Publique.");
      return;
    }

    setRegIsSubmitting(true);

    try {
      const template = DEMO_USERS[regRole] || DEMO_USERS.CITOYEN;
      const cleanNpi =
        regNpi.trim() || `BEN-${regDepartement.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newSession = {
        npi: cleanNpi,
        nom: regNom.trim().toUpperCase(),
        prenom: regPrenom.trim(),
        role: regRole,
        roleLabel: template.roleLabel,
        titre: regEtablissement.trim() || template.titre,
        etablissementNom: regEtablissement.trim() || `${template.etablissementNom} (${regCommune})`,
        commune: regCommune.trim() || "Cotonou",
        departement: regDepartement.trim() || "Littoral",
        telephone: regTelephone.trim() || undefined,
        badge: template.badge,
        password: regPassword.trim(),
      };

      const res = await registerAccount(newSession);

      if (res.requiresValidation) {
        setRegSuccessMsg(
          `Votre demande d'inscription sous le NPI ${cleanNpi} a été enregistrée avec succès. En tant que professionnel de santé (${regRole}), votre accès est soumis à l'accréditation ordinale et réglementaire de l'Autorité de Régulation du Secteur de la Santé (ARS).`
        );
      }
    } catch (err: any) {
      setRegErrorMsg(err.message || "Erreur lors de la création du compte.");
    } finally {
      setRegIsSubmitting(false);
    }
  };

  const filteredRoles = ROLES_CATALOG.filter(
    (r) => selectedFilterCategory === "TOUS" || r.category === selectedFilterCategory
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-start py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Navigation retour alignée */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0a3764] transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/70 w-fit group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Retour à l&apos;accueil BENINVIE</span>
          </Link>
        </div>

        {/* Header institutionnel */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-[#0a3764] text-xs font-semibold mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Portail National d&apos;Authentification Habilitée &bull; République du Bénin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Espace d&apos;Accès Réglementaire & Sanitaire
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl mx-auto">
            BENINVIE &bull; Système National Intégré de Santé Publique, Urgences Vitales & Dossier HL7 FHIR
          </p>
        </div>

        {/* Boîte Principale d'Authentification */}
        <div className="max-w-xl mx-auto bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/90 mb-12">
          {/* Onglets Connexion / Inscription */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab("connexion");
                clearLoginError();
              }}
              className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "connexion"
                  ? "border-[#0a3764] text-[#0a3764]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Connexion</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("inscription");
                clearLoginError();
                setRegSuccessMsg(null);
                setRegErrorMsg(null);
              }}
              className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "inscription"
                  ? "border-[#0a3764] text-[#0a3764]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Inscription</span>
            </button>
          </div>

          {/* ONGLET 1 : CONNEXION */}
          {activeTab === "connexion" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {lastLoginError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{lastLoginError}</div>
                </div>
              )}

              {/* Identifiant ou NPI */}
              <div>
                <label htmlFor="login-identifier" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Identifiant ou NPI ANIP
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (lastLoginError) clearLoginError();
                    }}
                    placeholder="Ex: NPI-MED-2026-004 ou 2026-KAL-9821-BIO"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900 placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-xs font-medium text-[#0a3764] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Aide connexion</span>
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </div>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (lastLoginError) clearLoginError();
                    }}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Se souvenir de moi */}
              <div className="flex items-center justify-between pt-1">
                <label htmlFor="login-remember-me" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="login-remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0a3764] focus:ring-[#0a3764]"
                  />
                  <span className="text-xs text-slate-600">Se souvenir de moi sur ce terminal</span>
                </label>
              </div>

              {/* Bouton de Connexion */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0a3764] hover:bg-[#082a4d] text-white text-sm font-bold shadow-md shadow-[#0a3764]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                <span>{isSubmitting ? "Authentification..." : "Se connecter"}</span>
              </button>

              {/* Remplissage rapide démo */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Accès rapide de démonstration :</span>
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("PATIENT")}
                    className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-center truncate flex items-center justify-center gap-1"
                  >
                    <Heart className="w-3 h-3 text-pink-600 shrink-0" />
                    <span className="truncate">Patient ARCH</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("CITOYEN")}
                    className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-center truncate flex items-center justify-center gap-1"
                  >
                    <User className="w-3 h-3 text-rose-600 shrink-0" />
                    <span className="truncate">Donneur</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("MEDECIN")}
                    className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-center truncate flex items-center justify-center gap-1"
                  >
                    <Stethoscope className="w-3 h-3 text-red-600 shrink-0" />
                    <span className="truncate">Médecin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("ASC")}
                    className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-center truncate flex items-center justify-center gap-1"
                  >
                    <Activity className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">ASC Terrain</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("PHARMACIE")}
                    className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-center truncate flex items-center justify-center gap-1"
                  >
                    <Pill className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">Pharmacie</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("ARS")}
                    className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-center truncate flex items-center justify-center gap-1"
                  >
                    <Shield className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">ARS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("APDP")}
                    className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-center truncate flex items-center justify-center gap-1"
                  >
                    <Lock className="w-3 h-3 text-purple-600 shrink-0" />
                    <span className="truncate">APDP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("MINISTERE")}
                    className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-center truncate flex items-center justify-center gap-1"
                  >
                    <Building2 className="w-3 h-3 text-[#0a3764] shrink-0" />
                    <span className="truncate">Ministère</span>
                  </button>
                </div>
              </div>

              {/* Bascule Inscription */}
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  Pas encore de compte sanitaire ?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("inscription");
                      clearLoginError();
                    }}
                    className="font-bold text-[#0a3764] hover:underline cursor-pointer"
                  >
                    S&apos;inscrire
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* ONGLET 2 : INSCRIPTION */}
          {activeTab === "inscription" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-sm mb-1 text-emerald-800">
                      Demande enregistrée avec succès
                    </strong>
                    <p className="leading-relaxed">{regSuccessMsg}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("connexion");
                        setRegSuccessMsg(null);
                      }}
                      className="mt-2.5 px-3 py-1.5 rounded-lg bg-[#0a3764] text-white text-xs font-bold hover:bg-[#082a4d] cursor-pointer"
                    >
                      Aller à la connexion
                    </button>
                  </div>
                </div>
              )}

              {regErrorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{regErrorMsg}</span>
                </div>
              )}

              {/* Rôle */}
              <div>
                <label htmlFor="reg-role" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corps de rattachement / Profil sanitaire *
                </label>
                <select
                  id="reg-role"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="block w-full px-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900 bg-white"
                  required
                >
                  <optgroup label="Citoyens & Usagers">
                    <option value="CITOYEN">Citoyen & Donneur Volontaire HEMORA</option>
                    <option value="PATIENT">Patient & Assuré ARCH (Dossier FHIR)</option>
                  </optgroup>
                  <optgroup label="Praticiens & Soignants">
                    <option value="MEDECIN">Médecin Urgentiste Hospitalier (Accréditation Bris de Glace)</option>
                    <option value="PHARMACIE">Pharmacien d&apos;Officine Conventionnée</option>
                    <option value="ASC">Agent de Santé Communautaire (PWA Terrain)</option>
                  </optgroup>
                  <optgroup label="Gouvernance & Régulation">
                    <option value="ARS">Autorité de Régulation du Secteur de la Santé (ARS)</option>
                    <option value="APDP">Autorité de Protection des Données Personnelles (APDP)</option>
                    <option value="MINISTERE">Ministère de la Santé (Direction Nationale)</option>
                  </optgroup>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {regRole === "CITOYEN" || regRole === "PATIENT"
                    ? "Accès immédiat après validation du NPI ANIP."
                    : "Habilitation professionnelle soumise au visa de conformité de l'ARS."}
                </span>
              </div>

              {/* Nom & Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-nom" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom *
                  </label>
                  <input
                    id="reg-nom"
                    type="text"
                    required
                    value={regNom}
                    onChange={(e) => setRegNom(e.target.value)}
                    placeholder="Ex: BIO"
                    className="block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="reg-prenom" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Prénom(s) *
                  </label>
                  <input
                    id="reg-prenom"
                    type="text"
                    required
                    value={regPrenom}
                    onChange={(e) => setRegPrenom(e.target.value)}
                    placeholder="Ex: Salifou"
                    className="block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900"
                  />
                </div>
              </div>

              {/* NPI & Téléphone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-npi" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    NPI ANIP *
                  </label>
                  <input
                    id="reg-npi"
                    type="text"
                    required
                    value={regNpi}
                    onChange={(e) => setRegNpi(e.target.value)}
                    placeholder="Ex: 2026-BEN-..."
                    className="block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="reg-telephone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Téléphone
                  </label>
                  <input
                    id="reg-telephone"
                    type="tel"
                    value={regTelephone}
                    onChange={(e) => setRegTelephone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                    className="block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900"
                  />
                </div>
              </div>

              {/* Département & Commune */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-departement" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Département *
                  </label>
                  <select
                    id="reg-departement"
                    value={regDepartement}
                    onChange={(e) => setRegDepartement(e.target.value)}
                    className="block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900 bg-white"
                  >
                    {BENIN_DEPARTEMENTS.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="reg-commune" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Commune *
                  </label>
                  <input
                    id="reg-commune"
                    type="text"
                    required
                    value={regCommune}
                    onChange={(e) => setRegCommune(e.target.value)}
                    placeholder="Ex: Kalalé, Nikki, Cotonou..."
                    className="block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900"
                  />
                </div>
              </div>

              {/* Structure sanitaire si pro */}
              {regRole !== "CITOYEN" && regRole !== "PATIENT" && (
                <div>
                  <label htmlFor="reg-etablissement" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Établissement / Hôpital / Structure d&apos;exercice *
                  </label>
                  <input
                    id="reg-etablissement"
                    type="text"
                    required
                    value={regEtablissement}
                    onChange={(e) => setRegEtablissement(e.target.value)}
                    placeholder="Ex: Hôpital de Zone de Nikki, Pharmacie Centrale, CS Communal..."
                    className="block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900"
                  />
                </div>
              )}

              {/* Mots de passe */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 caractères"
                      className="block w-full px-3 py-2 pr-8 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirmer *
                  </label>
                  <input
                    id="reg-confirm-password"
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Répétez"
                    className="block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a3764] focus:border-[#0a3764] text-slate-900"
                  />
                </div>
              </div>

              {/* Engagement légal */}
              <div className="pt-1">
                <label htmlFor="reg-accept-terms" className="flex items-start gap-2 cursor-pointer">
                  <input
                    id="reg-accept-terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0a3764] focus:ring-[#0a3764] mt-0.5"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    J&apos;atteste l&apos;exactitude des informations fournies conformément au Code de la Santé Publique et à la Loi n° 2017-20 portant Code du Numérique en République du Bénin.
                  </span>
                </label>
              </div>

              {/* Bouton Inscription */}
              <button
                type="submit"
                disabled={regIsSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                <span>{regIsSubmitting ? "Création du compte..." : "Créer mon compte"}</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  Vous possédez déjà un compte ?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("connexion");
                      clearLoginError();
                    }}
                    className="font-bold text-[#0a3764] hover:underline cursor-pointer"
                  >
                    Se connecter
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Section Habilitations & Rôles Réglementaires Habilités (Grille épurée et moderne) */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Corps de Rattachement & Habilitations Nationales
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sélectionnez un profil pour pré-remplir la console ou consulter son périmètre légal
              </p>
            </div>

            {/* Filtres par catégorie */}
            <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl self-start sm:self-auto overflow-x-auto">
              {(["TOUS", "Gouvernance & Régulation", "Soignants & Urgences", "Citoyens & Services"] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedFilterCategory === cat
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {cat === "TOUS" ? "Tous les profils" : cat}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRoles.map((roleOpt) => {
              const Icon = roleOpt.icon;
              const isSelected = selectedRole === roleOpt.role;
              return (
                <div
                  key={roleOpt.role}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between hover:shadow-md ${
                    isSelected
                      ? "border-[#0a3764] ring-2 ring-[#0a3764]/20 shadow-md"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-[#0a3764]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {roleOpt.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                      {roleOpt.label}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3">
                      {roleOpt.desc}
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                      <div>
                        <span className="text-slate-400">Structure :</span>{" "}
                        <span className="font-medium text-slate-700">{roleOpt.facility}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Cadre :</span>{" "}
                        <span className="font-medium text-slate-700">{roleOpt.reglementaire}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleQuickFill(roleOpt.role);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#0a3764] text-slate-700 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer group"
                  >
                    <span>Charger ce profil</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal d'Aide & Identifiants Nationaux */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#0a3764]" />
                <span>Aide à la Connexion BENINVIE</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                La plateforme utilise le Numéro Personnel d&apos;Identification (NPI) délivré par l&apos;ANIP ou votre matricule professionnel pour authentifier votre session et appliquer les droits RBAC stricts.
              </p>
              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 mb-4 font-mono">
                <div>
                  <strong>Patient (FHIR/ARCH) :</strong> <code className="text-[#0a3764]">2026-KAL-9821-BIO</code>
                </div>
                <div>
                  <strong>Donneur HEMORA :</strong> <code className="text-[#0a3764]">NPI-CIT-1995-1029</code>
                </div>
                <div>
                  <strong>Médecin Urgentiste :</strong> <code className="text-[#0a3764]">NPI-MED-2026-004</code>
                </div>
                <div>
                  <strong>ASC de Terrain :</strong> <code className="text-[#0a3764]">NPI-ASC-2026-005</code>
                </div>
                <div>
                  <strong>Pharmacien :</strong> <code className="text-[#0a3764]">NPI-PHA-2026-007</code>
                </div>
                <div>
                  <strong>Régulateur ARS :</strong> <code className="text-[#0a3764]">NPI-ARS-2026-002</code>
                </div>
                <div>
                  <strong>Auditeur APDP :</strong> <code className="text-[#0a3764]">NPI-APDP-2026-003</code>
                </div>
                <div>
                  <strong>Super-Admin Ministère :</strong> <code className="text-[#0a3764]">NPI-MIN-2026-001</code>
                </div>
                <div className="pt-1 text-slate-500 font-sans">
                  Mot de passe universel démo : <code className="text-amber-700 font-mono">benin2026</code>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0a3764] text-white text-xs font-bold hover:bg-[#082a4d] cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer institutionnel */}
        <div className="text-center mt-12 mb-6 text-xs text-slate-500">
          <p>
            République du Bénin &bull; Ministère de la Santé &bull; Autorité de Régulation du Secteur de la Santé (ARS) &bull; APDP
          </p>
        </div>
      </div>
    </div>
  );
}
