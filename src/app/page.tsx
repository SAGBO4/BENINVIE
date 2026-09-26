"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/auth-session";
import {
  ShieldAlert,
  Building2,
  Stethoscope,
  HeartHandshake,
  Activity,
  Pill,
  Lock,
  ArrowRight,
  MapPin,
  CheckCircle,
  Zap,
  PhoneCall,
  QrCode,
  Droplet,
  Compass,
  ChevronRight,
  FileText,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Radio,
  FileCheck2,
  Clock,
  Sparkles,
} from "lucide-react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";
import { BmmTelemetryRadar } from "@/components/hero/bmm-telemetry-radar";

type ServiceItem = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  tarif: string;
  delai: string;
  link: string;
  icon: typeof ShieldAlert;
};

// Services officiels en ligne calqués sur l'architecture ANIP (e-services de l'État béninois)
const SERVICES_EN_LIGNE: ServiceItem[] = [
  {
    id: "urgence-bris",
    category: "Urgences Vitales & Décret d'État",
    title: "Prise en Charge Vitale & Bris de Glace",
    subtitle: "Déverrouillage immédiat des soins d'urgence sans condition de solvabilité préalable",
    tarif: "0 FCFA (Caution interdite)",
    delai: "Immédiat (< 2 min)",
    link: "/login?role=MEDECIN",
    icon: ShieldAlert,
  },
  {
    id: "hemora-sang",
    category: "Transfusion Sanguine CNTS",
    title: "Chaîne Transfusionnelle HEMORA",
    subtitle: "Supervision des poches CGR et matching géodésique Haversine dans les 77 communes",
    tarif: "Prise en charge CNTS",
    delai: "Alerte < 15 min",
    link: "/projects?module=matching",
    icon: Droplet,
  },
  {
    id: "dossier-fhir",
    category: "Identification & Dossier National",
    title: "Carnet de Santé Numérique HL7 FHIR",
    subtitle: "Dossier médical partagé unifié adossé au Numéro Personnel d'Identification (NPI ANIP)",
    tarif: "Gratuit (Inclus NPI)",
    delai: "Permanent 24h/24",
    link: "/login?role=PATIENT",
    icon: Stethoscope,
  },
  {
    id: "passeport-donneur",
    category: "Incentive Civique & Volontariat",
    title: "Passeport Donneur & Forfait MoMo",
    subtitle: "Carte QR chiffrée APDP, contrôle des 60 jours et défraiement de déplacement forfaitaire",
    tarif: "2 000 FCFA versés",
    delai: "Virement instantané",
    link: "/projects?module=passport",
    icon: CreditCard,
  },
  {
    id: "assurance-arch",
    category: "Protection Sociale Universelle",
    title: "Assurance Maladie ARCH Bénin",
    subtitle: "Prise en charge intégrale des soins obstétriques, paludisme et panier de base",
    tarif: "Tiers-payant 100%",
    delai: "Validation temps réel",
    link: "/login?role=PATIENT",
    icon: HeartHandshake,
  },
  {
    id: "pharmacopee-mta",
    category: "Régulation Pharmaceutique ARS",
    title: "Pharmacopée Homologuée MTA",
    subtitle: "Catalogue officiel des Médicaments Traditionnels Améliorés certifiés et tradipraticiens accrédités",
    tarif: "Tarif conventionné",
    delai: "Catalogue officiel",
    link: "/dashboard/ars",
    icon: Pill,
  },
];

type FeatureCard = {
  id: string;
  badge: string;
  referenceLegale: string;
  title: string;
  description: string;
  facility: string;
  icon: typeof ShieldAlert;
  color: string;
  accent: string;
  link: string;
};

const PILLIERS: FeatureCard[] = [
  {
    id: "urgence",
    badge: "Règle d'or nationale",
    referenceLegale: "Décret d'application de l'Urgence Vitale",
    title: "Paiement Différé & Bris de Glace APDP",
    description:
      "Zéro refus d'admission pour motif financier. Les hôpitaux nationaux et de zone activent le protocole de déverrouillage d'urgence en un clic. Chaque accès exceptionnel aux données de santé est consigné dans un registre inaltérable d'audit soumis à l'APDP.",
    facility: "Déployé au CNHU-HKM Cotonou, CHIC Calavi et CHUD Borgou",
    icon: ShieldAlert,
    color: "from-red-600 to-rose-700",
    accent: "text-red-600",
    link: "/login?role=MEDECIN",
  },
  {
    id: "hemora",
    badge: "Souveraineté Transfusionnelle",
    referenceLegale: "Protocole National CNTS - Rayon 45 km",
    title: "Chaîne HEMORA & Matching Haversine WGS84",
    description:
      "Algorithme géodésique interconnectant en temps réel les banques de sang hospitalières et les donneurs volontaires compatibles (ABO/Rhésus). Alerte SMS ciblée sous 15 minutes avec défraiement forfaitaire de déplacement de 2 000 FCFA Mobile Money.",
    facility: "Interconnexion des 77 communes et banques de dépôts départementales",
    icon: Droplet,
    color: "from-pink-600 to-red-600",
    accent: "text-rose-600",
    link: "/projects?module=matching",
  },
  {
    id: "fhir",
    badge: "Continuité Territoriale des Soins",
    referenceLegale: "Standard International HL7 FHIR Release 4 & ANIP",
    title: "Carnet de Santé Unifié adossé au NPI ANIP",
    description:
      "Interconnexion souveraine des dossiers patients entre les centres de référence (CNHU, CHIC Calavi, CHD) et les 600 centres de santé d'arrondissement. Accès aux antécédents, constantes vitales et allergies sans barrière de format.",
    facility: "Cartographie sanitaire nationale synchronisée sur le référentiel IASO",
    icon: Stethoscope,
    color: "from-blue-600 to-indigo-600",
    accent: "text-[#0a3764]",
    link: "/login?role=PATIENT",
  },
  {
    id: "mta",
    badge: "Régulation & Souveraineté Thérapeutique",
    referenceLegale: "Cadre Réglementaire ARS - Homologation Pharmacopée",
    title: "Pharmacopée Homologuée MTA & Ordonnances Sécurisées",
    description:
      "Registre national des tradipraticiens dûment accrédités par l'Autorité de Régulation du Secteur de la Santé (ARS). Délivrance d'ordonnances munies de QR codes scellés anti-contrefaçon et intégration progressive aux officines pharmaceutiques.",
    facility: "Contrôles botaniques, toxicologiques et cliniques validés par l'ARS",
    icon: Pill,
    color: "from-amber-600 to-yellow-600",
    accent: "text-amber-600",
    link: "/dashboard/ars",
  },
  {
    id: "pwa-asc",
    badge: "Dernier Kilomètre Sanitaire",
    referenceLegale: "Plan Stratégique National de Santé Communautaire",
    title: "PWA Hors-Ligne des 16 000 ASC & Programme GBESSOKE",
    description:
      "Application web progressive (PWA) fonctionnant sans connexion internet pour les 16 000 Agents de Santé Communautaire. Triage vocal précoce en langues nationales (Bariba, Fon, Dendi, Yoruba) et fléchage des transferts monétaires post-CPN.",
    facility: "Expérimenté en conditions réelles à Kalalé, Nikki, Bembèrèkè et Tchaourou",
    icon: Activity,
    color: "from-emerald-600 to-teal-700",
    accent: "text-emerald-600",
    link: "/projects?module=scenario",
  },
];

const ACTORS_SHORTCUTS = [
  {
    role: "MINISTERE" as UserRole,
    name: "Ministère de la Santé",
    roleLabel: "Super-Admin National",
    subtext: "Direction des Hôpitaux",
    icon: Building2,
    color: "text-[#0a3764]",
    bg: "bg-[#0a3764]/10",
  },
  {
    role: "ARS" as UserRole,
    name: "Régulateur ARS",
    roleLabel: "Autorité de Régulation",
    subtext: "Accréditations & MTA",
    icon: Pill,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    role: "APDP" as UserRole,
    name: "Auditeur APDP",
    roleLabel: "Loi 2017-20 Numérique",
    subtext: "Audit Bris de Glace",
    icon: Lock,
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  {
    role: "MEDECIN" as UserRole,
    name: "Médecin Urgentiste",
    roleLabel: "Service des Urgences",
    subtext: "CNHU & Hôpitaux Zone",
    icon: Stethoscope,
    color: "text-red-600",
    bg: "bg-red-500/10",
  },
  {
    role: "ASC" as UserRole,
    name: "Agent ASC de Terrain",
    roleLabel: "Santé Communautaire",
    subtext: "16 000 ASC en PWA",
    icon: Activity,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    role: "PATIENT" as UserRole,
    name: "Espace Patient",
    roleLabel: "Carnet HL7 FHIR",
    subtext: "Assuré ARCH & NPI",
    icon: HeartHandshake,
    color: "text-pink-600",
    bg: "bg-pink-500/10",
  },
  {
    role: "PHARMACIE" as UserRole,
    name: "Officine Conventionnée",
    roleLabel: "Dispensation Sécurisée",
    subtext: "Scan QR & ARCH 100%",
    icon: QrCode,
    color: "text-sky-600",
    bg: "bg-sky-500/10",
  },
];

export default function HomePage(): ReactNode {
  const { loginAs } = useAuth();

  return (
    <main id="main-content" className="flex flex-1 flex-col overflow-x-hidden w-full max-w-full bg-[#f6f8fb] text-slate-900">
      {/* 1. HERO SECTION INSTITUTIONNELLE SPACIEUSE ET SOLENNELLE */}
      <section className="relative w-full pt-8 pb-12 sm:pt-16 sm:pb-24 px-4 sm:px-8 lg:px-12 border-b border-slate-200/90 bg-white overflow-hidden">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16">
            {/* Texte Gauche : Copywriter institutionnel humain, rigoureux et direct */}
            <FadeIn className="flex flex-col gap-4 sm:gap-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#0a3764]/20 bg-[#0a3764]/5 px-3 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-[#0a3764] shadow-xs max-w-full overflow-hidden">
                <span className="h-2 w-2 rounded-full bg-[#008751] animate-pulse shrink-0" />
                <span className="uppercase tracking-wider truncate">République du Bénin • Système National d&apos;Information Sanitaire</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] sm:leading-[1.12] tracking-tight text-slate-900">
                BENINVIE <br />
                <span className="text-[#0a3764]">
                  Chaque seconde compte.
                </span>{" "}
                <br />
                <span className="text-slate-800 text-lg sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  Zéro refus de soin pour motif financier.
                </span>
              </h1>

              <p className="max-w-[54ch] text-xs sm:text-base md:text-lg leading-relaxed text-slate-700">
                Le portail régalien de santé numérique de la République du Bénin. Il unifie le déverrouillage d&apos;urgence vitale sans caution (<strong>Bris de Glace</strong>), le réseau transfusionnel <strong>HEMORA</strong> adossé au CNTS, le carnet de santé <strong>HL7 FHIR</strong> indexé sur le NPI ANIP et la régulation de la pharmacopée traditionnelle béninoise (<strong>MTA</strong>).
              </p>

              {/* Actions Métier Directes (Full width on mobile, stacked nicely) */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2 w-full">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0a3764] hover:bg-[#082a4d] px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#0a3764]/20 transition-all active:scale-95 text-center"
                >
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>ESPACE PROFESSIONNEL & CITOYEN</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>

                <Link
                  href="/projects"
                  className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition-all hover:border-[#0a3764]/50 text-center"
                >
                  <Droplet className="h-4 w-4 text-red-600 shrink-0" />
                  <span>Consoles HEMORA & Urgences</span>
                </Link>

                <Link
                  href="/projects?module=scenario"
                  className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-4 sm:px-5 py-3 text-xs font-bold text-amber-900 transition-colors text-center"
                >
                  <Compass className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>Scénario Bio à Kalalé</span>
                </Link>
              </div>

              {/* Références Réglementaires Officielles */}
              <div className="pt-4 border-t border-slate-200/90 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-6 text-[11px] sm:text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#008751] shrink-0" /> Loi 2017-20 APDP
                </span>
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ffbe00] shrink-0" /> Régulation ARS
                </span>
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0a3764] shrink-0" /> Référentiel NPI ANIP
                </span>
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#eb0000] shrink-0" /> Urgences 136
                </span>
              </div>
            </FadeIn>

            {/* Console Télémétrique Droite */}
            <ScaleUnblur className="lg:col-span-5 flex justify-center w-full mt-4 lg:mt-0">
              <div className="relative aspect-square w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[440px] rounded-3xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-xl overflow-hidden">
                <BmmTelemetryRadar />
              </div>
            </ScaleUnblur>
          </div>
        </div>
      </section>

      {/* Ligne Tricolore Républicaine */}
      <div className="flex h-1.5 w-full">
        <div className="w-1/3 bg-[#008751]" />
        <div className="w-1/3 bg-[#ffbe00]" />
        <div className="w-1/3 bg-[#eb0000]" />
      </div>

      {/* 2. SECTION EXACTE INSPIRÉE DE L'ARCHITECTURE ANIP : "Nos services en ligne" */}
      <section className="w-full py-12 sm:py-20 px-4 sm:px-8 lg:px-12 bg-[#f6f8fb]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0a3764]/10 px-4 py-1 text-xs font-bold text-[#0a3764] mb-3 border border-[#0a3764]/20">
              Guichet Unique de la Santé Publique
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0a3764] tracking-tight">
              Nos services en ligne
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
              Accédez directement aux actes cliniques dématérialisés, à la traçabilité transfusionnelle et aux droits de couverture garantis par l&apos;État béninois.
            </p>
          </FadeIn>

          {/* Grille de Cartes ANIP Élargie (Fluid Mobile -> Tablette -> Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {SERVICES_EN_LIGNE.map((srv) => {
              const Icon = srv.icon;
              return (
                <Link
                  key={srv.id}
                  href={srv.link}
                  className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#0a3764]/50 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-[#eaf2f9] text-[#0a3764] flex items-center justify-center shrink-0 group-hover:bg-[#0a3764] group-hover:text-white transition-colors duration-200 shadow-xs">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 truncate max-w-[180px]">
                        {srv.category}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0a3764] transition-colors leading-snug">
                      {srv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 leading-relaxed">
                      {srv.subtitle}
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="block font-bold text-slate-900 font-mono text-[11px]">
                        {srv.tarif}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-medium">
                        Délai : {srv.delai}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 font-bold text-[#0a3764] group-hover:translate-x-1 transition-transform">
                      <span>Accéder</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bouton "Tout voir" (Style ANIP Ambré/Ocre Authentique) */}
          <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center gap-2 text-center">
            <Link
              href="/projects"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#f0a945] hover:bg-[#e09833] px-8 sm:px-9 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#f0a945]/20 transition-all duration-200 active:scale-95"
            >
              <span>Tout voir</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <span className="text-[11px] text-slate-500 font-medium px-4">
              Consultez l&apos;ensemble des consoles d&apos;urgence, modules régionaux et passerelles GSM
            </span>
          </div>
        </div>
      </section>

      {/* 3. BARRE D'INDICATEURS NATIONAUX EN DIRECT (Large, aérée et haute visibilité) */}
      <section className="w-full border-y border-slate-200 bg-white py-10 sm:py-14 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header de la télémétrie */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#008751]"></span>
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-800">
                Télémétrie Opérationnelle Nationale • Surveillance Sanitaire en Temps Réel
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono">
              Source : CNTS • ANIP • Ministère de la Santé (Actualisé en continu)
            </span>
          </div>

          {/* 4 Métriques Clés Spacieuses (Fluide: 1 col mobile -> 2 tablette -> 4 desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="flex flex-col p-4 sm:p-5 rounded-2xl bg-[#f6f8fb] border border-slate-200/90">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0a3764] tracking-tight font-mono">
                77
              </span>
              <span className="text-xs uppercase font-bold text-slate-900 mt-2">
                Communes Interconnectées
              </span>
              <span className="text-xs text-slate-600 mt-1">
                12 départements maillés via le référentiel sanitaire IASO.
              </span>
            </div>

            <div className="flex flex-col p-4 sm:p-5 rounded-2xl bg-[#f6f8fb] border border-slate-200/90">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#008751] tracking-tight font-mono">
                16 000
              </span>
              <span className="text-xs uppercase font-bold text-slate-900 mt-2">
                ASC Équipés en PWA
              </span>
              <span className="text-xs text-slate-600 mt-1">
                Agents communautaires habilités en mode hors-ligne.
              </span>
            </div>

            <div className="flex flex-col p-4 sm:p-5 rounded-2xl bg-[#f6f8fb] border border-slate-200/90">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#eb0000] tracking-tight font-mono">
                0 FCFA
              </span>
              <span className="text-xs uppercase font-bold text-slate-900 mt-2">
                Caution en Urgence Vitale
              </span>
              <span className="text-xs text-slate-600 mt-1">
                Décret d&apos;État : Zéro refus d&apos;admission hospitalière.
              </span>
            </div>

            <div className="flex flex-col p-4 sm:p-5 rounded-2xl bg-[#f6f8fb] border border-slate-200/90">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#f0a945] tracking-tight font-mono">
                &lt; 45 km
              </span>
              <span className="text-xs uppercase font-bold text-slate-900 mt-2">
                Matching Géodésique
              </span>
              <span className="text-xs text-slate-600 mt-1">
                Calcul Haversine SF-3 & acheminement Zémidjan garanti.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION LES 5 PILIERS STRATÉGIQUES NATIONAUX (Wide & High Contrast) */}
      <section id="piliers" className="w-full py-14 sm:py-22 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <FadeIn className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0a3764]/10 px-4 py-1.5 text-xs font-bold text-[#0a3764] mb-3 border border-[#0a3764]/20">
            Cadre de Souveraineté Sanitaire 2026-2030
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Les 5 Piliers Stratégiques de la Plateforme
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Une infrastructure régalienne conçue pour répondre aux réalités du terrain béninois, de l&apos;hôpital universitaire de Cotonou aux hameaux ruraux de Kalalé.
          </p>
        </FadeIn>

        {/* Grille des Piliers : 1 col mobile -> 2 tablette -> 3 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {PILLIERS.map((pil) => {
            const Icon = pil.icon;
            return (
              <div
                key={pil.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white hover:border-[#0a3764]/40 p-5 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-[#eaf2f9] border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs shrink-0">
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${pil.accent}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 truncate max-w-[170px]">
                      {pil.badge}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    {pil.referenceLegale}
                  </span>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0a3764] transition-colors leading-snug">
                    {pil.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {pil.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{pil.facility}</span>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0a3764]">
                  <Link href={pil.link} className="inline-flex min-h-[44px] items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explorer le dispositif</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ACCÈS DIRECT PAR ACTEUR (Grille Ergonomique) */}
      <section className="w-full py-14 sm:py-20 px-4 sm:px-8 lg:px-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Accès Dédié par Profil Métier Habilité
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Sélectionnez votre espace d&apos;exercice pour ouvrir votre session selon vos prérogatives institutionnelles.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-4">
            {ACTORS_SHORTCUTS.map((act, index) => {
              const Icon = act.icon;
              const isLastOdd = index === ACTORS_SHORTCUTS.length - 1;
              return (
                <button
                  key={act.role}
                  onClick={() => loginAs(act.role)}
                  className={`min-h-[44px] p-3 sm:p-5 rounded-2xl border border-slate-200/90 bg-[#f6f8fb] hover:border-[#0a3764]/50 hover:bg-white text-left transition-all duration-200 flex flex-col justify-between gap-2.5 sm:gap-4 group shadow-xs hover:shadow-md cursor-pointer overflow-hidden ${
                    isLastOdd ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl ${act.bg} flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className={`h-5 w-5 ${act.color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-[#0a3764] transition-colors leading-snug">
                      {act.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 block mt-1 truncate">
                      {act.roleLabel}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                      {act.subtext}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. FOOTER OFFICIEL CALQUÉ SUR LE MODÈLE ANIP & GOUVERNEMENTAL */}
      <footer className="w-full bg-[#1b232d] text-white py-12 sm:py-14 px-4 sm:px-8 lg:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">
          <div className="grid grid-cols-1 md:grid-cols-3 items-start justify-between gap-8 pb-8 sm:pb-10 border-b border-white/10">
            {/* Colonne Gauche : Eservices & Ligne Verte */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Services Sanitaires Nationaux
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Plateforme opérée sous l&apos;égide conjointe du Ministère de la Santé, de l&apos;ANIP et de l&apos;Autorité de Régulation du Secteur de la Santé (ARS).
              </p>
              <div className="mt-2 flex items-center gap-2">
                <a
                  href="tel:136"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
                >
                  <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                  <span>Ligne d&apos;Urgence 136 (Gratuit 24/7)</span>
                </a>
              </div>
            </div>

            {/* Centre : Identité Républicaine */}
            <div className="flex flex-col items-start md:items-center text-left md:text-center">
              <span className="text-sm font-bold text-white tracking-wide">
                BENINVIE — République du Bénin
              </span>
              <span className="text-xs text-slate-300 mt-1">
                Direction des Systèmes d&apos;Information Sanitaire (DSIS)
              </span>
              <div className="mt-3 flex h-[4px] w-32 rounded-full overflow-hidden">
                <div className="w-1/3 bg-[#008751]" />
                <div className="w-1/3 bg-[#ffbe00]" />
                <div className="w-1/3 bg-[#eb0000]" />
              </div>
              <span className="text-[11px] text-slate-400 mt-2">
                Fraternité • Justice • Travail
              </span>
            </div>

            {/* Colonne Droite : Liens Rapides & Support */}
            <div className="flex flex-col items-start md:items-end gap-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Réseaux & Signalement
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/projects?module=matching"
                  className="min-h-[40px] inline-flex items-center rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-slate-200 transition-colors font-medium"
                >
                  Matching HEMORA
                </Link>
                <Link
                  href="/dashboard/apdp"
                  className="min-h-[40px] inline-flex items-center rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-slate-200 transition-colors font-medium"
                >
                  Registre APDP
                </Link>
              </div>
              <p className="text-[11px] text-slate-400 text-left md:text-right">
                Assistance technique et médicale : support.sante@gouv.bj
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p className="text-center sm:text-left">
              © 2026 Système d&apos;Information Sanitaire Intégré du Bénin — Tous droits réservés.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              <Link href="/login" className="hover:text-white transition-colors">
                Protection des Données (Loi 2017-20)
              </Link>
              <span>•</span>
              <Link href="/projects" className="hover:text-white transition-colors">
                Banques de Sang CNTS
              </Link>
              <span>•</span>
              <Link href="/dashboard/ars" className="hover:text-white transition-colors">
                Pharmacopée MTA
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
